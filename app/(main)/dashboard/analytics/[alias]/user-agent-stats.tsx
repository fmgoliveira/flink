"use client";

import { useState } from "react";

import BarList from "./_components/bar-list";

type UserAgentStatsProps = {
  clicksPerDevice: Record<string, number>;
  clicksPerOS: Record<string, number>;
  clicksPerBrowser: Record<string, number>;
  clicksPerModel: Record<string, number>;
  totalClicks: number;
};

export function UserAgentStats({
  clicksPerDevice,
  clicksPerOS,
  clicksPerBrowser,
  clicksPerModel,
  totalClicks,
}: UserAgentStatsProps) {
  const deviceRecordsAsArray = converRecordToArray(clicksPerDevice);
  const osRecordsAsArray = converRecordToArray(clicksPerOS);
  const browserRecordsAsArray = converRecordToArray(clicksPerBrowser);
  const modelRecordsAsArray = converRecordToArray(clicksPerModel);

  const [currentView, setCurrentView] = useState<
    "device" | "os" | "browser" | "model"
  >("device");

  const handleViewChange = (view: string) => {
    setCurrentView(view as "device" | "os" | "browser" | "model");
  };

  const recordsMap = [
    {
      name: "device",
      records: deviceRecordsAsArray,
    },
    {
      name: "os",
      records: osRecordsAsArray,
    },
    {
      name: "browser",
      records: browserRecordsAsArray,
    },
    {
      name: "model",
      records: modelRecordsAsArray,
    },
  ];

  return (
    <BarList.BarListTitle
      title="User Agent Statistics"
      description="Top devices, OS, browsers, and models"
    >
      <BarList views={recordsMap} totalClicks={totalClicks} />
    </BarList.BarListTitle>
  );
}

function converRecordToArray(records: Record<string, number>) {
  return Object.entries(records).map(([name, clicks]) => ({
    name,
    clicks: +clicks,
  }));
}
