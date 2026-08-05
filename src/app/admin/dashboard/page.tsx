"use client";

import { useMemo, useState } from "react";
import { ArrowSeparateVertical } from "iconoir-react";

type RangeKey = "3" | "6";
type TabKey = "revenue" | "subscription";
type BarSeries = {
  label: string;
  color: string;
  values: number[];
};

const ranges: Array<{ label: string; value: RangeKey }> = [
  { label: "Last 3 Months", value: "3" },
  { label: "Last 6 Months", value: "6" },
];

const revenueTabs: Array<{ label: string; value: TabKey }> = [
  { label: "Revenue By Country", value: "revenue" },
  { label: "Subscription Count", value: "subscription" },
];

const monthLabels: Record<RangeKey, string[]> = {
  "3": ["Jan", "Feb", "Mar"],
  "6": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
};

const revenueData: Record<RangeKey, BarSeries[]> = {
  "3": [
    { label: "Country", color: "#EF476F", values: [420, 500, 0] },
    { label: "Country", color: "#FFB229", values: [420, 520, 0] },
    { label: "Country", color: "#C21FCF", values: [280, 420, 0] },
    { label: "Country", color: "#3D4BCC", values: [190, 210, 0] },
    { label: "Country", color: "#303448", values: [150, 180, 350] },
  ],
  "6": [
    { label: "Country", color: "#EF476F", values: [380, 420, 460, 500, 540, 580] },
    { label: "Country", color: "#FFB229", values: [360, 400, 430, 460, 500, 540] },
    { label: "Country", color: "#C21FCF", values: [240, 270, 310, 340, 380, 420] },
    { label: "Country", color: "#3D4BCC", values: [160, 180, 210, 230, 260, 290] },
    { label: "Country", color: "#303448", values: [130, 150, 180, 200, 220, 250] },
  ],
};

const jobData: Record<RangeKey, BarSeries[]> = {
  "3": [
    { label: "Agent", color: "#EF476F", values: [120, 130, 0] },
    { label: "Designers", color: "#FFB229", values: [90, 110, 0] },
    { label: "Photographers", color: "#C21FCF", values: [70, 95, 0] },
    { label: "Designers", color: "#303448", values: [65, 135, 75] },
  ],
  "6": [
    { label: "Agent", color: "#EF476F", values: [110, 125, 140, 150, 160, 175] },
    { label: "Designers", color: "#FFB229", values: [85, 95, 105, 115, 125, 135] },
    { label: "Photographers", color: "#C21FCF", values: [65, 75, 85, 95, 105, 115] },
    { label: "Designers", color: "#303448", values: [55, 65, 75, 85, 95, 105] },
  ],
};

const signupData: Record<RangeKey, BarSeries[]> = {
  "3": [
    { label: "Agencies", color: "#EF476F", values: [110, 130, 0] },
    { label: "Models", color: "#FFB229", values: [85, 95, 0] },
    { label: "Photographers", color: "#C21FCF", values: [70, 90, 0] },
    { label: "Designers", color: "#3D4BCC", values: [55, 70, 0] },
    { label: "Stylists", color: "#303448", values: [65, 85, 70] },
  ],
  "6": [
    { label: "Agencies", color: "#EF476F", values: [100, 110, 125, 135, 145, 155] },
    { label: "Models", color: "#FFB229", values: [75, 82, 90, 98, 106, 115] },
    { label: "Photographers", color: "#C21FCF", values: [62, 68, 75, 82, 90, 98] },
    { label: "Designers", color: "#3D4BCC", values: [48, 55, 60, 68, 75, 82] },
    { label: "Stylists", color: "#303448", values: [58, 64, 70, 78, 85, 92] },
  ],
};

const activityData: Record<RangeKey, BarSeries[]> = {
  "3": [
    { label: "Likes", color: "#EF476F", values: [1050, 640, 55] },
    { label: "Saves", color: "#FFB229", values: [880, 520, 45] },
    { label: "Collab inquiries", color: "#C21FCF", values: [720, 410, 35] },
    { label: "Bookings", color: "#3D4BCC", values: [560, 300, 24] },
    { label: "Job Applicatio.", color: "#7181FF", values: [440, 210, 18] },
    { label: "Agency applic.", color: "#303448", values: [0, 0, 12] },
  ],
  "6": [
    { label: "Likes", color: "#EF476F", values: [640, 700, 760, 820, 880, 950] },
    { label: "Saves", color: "#FFB229", values: [520, 570, 620, 670, 720, 780] },
    { label: "Collab inquiries", color: "#C21FCF", values: [410, 445, 480, 520, 560, 600] },
    { label: "Bookings", color: "#3D4BCC", values: [300, 320, 340, 370, 400, 430] },
    { label: "Job Applicatio.", color: "#7181FF", values: [210, 235, 260, 290, 320, 350] },
    { label: "Agency applic.", color: "#303448", values: [90, 105, 120, 140, 160, 180] },
  ],
};

const subscriberSegments = [
  { color: "#EF476F", height: 40 },
  { color: "#C21FCF", height: 15 },
  { color: "#3D4BCC", height: 20 },
  { color: "#FFB229", height: 25 },
];

