"use server";

import { shortenLinkWithAutoAlias } from "@/lib/core/links";
import { auth } from "@clerk/nextjs/server";

export const createQuickLink = async (url: string) => {
  const { userId } = auth();
  await shortenLinkWithAutoAlias(userId!, { url });
};
