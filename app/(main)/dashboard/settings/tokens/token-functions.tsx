"use server";

import { createToken, deleteToken } from "@/lib/core/tokens";
import { auth } from "@clerk/nextjs/server";

export const deleteTokenHook = (tokenId: string) => {
  const { userId } = auth();
  return deleteToken(userId!, { id: tokenId });
};

export const createTokenHook = () => {
  const { userId } = auth();
  return createToken(userId!);
};
