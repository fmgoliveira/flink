import type { Metadata } from "next";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import { getLinks } from "@/lib/core/links";
import { auth } from "@clerk/nextjs/server";
import { DashboardSidebar } from "./_components/dashboard-sidebar";
import Links from "./_components/links";
import { PlusIcon } from "lucide-react";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL!),
  title: "Dashboard",
  description: "Manage your links and view analytics",
};

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const page = Number.parseInt(searchParams.page as string) || 1;
  const pageSize = 10;
  const orderBy = searchParams.orderBy as "createdAt" | "totalClicks";
  const orderDirection = searchParams.orderDirection as "desc" | "asc";
  const { userId } = auth();

  const { links, totalLinks, totalPages, currentPage, totalClicks } =
    await getLinks(userId!, {
      page,
      pageSize,
      orderBy,
      orderDirection,
    });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold leading-tight text-neutral-300">
          Links
        </h2>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          <Link href="/dashboard/link/new">Shorten Link</Link>
        </Button>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-11">
        <DashboardSidebar
          numberOfClicks={totalClicks}
          numberOfLinks={totalLinks}
        />
        <div className="col-span-11 md:col-span-7">
          <Links
            links={links}
            totalPages={totalPages}
            currentPage={currentPage}
            totalLinks={totalLinks}
          />
        </div>
      </div>
    </div>
  );
}
