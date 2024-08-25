import { aggregateVisits } from "@/lib/core/analytics/utils";

import { getLinkByAlias, getLinkVisits } from "@/lib/core/links";
import { useSearchParams } from "next/navigation";
import { validateAndGetToken } from "../../utils";

export async function GET(
  request: Request,
  { params }: { params: { alias: string } }
) {
  const alias = params.alias;
  const domain =
    useSearchParams().get("domain") || process.env.NEXT_PUBLIC_SHORT_DOMAIN!;
  const apiKey = request.headers.get("x-api-key");

  const token = await validateAndGetToken(apiKey);
  if (!token) {
    return new Response("Invalid or missing API key", { status: 401 });
  }

  const link = await getLinkByAlias({ alias, domain });

  if (!link) {
    return new Response("Link not found", { status: 404 });
  }

  if (link.userId !== token.userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const linkStats = await getLinkVisits(token.userId, { alias, domain });

  const aggregatedVisits = aggregateVisits(
    linkStats.totalVisits,
    linkStats.uniqueVisits
  );

  return Response.json(aggregatedVisits);
}
