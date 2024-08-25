"use server";

import {
  addDomainToUserAccount,
  checkDomainStatus,
  deleteDomainAndAssociatedLinks,
} from "@/lib/core/domains";
import { auth } from "@clerk/nextjs/server";

export const createDomain = async (domain: string) => {
  const { userId } = auth();
  return await addDomainToUserAccount(userId!, { domain });
};

export const deleteDomain = async (domainId: string) => {
  const { userId } = auth();
  return await deleteDomainAndAssociatedLinks(userId!, domainId);
};

export const checkStatus = async (domain: string) => {
  const { userId } = auth();
  return await checkDomainStatus(userId!, { domain });
};
