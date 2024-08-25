"use client";

import {
  Line,
  CartesianGrid,
  LineChart as RechartsLineChart,
  XAxis,
} from "recharts";

import { Card } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import type { ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  clicks: {
    label: "Clicks",
    color: "#2563eb",
  },
  uniqueClicks: {
    label: "Unique Clicks",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

type LineChartProps = {
  clicksPerDate: Record<string, number>;
  uniqueClicksPerDate: Record<string, number>;
  className?: string;
};

export function LineChart({
  clicksPerDate,
  uniqueClicksPerDate,
  className,
}: LineChartProps) {
  const chartData = Object.entries(clicksPerDate).map(([date, clicks]) => ({
    date,
    clicks,
    uniqueClicks: uniqueClicksPerDate[date],
  }));

  return (
    <Card className="py-8">
      <ChartContainer
        config={chartConfig}
        className="h-48 w-full md:h-96"
      >
        <RechartsLineChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(date: string) => {
              return new Date(date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              });
            }}
          />

          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line dataKey="clicks" stroke="hsl(var(--primary))" strokeWidth={2} />
          <Line dataKey="uniqueClicks" stroke="hsl(var(--chart-3))" strokeWidth={2} />
        </RechartsLineChart>
      </ChartContainer>
    </Card>
  );
}
