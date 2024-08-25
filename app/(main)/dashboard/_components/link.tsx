"use client";

import { CopyIcon, CornerDownRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { copyToClipboard, daysSinceDate } from "@/lib/utils";

import { LinkActions } from "./link-actions";
import { LinkSecurityStatusTooltip } from "./link-security-status-tooltip";

import { Link as LinkType, LinkVisit } from "@prisma/client";

type LinkProps = {
  link: LinkType & { visits: LinkVisit[] };
};

const Link = ({ link }: LinkProps) => {
  const router = useRouter();

  const daysSinceLinkCreation = daysSinceDate(new Date(link.createdAt!));

  return (
    <div className="flex items-center justify-between rounded-md bg-neutral-900 px-6 py-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div
            className="flex cursor-pointer items-center text-primary hover:underline"
            onClick={() =>
              router.push(
                `/dashboard/analytics/${link.alias}?domain=${link.domain}`
              )
            }
          >
            <LinkStatus disabled={link.disabled ?? false} />
            <LinkSecurityStatusTooltip link={link} />
            {link.domain}/{link.alias}
          </div>
          <div
            className="hover:animate-wiggle-more flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-neutral-950"
            onClick={async () => {
              await copyToClipboard(`https://${link.domain}/${link.alias}`);
            }}
          >
            <CopyIcon className="h-3 w-3" />
          </div>
        </div>
        <p className="text-sm text-neutral-400 ml-10">
          <CornerDownRightIcon className="h-4 w-4 mr-1 mb-1 inline" />
          <span className="cursor-pointer text-neutral-200 hover:underline">
            {link.url}
          </span>
          <span className="mx-1.5 text-neutral-700">•</span>
          <span>
            {daysSinceLinkCreation === 0
              ? "Today"
              : `${daysSinceLinkCreation}d`}
          </span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge
          variant="secondary"
          className="rounded-md bg-neutral-800 transition-all duration-500 hover:scale-110 hover:cursor-pointer"
          onClick={() => router.push(`/dashboard/analytics/${link.alias}`)}
        >
          {link.visits.length}
          <span className="ml-0.5 hidden md:inline">visits</span>
          <span className="ml-0.5 inline md:hidden">v</span>
        </Badge>
        <LinkActions link={link} />
      </div>
    </div>
  );
};
export default Link;

function LinkStatus({ disabled }: { disabled: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 ${
        disabled ? "text-red-500" : "text-blue-500"
      }`}
    >
      {disabled ? (
        <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-red-400"></span>
      ) : (
        <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-green-400"></span>
      )}
    </div>
  );
}