const subscriberLabels = [
  "NFP",
  "NFP-C",
  "NFP-F",
  "AMP",
  "AMP-C",
  "AMP-F",
  "RSP",
  "RSP-C",
  "RSP-F",
];

const tableRows = [
  ["Product Purchases", "145", "1,240"],
  ["Service Purchases", "89", "740"],
  ["Collabs Initiated", "240", "2,110"],
  ["Collabs Confirmed", "120", "980"],
  ["Jobs Posted", "320", "2,840"],
  ["Job Applications", "450", "3,950"],
  ["Job Bookings", "180", "1,550"],
];

const Card = ({
  title,
  children,
  showTab = false,
  tabs,
  activeTab,
  onTabChange,
}: {
  title?: string;
  children: React.ReactNode;
  showTab?: boolean;
  tabs?: Array<{ label: string; value: TabKey }>;
  activeTab?: TabKey;
  onTabChange?: (value: TabKey) => void;
}) => (
  <section className="rounded-[12px] bg-[#111115] p-4 text-stone-100 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      {title && <h2 className="mb-3 text-sm font-semibold sm:mb-5 sm:text-base">{title}</h2>}
      {showTab && tabs && (
        <div className="mb-2 flex flex-wrap justify-center gap-4 text-[10px] sm:gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTabChange?.(tab.value)}
              className={`pb-1 ${
                activeTab === tab.value
                  ? "border-b border-[#EF476F] text-[#EF476F]"
                  : "text-stone-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </div>
    {children}
  </section>
);

const Legend = ({ series }: { series: BarSeries[] }) => (
  <div className="flex flex-row flex-wrap gap-x-4 gap-y-2 rounded-lg bg-[#00000030] p-2 sm:flex-col sm:flex-nowrap sm:gap-2">
    {series.map((item, index) => (
      <div key={`${item.label}-${index}`} className="flex items-center gap-2">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <span className="whitespace-nowrap text-[10px] text-stone-300">{item.label}</span>
      </div>
    ))}
  </div>
);

const StackBarChart = ({
  months,
  series,
  max,
  ticks,
  barWidth = 28,
}: {
  months: string[];
  series: BarSeries[];
  max: number;
  ticks: string[];
  barWidth?: number;
}) => {
  const totals = months.map((_, index) =>
    series.reduce((sum, item) => sum + item.values[index], 0),
  );

  return (
    <div className="flex flex-col gap-5 sm:grid sm:min-h-[230px] sm:grid-cols-[46px_1fr_auto] sm:gap-5">
      <div className="flex h-[150px] flex-col justify-between text-[10px] text-stone-500 sm:h-[190px]">
        {ticks.map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>
      <div className="-ml-2 flex h-[170px] items-end justify-around gap-3 overflow-x-auto sm:ml-0 sm:h-[220px] sm:gap-8 sm:overflow-visible">
        {months.map((month, monthIndex) => (
          <div key={month} className="flex shrink-0 flex-col items-center gap-2 sm:gap-3">
            <div
              className="flex flex-col-reverse overflow-hidden rounded-t-[4px]"
              style={{
                width: barWidth,
                height: Math.max((totals[monthIndex] / max) * 178, 14),
              }}
            >
              {series.map((item, index) => (
                <span
                  key={`${item.label}-${index}`}
                  style={{
                    backgroundColor: item.color,
                    height: `${(item.values[monthIndex] / totals[monthIndex]) * 100 || 0}%`,
                  }}
                />
              ))}
            </div>
            <span className="text-[10px] text-stone-500">{month}</span>
          </div>
        ))}
      </div>
      <div className="flex items-end sm:mb-4">
        <Legend series={series} />
      </div>
    </div>
  );
};

const GroupedBarChart = ({
  months,
  series,
  max,
  ticks,
}: {
  months: string[];
  series: BarSeries[];
  max: number;
  ticks: string[];
}) => (
  <div className="flex flex-col gap-5 sm:grid sm:min-h-[230px] sm:grid-cols-[46px_1fr_auto] sm:gap-5">
    <div className="flex h-[150px] flex-col justify-between text-[10px] text-stone-500 sm:h-[190px]">
      {ticks.map((tick) => (
        <span key={tick}>{tick}</span>
      ))}
    </div>
    <div className="-ml-2 flex h-[170px] items-end justify-around gap-3 overflow-x-auto sm:ml-0 sm:h-[220px] sm:gap-2 sm:overflow-visible">
      {months.map((month, monthIndex) => (
        <div key={month} className="flex shrink-0 flex-col items-center gap-2 sm:gap-3">
          <div className="flex h-[150px] items-end gap-[1px] sm:h-[178px]">
            {series.map((item, index) => (
              <span
                key={`${item.label}-${index}`}
                className="w-[6px] rounded-t-[3px] sm:w-[8px]"
                style={{
                  backgroundColor: item.color,
                  height: Math.max((item.values[monthIndex] / max) * 178, 4),
                }}
              />
            ))}
          </div>
          <span className="text-[10px] text-stone-500">{month}</span>
        </div>
      ))}
    </div>
    <div className="flex items-end sm:mb-4">
      <Legend series={series} />
    </div>
  </div>
);

export default function Dashboard() {
  const [selectedRange, setSelectedRange] = useState<RangeKey>("3");
  const [activeRevenueTab, setActiveRevenueTab] = useState<TabKey>("revenue");
  const months = useMemo(() => monthLabels[selectedRange], [selectedRange]);
  const isThreeMonth = selectedRange === "3";

  const revenueChartSeries =
    activeRevenueTab === "revenue"
      ? revenueData[selectedRange]
      : signupData[selectedRange];

  const revenueChartMax = activeRevenueTab === "revenue" ? 2200 : 520;
  const revenueChartTicks =
    activeRevenueTab === "revenue"
      ? ["€ 2,000", "€ 1,500", "€ 1,000", "€ 500", "€ 0"]
      : ["500", "400", "300", "200", "100", "0"];

  return (
    <main className="w-full text-stone-100">
      <div className="mb-5 flex justify-end">
        <label className="relative block w-full max-w-[210px]">
          <select
            value={selectedRange}
            onChange={(event) => setSelectedRange(event.target.value as RangeKey)}
            className="h-9 w-full appearance-none rounded-[6px] border border-[#332C2D] bg-[#0F0F13] px-4 pr-9 text-[12px] text-stone-300 outline-none focus:border-[#EF476F]"
          >
            {ranges.map((range) => (
              <option key={range.value} value={range.value} className="bg-[#111115]">
                {range.label}
              </option>
            ))}
          </select>
          <ArrowSeparateVertical className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
        </label>
      </div>

      <div
        className={
          isThreeMonth
            ? "grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-1 xl:grid-cols-2"
            : "grid grid-cols-1 gap-4 sm:gap-5"
        }
      >
        <Card
          title={activeRevenueTab === "revenue" ? "Revenue" : "Subscription Count"}
          showTab
          tabs={revenueTabs}
          activeTab={activeRevenueTab}
          onTabChange={setActiveRevenueTab}
        >
          <StackBarChart
            months={months}
            series={revenueChartSeries}
            max={revenueChartMax}
            ticks={revenueChartTicks}
          />
        </Card>

        <Card title="Jobs" showTab={false}>
          <StackBarChart
            months={months}
            series={jobData[selectedRange]}
            max={520}
            ticks={["500", "400", "300", "200", "100", "0"]}
          />
        </Card>

        <Card title="Users / Signups" showTab={false}>
          <StackBarChart
            months={months}
            series={signupData[selectedRange]}
            max={520}
            ticks={["500", "400", "300", "200", "100", "0"]}
          />
        </Card>

        <Card title="Activity" showTab={false}>
          <GroupedBarChart
            months={months}
            series={activityData[selectedRange]}
            max={1500}
            ticks={["1,500", "1,000", "500", "0"]}
          />
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-5 sm:gap-5 lg:grid-cols-1 xl:grid-cols-2">
        <Card title="Subscribers" showTab={false}>
          <div className="grid gap-6 sm:gap-8 md:grid-cols-[auto_1fr] mt-3 sm:mt-5">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex h-[160px] w-8 shrink-0 flex-col overflow-hidden rounded-[8px] sm:h-[180px] sm:w-10">
                {subscriberSegments.map((segment, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: segment.color,
                      height: `${segment.height}%`,
                    }}
                  />
                ))}
              </div>
              <div className="flex h-[160px] flex-col justify-between text-[11px] text-stone-300 sm:h-[180px] sm:text-[13px]">
                {subscriberLabels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end">
              <div className="w-fit rounded-[8px] bg-black/25 px-5 py-4 text-center sm:px-5 sm:py-4">
                <h3 className="mb-3 text-sm font-semibold sm:text-base">
                  Subscription Choice
                </h3>
                <div className="mb-3 flex justify-center gap-6 sm:gap-9">
                  <div>
                    <p className="text-[22px] font-bold text-[#EF476F] sm:text-[24px]">66%</p>
                    <p className="text-[10px] text-stone-300">Flex</p>
                  </div>
                  <div>
                    <p className="text-[22px] font-bold text-[#EF476F] sm:text-[24px]">34%</p>
                    <p className="text-[10px] text-stone-300">Commitment</p>
                  </div>
                </div>
                <p className="rounded-lg text-xs bg-[#FFFFFF1A] text-left p-2 text-stone-300">
                  Most of the people choose
                  <br />
                  "Flex" Plan.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card showTab={false}>
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[420px] table-fixed text-left text-[12px] sm:min-w-0">
              <thead className="border-b border-stone-900 text-stone-500">
                <tr>
                  <th className="pb-4 font-medium">Subject</th>
                  <th className="pb-4 text-right font-medium">Month</th>
                  <th className="pb-4 text-right font-medium">Year</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map(([subject, month, year]) => (
                  <tr key={subject} className="text-stone-200">
                    <td className="py-2">{subject}</td>
                    <td className="py-2 text-right text-stone-500">{month}</td>
                    <td className="py-2 text-right font-semibold text-[#EF476F]">{year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </main>
  );
}