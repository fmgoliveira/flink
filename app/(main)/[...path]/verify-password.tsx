"use server";

import { verifyLinkPassword } from "@/lib/core/links";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";

export const verifyPassword = async (input: {
  id: string;
  password: string;
}) => {
  const headersList = headers();
  const { userId } = auth();
  if (!userId) return null;

  const result = await verifyLinkPassword(userId, headersList, input);

  return result;
};
