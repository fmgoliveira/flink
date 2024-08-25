"use client";

import BarList, { SingleTabBarList } from "./_components/bar-list";

type RefererStatsProps = {
  referersRecords: Record<string, number>;
  totalClicks: number;
  className?: string;
};

export function RefererStats({
  referersRecords,
  totalClicks,
  className,
}: RefererStatsProps) {
  const refererRecordsAsArray = converRecordToArray(referersRecords);

  return (
    <BarList.BarListTitle
      title="Referers"
      description="Top referrers by number of clicks"
      className={className}
    >
      <SingleTabBarList records={refererRecordsAsArray} totalClicks={totalClicks} />
    </BarList.BarListTitle>
  );
}

function converRecordToArray(records: Record<string, number>) {
  return Object.entries(records).map(([name, clicks]) => ({
    name,
    clicks: +clicks,
  }));
}
