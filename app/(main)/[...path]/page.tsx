import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { retrieveOriginalUrl } from "@/lib/core/links";
import { LinkPasswordVerification } from "./link-password-verification";

type LinkRedirectionPageProps = {
  params: {
    path: string[];
  };
};

const LinkRedirectionPage = async ({ params }: LinkRedirectionPageProps) => {
  const headersList = headers();
  const incomingDomain =
    headersList.get("x-forwarded-host") ?? headersList.get("host");

  const path =
    params.path.length > 1 ? params.path.slice(1).join("/") : undefined;

  let domain: string;
  if (process.env.VERCEL_URL && incomingDomain !== process.env.STAGING_DOMAIN) {
    domain = incomingDomain ?? process.env.NEXT_PUBLIC_SHORT_DOMAIN!;
  } else {
    domain = process.env.NEXT_PUBLIC_SHORT_DOMAIN!;
  }

  const link = await retrieveOriginalUrl(headersList, {
    alias: params.path[0],
    domain,
  });

  if (!link) return notFound();

  if (link.passwordHash)
    return (
      <LinkPasswordVerification
        id={link.id}
        headers={headersList}
        path={path}
      />
    );

  redirect(link.keepPath ? `${link.url}/${path || ""}` : link.url);
};

export default LinkRedirectionPage;
