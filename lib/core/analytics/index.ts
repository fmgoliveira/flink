"use server";

import { Link, PrismaClient } from "@prisma/client";
import { Cache } from "../cache";
import { parseReferrer } from "../../utils";
import { retrieveDeviceAndGeolocationData } from "./utils";
import crypto from "crypto";

const cache = new Cache();

export async function logAnalytics(
  headers: Headers,
  prisma: PrismaClient,
  link: Link
) {
  if (link.passwordHash) {
    return;
  }

  const deviceDetails = await retrieveDeviceAndGeolocationData(headers);

  await prisma.linkVisit.create({
    data: {
      linkId: link.id,
      ...deviceDetails,
      referer: parseReferrer(headers.get("referer")),
    },
  });

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

  await cache.set(`${link.domain}:${link.alias}`, link);
}
