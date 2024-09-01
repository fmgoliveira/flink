"use server";

import prisma from "@/prisma";
import { Link } from "@prisma/client";
import { waitUntil } from "@vercel/functions";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { logAnalytics } from "../analytics";
import { retrieveDeviceAndGeolocationData } from "../analytics/utils";
import { Cache } from "../cache";
import {
  CreateLinkInput,
  GetLinkByAliasInput,
  GetLinkInput,
  ListLinksInput,
  QuickLinkShorteningInput,
  UpdateLinkInput,
  VerifyPasswordLinkInput,
} from "./link.input";
import { generateShortLink } from "./utils";

const cache = new Cache();

const constructCacheKey = (
  domain: string | null | undefined,
  alias: string
) => {
  return `${domain || process.env.NEXT_PUBLIC_SHORT_DOMAIN}:${alias}`;
};

export const getLinks = async (userId: string, input: ListLinksInput) => {
  const { page, pageSize, orderBy, orderDirection } = input;

  const links = await prisma.link.findMany({
    where: { userId },
    select: {
      id: true,
      createdAt: true,
      disableAfterClicks: true,
      disableAfterDate: true,
      domain: true,
      disabled: true,
      keepPath: true,
      passwordHash: true,
      alias: true,
      url: true,
      userId: true,
      visits: true,
      password: true,
    },
    orderBy:
      orderBy === "totalClicks"
        ? {
            visits: {
              _count: orderDirection,
            },
          }
        : {
            createdAt: orderDirection,
          },
    take: pageSize || 10,
    skip: (page - 1) * (pageSize || 10),
  });

  const allLinks = await prisma.link.findMany({
    where: { userId },
    select: {
      id: true,
      visits: true,
    },
  });

  const totalLinks = allLinks.length ?? 0;
  const totalClicks = allLinks.map((l) => l.visits).flat().length ?? 0;

  return {
    links,
    totalLinks,
    totalClicks,
    currentPage: page,
    totalPages: Math.ceil(totalLinks / pageSize),
  };
};

export const getLink = async (input: GetLinkInput) => {
  return await prisma.link.findFirst({
    where: {
      id: input.id,
    },
    select: {
      id: true,
      createdAt: true,
      disableAfterClicks: true,
      disableAfterDate: true,
      disabled: true,
      keepPath: true,
      passwordHash: true,
      alias: true,
      url: true,
      userId: true,
      visits: true,
    },
  });
};

export const getLinkByAlias = async (input: GetLinkByAliasInput) => {
  return await prisma.link.findFirst({
    where: {
      alias: input.alias,
      domain: input.domain,
    },
    select: {
      id: true,
      createdAt: true,
      disableAfterClicks: true,
      disableAfterDate: true,
      disabled: true,
      keepPath: true,
      passwordHash: true,
      alias: true,
      url: true,
      userId: true,
      visits: true,
      domain: true,
    },
  });
};

export const createLink = async (userId: string, input: CreateLinkInput) => {
  if (input.alias) {
    if (input.alias.includes(".")) {
      throw new Error("Cannot include periods in alias");
    }

    const domain = input.domain ?? process.env.NEXT_PUBLIC_SHORT_DOMAIN;

    const aliasExists = await prisma.link.findFirst({
      where: {
        alias: input.alias,
        domain,
      },
    });

    if (aliasExists) {
      throw new Error("Alias already exists");
    }
  }

  if (input.password) {
    const passwordHash = await bcrypt.hash(input.password, 10);
    input.password = passwordHash;
  }

  const domain = input.domain ?? process.env.NEXT_PUBLIC_SHORT_DOMAIN;

  const link = await prisma.link.create({
    data: {
      ...input,
      alias: input.alias ?? generateShortLink(),
      userId: userId,
      passwordHash: input.password,
      domain,
    },
  });

  await cache.set(constructCacheKey(link.domain, link.alias), link);

  return link;
};

export const updateLink = async (
  userId: string,
  { id, ...input }: UpdateLinkInput
) => {
  const oldLink = await prisma.link.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!oldLink) return null;

  const updatedLink = await prisma.link.update({
    where: {
      id,
      userId,
    },
    data: input,
  });

  if (input.alias || input.domain) {
    await cache.delete(constructCacheKey(oldLink?.domain, oldLink?.alias));
  }

  await cache.set(
    constructCacheKey(updatedLink.domain, updatedLink.alias),
    updatedLink
  );

  return updatedLink;
};

export const deleteLink = async (userId: string, input: GetLinkInput) => {
  const linkToDelete = await prisma.link.findFirst({
    where: { id: input.id, userId },
  });

  if (!linkToDelete) return null;

  await cache.delete(
    constructCacheKey(linkToDelete.domain, linkToDelete.alias)
  );

  return await prisma.$transaction(async (tx) => {
    await tx.linkVisit.deleteMany({ where: { linkId: linkToDelete.id } });
    await tx.uniqueLinkVisit.deleteMany({ where: { linkId: linkToDelete.id } });
    await tx.link.delete({ where: { id: linkToDelete.id } });

    return linkToDelete;
  });
};

