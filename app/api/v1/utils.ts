import crypto from "crypto";
import prisma from "@/prisma";

export async function validateAndGetToken(apiKey: string | null) {
  if (!apiKey) return null;
  const hash = crypto.createHash("sha256").update(apiKey).digest("hex");
  const existingToken = await prisma.token.findFirst({
    where: { token: hash },
  });

  if (!existingToken) return null;

  return existingToken;
}
