import prisma from "@/prisma";
import { PrismaClient } from "@prisma/client";
import { CreateCustomDomainInput } from "./domains.input";
import {
  VercelConfigResponse,
  VercelDomainResponse,
  VerificationDetails,
} from "./types";
import {
  addDomainToVercelProject,
  deleteDomainFromVercelProject,
} from "./utils";

export async function addDomainToUserAccount(
  userId: string,
  input: CreateCustomDomainInput
) {
  const existingDomain = await prisma.customDomain.findFirst({
    where: { domain: input.domain },
  });

  if (existingDomain) throw new Error("This domain is already in use");

  const domain = input.domain
    .replace("http://", "")
    .replace("https://", "")
    .replace("www.", "");

  try {
    const response = await addDomainToVercelProject(domain);

    const verificationChallenges = response.verificationChallenges;

    // for a verification challenge that has a type of "TXT", change the domain to be just
    // _vercel

    const verificationDetails = verificationChallenges.map((challenge) => {
      if (challenge.type === "TXT") {
        return {
          type: challenge.type,
          domain: "_vercel",
          value: challenge.value,
        };
      }

      return challenge;
    });

    let wellConfigured;

    if (response.verified) {
      // the domain is verified so let's check if it's misconfigured
      const response = await fetch(
        `https://api.vercel.com/v6/domains/${domain}/config?teamId=${process.env.VERCEL_TEAM_ID}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.VERCEL_AUTH_BEARER_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = (await response.json()) as VercelConfigResponse;

      if (data.misconfigured) {
        wellConfigured = false;
      } else {
        wellConfigured = true;
      }
    }

    await prisma.customDomain.create({
      data: {
        userId,
        domain,
        status: wellConfigured ? "active" : "pending",
        verificationDetails: verificationDetails,
      },
    });
  } catch (error) {
    throw new Error("Failed to add domain to Vercel project");
  }

  return { success: true };
}

export async function getCustomDomainsForUser(userId: string) {
  const customDomains = await prisma.customDomain.findMany({
    where: { userId },
  });

  return customDomains;
}

export async function deleteDomainAndAssociatedLinks(
  userId: string,
  domainId: string
) {
  const domain = await prisma.customDomain.findFirst({
    where: {
      id: domainId,
      userId,
    },
  });

  if (!domain)
    throw new Error(
      "Domain not found or you don't have permission to delete it"
    );

  // Start a transaction to ensure all operations succeed or fail together
  return await prisma.$transaction(async (tx) => {
    const linksToDelete = await tx.link.findMany({
      where: { domain: domain.domain },
    });

    const linkIds = linksToDelete.map((link) => link.id);

    // delete all link visits
    if (linkIds.length > 0)
      await tx.linkVisit.deleteMany({ where: { linkId: { in: linkIds } } });

    // delete all links
    await tx.link.deleteMany({ where: { id: { in: linkIds } } });

    // Delete the domain itself
    await tx.customDomain.delete({ where: { id: domainId } });

    await deleteDomainFromVercelProject(domain.domain!);

    return {
      success: true,
      message: "Domain and associated links deleted successfully",
    };
  });
}

export const checkDomainStatus = async (
  userId: string,
  input: { domain: string }
) => {
  const domain = input.domain;

  const [configResponse, domainResponse] = await Promise.all([
    fetch(
      `https://api.vercel.com/v6/domains/${domain}/config?teamId=${process.env.VERCEL_TEAM_ID}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_AUTH_BEARER_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    ),
    fetch(
      `https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain}?teamId=${process.env.VERCEL_TEAM_ID}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_AUTH_BEARER_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    ),
  ]);

  const configData = (await configResponse.json()) as VercelConfigResponse;
  const domainData = (await domainResponse.json()) as VercelDomainResponse;

  if (configData.misconfigured && domainData.verified) {
    const isApex = domainData.name.split(".").length === 2;
    const verificationRecord = configData.misconfigured
      ? null
      : configData.challenges?.find((c) => c.type === "TXT")?.value ?? null;

    let status: "pending" | "active" | "invalid" = "pending";
    const verificationDetails: VerificationDetails = {
      challenges: [],
    };

    // Add TXT challenge if available
    if (verificationRecord) {
      verificationDetails.challenges.push({
        type: "TXT",
        domain: `_vercel`,
        value: verificationRecord,
      });
    }

    // Add A or CNAME challenge based on domain type
    if (isApex) {
      verificationDetails.challenges.push({
        type: "A",
        domain: "@",
        value: "76.76.21.21",
      });
    } else {
      const subdomain = domain.split(".")[0];
      verificationDetails.challenges.push({
        type: "CNAME",
        domain: subdomain!,
        value: "cname.vercel-dns.com",
      });
    }

    if (domainData.verified) {
      status = configData.misconfigured ? "invalid" : "active";
    }

    // Update the database with the new status and verification details

    if (domainData.verified)
      await prisma.customDomain.update({
        where: {
          domain,
          userId,
        },
        data: {
          status,
          verificationDetails: JSON.stringify(verificationDetails.challenges),
        },
      });

    return {
      status,
      verificationChallenges: verificationDetails.challenges,
    };
  }

  if (configData.misconfigured === false) {
    await prisma.customDomain.update({
      where: {
        domain,
        userId,
      },
      data: {
        status: "active",
      },
    });

    return {
      status: "active",
    };
  }

  return {
    status: "invalid",
  };
};
