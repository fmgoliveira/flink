"use server";

import { getCustomDomainsForUser } from "@/lib/core/domains";
import { checkAliasAvailability, createLink } from "@/lib/core/links";
import { CreateLinkInput } from "@/lib/core/links/link.input";
import { auth } from "@clerk/nextjs/server";

export const createLinkHook = async (input: CreateLinkInput) => {
  const { userId } = auth();
  const result = await createLink(userId!, input);
  return result;
};

export const getDomains = async () => {
  const { userId } = auth();

  const domains = await getCustomDomainsForUser(userId!);
  return domains;
};

export const checkAliasAvailabilityHook = async (input: {
  alias: string;
  domain: string;
}) => {
  const result = checkAliasAvailability(input);
  return result;
};
