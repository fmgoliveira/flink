import { Crown, Fingerprint, Globe, MousePointerClick } from "lucide-react";

import { aggregateVisits } from "@/lib/core/analytics/utils";
import { getLinkVisits } from "@/lib/core/links";
import { auth } from "@clerk/nextjs/server";
import { LineChart } from "./_components/line-chart";
import QuickInfoCard from "./_components/quick-info-card";
import { CountriesAndCitiesStats } from "./countries-and-cities-stats";
import { UserAgentStats } from "./user-agent-stats";
import { RefererStats } from "./referer-stats";

type LinksAnalyticsPageProps = {
  params: {
    alias: string;
  };
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function LinkAnalyticsPage({
  params,
  searchParams,
}: LinksAnalyticsPageProps) {
  const { userId } = auth();

  const { totalVisits, uniqueVisits, topCountry, referers, topReferrer } =
    await getLinkVisits(userId!, {
      alias: params.alias,
      domain:
        (searchParams?.domain as string) ??
        process.env.NEXT_PUBLIC_SHORT_DOMAIN!,
    });

  const aggregatedVisits = aggregateVisits(totalVisits, uniqueVisits);

  return (
    <div className="mx-auto">
      <div className="flex flex-col items-center justify-between md:flex-row">
        <h1 className="cursor-pointer font-semibold leading-tight text-primary hover:underline md:text-2xl">
          {searchParams?.domain}/{params.alias}
        </h1>
      </div>

      {/* quick info cards */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-10 md:grid-cols-4">
        <QuickInfoCard
          title="Total Visits"
          value={totalVisits.length}
          icon={<MousePointerClick className="size-4" />}
        />
        <QuickInfoCard
          title="Unique Visits"
          value={uniqueVisits.length}
          icon={<Fingerprint className="size-4" />}
        />
        <QuickInfoCard
          title="Top Country"
          value={topCountry}
          icon={<Globe className="size-4" />}
        />
        <QuickInfoCard
          title="Top Referrer"
          value={topReferrer}
          icon={<Crown className="size-4" />}
        />
      </div>

      <div className="mt-4 md:mt-6">
        <LineChart
          clicksPerDate={aggregatedVisits.clicksPerDate}
          uniqueClicksPerDate={aggregatedVisits.uniqueClicksPerDate ?? {}}
          className="h-96"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-6 md:grid-cols-10">
        <CountriesAndCitiesStats
          citiesRecords={aggregatedVisits.clicksPerCity}
          countriesRecords={aggregatedVisits.clicksPerCountry}
          continentsRecords={aggregatedVisits.clicksPerContinent}
          totalClicks={totalVisits.length}
        />

        <UserAgentStats
          clicksPerBrowser={aggregatedVisits.clicksPerBrowser}
          clicksPerDevice={aggregatedVisits.clicksPerDevice}
          clicksPerModel={aggregatedVisits.clicksPerModel}
          clicksPerOS={aggregatedVisits.clicksPerOS}
          totalClicks={totalVisits.length}
        />

        <RefererStats
          className="md:col-span-10"
          referersRecords={aggregatedVisits.clicksPerReferer}
          totalClicks={totalVisits.length}
        />
      </div>
    </div>
  );
}
