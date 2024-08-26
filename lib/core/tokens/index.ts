import crypto from "crypto";
import { customAlphabet } from "nanoid";

import prisma from "@/prisma";
import type { DeleteTokenInput } from "./token.input";

function generateToken() {
  const alphabet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const nanoid = customAlphabet(alphabet, 32);

  return nanoid();
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export const getToken = async (userId: string) => {
  return await prisma.token.findFirst({ where: { userId } });
};

export const createToken = async (userId: string) => {
  const generatedToken = generateToken();

  const newToken = await prisma.token.create({
    data: {
      token: hashToken(generatedToken),
      userId,
    },
  });

  return { ...newToken, token: generatedToken };
};

export const deleteToken = async (userId: string, input: DeleteTokenInput) => {
  return await prisma.token.delete({
    where: {
      id: input.id,
      userId,
    },
  });
};
