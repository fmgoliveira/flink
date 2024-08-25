"use client";

import { Card } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

type BarListProps = {
  views: {
    name: string;
    records: {
      name: string;
      clicks: number;
    }[];
  }[];
  totalClicks: number;
};

type SingleTabBarListProps = {
  records: {
    name: string;
    clicks: number;
  }[];
  totalClicks: number;
};

const chartConfig = {
  name: {
    label: "Name",
  },
} satisfies ChartConfig;

export function SingleTabBarList({
  records,
  totalClicks,
}: SingleTabBarListProps) {
  records.sort((a, b) => b.clicks - a.clicks);

  return records.length === 0 ? (
    <div className="flex items-center justify-center w-full h-full min-h-64">
      <p className="italic text-neutral-400 text-sm">No data available</p>
    </div>
  ) : (
    <ChartContainer config={chartConfig} className="h-64">
      <BarChart
        accessibilityLayer
        data={records}
        layout="vertical"
        margin={{ right: 16 }}
        barGap={4}
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
          hide
        />
        <XAxis dataKey="clicks" type="number" hide />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Bar
          dataKey="clicks"
          layout="horizontal"
          fill="hsl(var(--chart-1))"
          maxBarSize={48}
          radius={[0, 6, 6, 0]}
        >
          <LabelList
            dataKey="name"
            position="insideLeft"
            offset={8}
            className="fill-neutral-200 font-semibold"
            fontSize={12}
          />
          <LabelList
            dataKey="clicks"
            position="right"
            offset={8}
            className="fill-foreground"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export function BarList({ views, totalClicks }: BarListProps) {
  views.map(({ records }) => records.sort((a, b) => b.clicks - a.clicks));

  const defaultView = views[0].name;

  return (
    <>
      <Tabs defaultValue={defaultView} className="w-full">
        <TabsList>
          {views.map(({ name }) => (
            <TabsTrigger key={name} value={name}>
              {name === "os"
                ? "OS"
                : name.charAt(0).toUpperCase() + name.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
        {views.map(({ name, records }) => (
          <TabsContent key={name} value={name}>
            <SingleTabBarList records={records} totalClicks={totalClicks} />
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}

type BarListTitleProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
};

function BarListTitle({
  title,
  description,
  children,
  className,
}: BarListTitleProps) {
  return (
    <Card
      className={cn(
        "flex h-max flex-col gap-4 rounded-md p-6 md:col-span-5",
        className
      )}
    >
      <div>
        <h1 className="text-xl font-semibold leading-tight text-neutral-300">
          {title}
        </h1>
        <p className="text-sm text-neutral-500">{description}</p>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </Card>
  );
}

BarList.BarListTitle = BarListTitle;
export default BarList;
