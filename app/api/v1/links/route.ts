import bcrypt from "bcryptjs";
import z from "zod";

import { generateShortLink } from "@/lib/core/links/utils";

import { validateAndGetToken } from "../utils";
import { checkAliasAvailability, createLink } from "@/lib/core/links";

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key");
  const token = await validateAndGetToken(apiKey);
  if (!token)
    return new Response("Invalid or missing API key", { status: 401 });

  const body = await request.json();
  const input = shortenLinkSchema.safeParse(body);

  if (!input.success) {
    return new Response(input.error.message, { status: 400 });
  }

  if (
    input.data.alias &&
    (await checkAliasAvailability({
      alias: input.data.alias,
      domain: input.data.domain || process.env.NEXT_PUBLIC_SHORT_DOMAIN!,
    }))
  ) {
    return new Response("Alias already exists", { status: 400 });
  }

  try {
    const newLink = await createNewLink(input.data, token.userId);
    return new Response(JSON.stringify(newLink), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 400 });
    }
    return new Response("An error occurred", { status: 400 });
  }
}

const shortenLinkSchema = z.object({
  url: z.string().url(),
  expiresAt: z.date().optional(),
  expiresAfter: z.number().optional(),
  alias: z.string().optional(),
  domain: z.string().optional(),
  password: z.string().optional(),
});

async function createNewLink(
  data: z.infer<typeof shortenLinkSchema>,
  userId: string
) {
  // check if there is a password

  if (data.password) {
    const hashedPassword = bcrypt.hashSync(data.password, 10);
    data.password = hashedPassword;
  }

  const newLinkData = {
    url: data.url,
    alias: data.alias ?? generateShortLink(),
    disableAfterClicks: data.expiresAfter,
    disableAfterDate: data.expiresAt ? new Date(data.expiresAt) : undefined,
    passwordHash: data.password,
    userId,
  };

  const newLink = await createLink(userId, newLinkData);
  
  return {
    shortLink: `https://${newLink.domain}/${newLink.alias}`,
    url: newLink.url,
    alias: newLink.alias,
    expiresAt: newLink.disableAfterDate,
    expiresAfter: newLink.disableAfterClicks,
    isProtected: !!newLink.passwordHash,
  };
}
