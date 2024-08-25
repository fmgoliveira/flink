import { getLinkByAlias } from "@/lib/core/links";
import { validateAndGetToken } from "../../utils";

import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { alias: string } }
) {
  const alias = params.alias;
  const domain =
    request.nextUrl.searchParams.get("domain") ||
    process.env.NEXT_PUBLIC_SHORT_DOMAIN!;
  const apiKey = request.headers.get("x-api-key");

  const token = await validateAndGetToken(apiKey);
  if (!token) {
    return new Response("Invalid or missing API key", { status: 401 });
  }

  const retrievedLink = await getLinkByAlias({ alias, domain });
  if (!retrievedLink) {
    return new Response("Link not found", { status: 404 });
  }

  return Response.json(retrievedLink);
}
