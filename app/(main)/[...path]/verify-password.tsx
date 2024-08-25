"use server";

import { verifyLinkPassword } from "@/lib/core/links";
import { auth } from "@clerk/nextjs/server";

export const verifyPassword = async (
  input: { id: string; password: string },
  headers: Headers
) => {
  const { userId } = auth();
  if (!userId) return null;

  const result = await verifyLinkPassword(userId, headers, input);

  return result;
};
