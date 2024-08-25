import { extractData, getUrl } from "@/lib/utils";
import { permanentRedirect } from "next/navigation";
import { NextRequest } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { path?: string[] } }
) => {
  const { alias, path } = extractData(params);
  const url = await getUrl(alias, path);

  return permanentRedirect(url);
};