export const retrieveOriginalUrl = async (
  headers: Headers,
  input: GetLinkByAliasInput
) => {
  const { alias, domain } = input;

  let link: Link | undefined | null = await cache.get(
    constructCacheKey(domain, alias)
  );

  if (!link?.alias) {
    link = await prisma.link.findFirst({
      where: {
        alias,
        domain,
      },
    });

    if (!link || link.disabled) return null;
  }

  waitUntil(logAnalytics(headers, prisma, link));

  return link;
};

export const shortenLinkWithAutoAlias = async (
  userId: string,
  input: QuickLinkShorteningInput
) => {
  const insertedLink = await prisma.link.create({
    data: {
      url: input.url,
      alias: generateShortLink(),
      userId,
      domain: process.env.NEXT_PUBLIC_SHORT_DOMAIN,
    },
  });

  if (insertedLink)
    await cache.set(
      constructCacheKey(insertedLink.domain, insertedLink.alias),
      insertedLink
    );

  return insertedLink;
};

export const getLinkVisits = async (
  userId: string,
  input: { alias: string; domain: string }
) => {
  const link = await prisma.link.findFirst({
    where: {
      alias: input.alias,
      userId,
      domain: input.domain,
    },
    select: {
      id: true,
      alias: true,
      visits: true,
      uniqueVisits: true,
    },
  });

  if (!link || link?.visits.length === 0) {
    return {
      totalVisits: [],
      uniqueVisits: [],
      topCountry: "N/A",
      referers: {},
      topReferrer: "N/A",
    };
  }

  const countryVisits = link.visits.reduce((acc, visit) => {
    acc[visit.country!] = (acc[visit.country!] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topCountry = Object.entries(countryVisits).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )[0];

  const referrerVisits = link.visits.reduce((acc, visit) => {
    acc[visit.referer!] = (acc[visit.referer!] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topReferrer = Object.entries(referrerVisits).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )[0];

  return {
    totalVisits: link.visits,
    uniqueVisits: link.uniqueVisits,
    topCountry,
    referers: referrerVisits,
    topReferrer: topReferrer || "Direct",
  };
};

export const toggleLinkStatus = async (userId: string, input: GetLinkInput) => {
  const fetchedLink = await prisma.link.findFirst({
    where: { id: input.id, userId },
  });

  if (!fetchedLink) return null;
  if (!fetchedLink.disabled)
    await cache.delete(
      constructCacheKey(fetchedLink.domain, fetchedLink.alias)
    );

  return await prisma.link.update({
    where: { id: fetchedLink.id, userId },
    data: {
      disabled: !fetchedLink.disabled,
    },
  });
};

export const resetLinkStatistics = async (
  userId: string,
  input: GetLinkInput
) => {
  const fetchedLink = await prisma.link.findFirst({
    where: { id: input.id, userId },
  });

  if (!fetchedLink) return null;

  await prisma.linkVisit.deleteMany({
    where: {
      linkId: fetchedLink.id,
    },
  });

  return fetchedLink;
};

export const verifyLinkPassword = async (
  userId: string,
  headers: Headers,
  input: VerifyPasswordLinkInput
) => {
  const link = await prisma.link.findFirst({
    where: { id: input.id, userId },
  });

  if (!link?.passwordHash) return null;

  const isPasswordCorrect = await bcrypt.compare(
    input.password,
    link.passwordHash
  );

  if (!isPasswordCorrect) return null;

  const deviceDetails = await retrieveDeviceAndGeolocationData(headers);
  const ipHash = crypto
    .createHash("sha256")
    .update(headers.get("x-forwarded-for") ?? "")
    .digest("hex");
  const existingLinkVisit = await prisma.uniqueLinkVisit.findFirst({
    where: {
      linkId: link.id,
      ipHash,
    },
  });

  if (!existingLinkVisit) {
    await prisma.uniqueLinkVisit.create({
      data: {
        linkId: link.id,
        ipHash,
      },
    });
  }

  await prisma.linkVisit.create({
    data: {
      linkId: link.id,
      ...deviceDetails,
    },
  });

  return link;
};

export const changeLinkPassword = async (
  userId: string,
  input: { id: string; password: string }
) => {
  const passwordHash = await bcrypt.hash(input.password, 10);

  const updatedLink = await prisma.link.update({
    where: { id: input.id, userId },
    data: {
      passwordHash,
    },
  });

  await cache.delete(constructCacheKey(updatedLink.domain, updatedLink.alias));

  return updatedLink;
};

export const checkAliasAvailability = async (input: {
  alias: string;
  domain: string;
}) => {
  const existingLink = await prisma.link.findFirst({
    where: { alias: input.alias, domain: input.domain },
  });

  return { isAvailable: !existingLink };
};
