"use server";

import { changeLinkPassword, deleteLink, resetLinkStatistics, toggleLinkStatus, updateLink } from "@/lib/core/links";
import { UpdateLinkInput } from "@/lib/core/links/link.input";
import { auth } from "@clerk/nextjs/server";

export const toggleLink = async (id: string) => {
  const { userId } = auth();
  return await toggleLinkStatus(userId!, { id });
};

export const deleteLinkHook = async (id: string) => {
  const { userId } = auth();
  return await deleteLink(userId!, { id });
};

export const resetLink = async (id: string) => {
  const { userId } = auth();
  return await resetLinkStatistics(userId!, { id });
}

export const updateLinkHook = async (input: UpdateLinkInput) => {
  const { userId } = auth();
  return await updateLink(userId!, input);
}

export const changeLinkPasswordHook = async (id: string, password: string) => {
  const { userId } = auth();
  return await changeLinkPassword(userId!, { id, password });
}