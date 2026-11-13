"use client";

/**
 * Founder Dashboard, from GET /admin/dashboard: work waiting for the team,
 * headline numbers, monthly charts for the chosen range (3 / 6 / 12 months,
 * Europe/Amsterdam months), subscribers by plan, the marketplace this month
 * vs this year, and users by role and country.
 *
 * Money is shown per currency (EUR, GBP, USD are never added together).
 */
import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarCheck,
  ClipboardCheck,
  Megaphone,
  MessageCircle,
  PhoneCall,
  RefreshCw,
  Snowflake,
  UserX,
} from "lucide-react";
import { ArrowSeparateVertical } from "iconoir-react";
import Loader from "@/app/admin/components/ui/Loader";
import { usePersistedTab } from "@/hooks/usePersistedTab";
import { AdminDashboard, DashboardRange, Money, Series, useAdminDashboard } from "@/hooks/useAdminDashboard";

/* ------------------------------ Color & format ---------------------------- */

// Categorical slots (dark), validated on the card surface; a series keeps its
// slot whatever else is shown, and every chart has a legend
const COLORS = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#008300", "#9085e9", "#e66767"];

const REVENUE_ORDER = ["Subscriptions", "Add-ons", "Model bookings", "Store", "Services", "Cruise", "Studio", "Other"];
const ROLE_ORDER = ["Models", "Agencies", "Photographers", "Designers", "Stylists", "Brands", "Other"];
const PLAN_ORDER = ["NFP", "AMP", "RSP", "Other"];
const POSTER_ORDER = ["AGENCIES", "DESIGNER", "PHOTOGRAPHER", "STYLIST", "BRAND", "FOUNDER", "MODEL", "Other"];
const POSTER_LABEL: Record<string, string> = {
  AGENCIES: "Agencies",
  DESIGNER: "Designers",
  PHOTOGRAPHER: "Photographers",
  STYLIST: "Stylists",
  BRAND: "Brands",
  FOUNDER: "Disstrikt",
  MODEL: "Models",
  Other: "Other",
};

const RANGES: { label: string; value: DashboardRange }[] = [
  { label: "Last 3 Months", value: 3 },
  { label: "Last 6 Months", value: 6 },
  { label: "Last 12 Months", value: 12 },
];
const RANGE_KEYS = ["3", "6", "12"] as const;

type ChartSeries = { key: string; label: string; color: string; values: number[] };

/** Series in a fixed order, unknown keys folded into "Other". */
const ordered = (series: Series[], order: string[], label: (key: string) => string = (k) => k): ChartSeries[] => {
  const byKey = new Map<string, number[]>();
  for (const s of series) {
    const key = order.includes(s.key) ? s.key : "Other";
    const values = byKey.get(key) ?? s.values.map(() => 0);
    byKey.set(key, values.map((v, i) => v + (s.values[i] ?? 0)));
  }
  return order
    .filter((key) => byKey.has(key))
    .map((key) => ({ key, label: label(key), color: COLORS[order.indexOf(key)] ?? COLORS[7], values: byKey.get(key)! }));
};

const formatMoney = (amount: number, currency: string, digits = 0) => {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
    }).format(amount);
  } catch {
    return `${amount.toFixed(digits)} ${currency.toUpperCase()}`;
  }
};

const formatCount = (n: number) => n.toLocaleString("en-GB");

const ago = (iso: string) => {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes <= 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  return `${Math.round(minutes / 60)}h ago`;
};

/** Round axis ticks from 0 to just above `value`: 3-5 steps of 1, 2, 2.5 or 5 × 10^n. */
const niceTicks = (value: number) => {
  if (value <= 0) return [0, 1, 2, 3, 4];
  const raw = value / 4;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = ([1, 2, 2.5, 5, 10].find((s) => s * power >= raw) ?? 10) * power;
  const top = Math.ceil(value / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
};

const moneyLine = (list: Money[], digits = 0) =>
  list.length ? list.map((m) => formatMoney(m.amount, m.currency, digits)).join(" · ") : formatMoney(0, "eur");

/** One currency per line (amounts in different currencies are never added). */
const MoneyStack = ({ list }: { list: Money[] }) => (
  <span className="flex flex-col text-xl sm:text-[22px]">
    {(list.length ? list : [{ currency: "eur", amount: 0 }]).map((m) => (
      <span key={m.currency}>{formatMoney(m.amount, m.currency)}</span>
    ))}
  </span>
);

/* -------------------------------- Pieces --------------------------------- */

const Card = ({
  title,
  subtitle,
  right,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={`min-w-0 rounded-[12px] bg-[#111115] p-4 text-stone-100 sm:p-6 ${className}`}>
    {(title || right) && (
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 sm:mb-5">
        <div className="min-w-0">
          {title && <h2 className="text-sm font-semibold sm:text-base">{title}</h2>}
          {subtitle && <p className="mt-0.5 text-[11px] text-stone-500">{subtitle}</p>}
        </div>
        {right}
      </div>
    )}
    {children}
  </section>
);

const Tabs = <T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) => (
  <div className="flex flex-wrap gap-4 text-[11px] sm:gap-6">
    {tabs.map((tab) => (
      <button
        key={tab.value}
        type="button"
        onClick={() => onChange(tab.value)}
        className={`pb-1 ${value === tab.value ? "border-b border-[#EF476F] text-[#EF476F]" : "text-stone-500 hover:text-stone-300"}`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

/** Stacked monthly bars: 2px gaps, rounded tops, hover tooltip, legend with range totals. */
const StackedBars = ({
  labels,
  series,
  format = formatCount,
  emptyText = "Nothing in this period yet.",
}: {
  labels: string[];
  series: ChartSeries[];
  format?: (n: number) => string;
  emptyText?: string;
}) => {
  const totals = labels.map((_, i) => series.reduce((sum, s) => sum + (s.values[i] ?? 0), 0));
  const ticks = niceTicks(Math.max(...totals, 0)).reverse();
  const max = ticks[0];
  const height = 180;
  const dense = labels.length > 6;

  if (!totals.some((t) => t > 0)) {
    return <p className="py-16 text-center text-xs text-stone-500">{emptyText}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3">
        <div className="flex shrink-0 flex-col justify-between pb-6 text-right text-[10px] text-stone-500" style={{ height: height + 24 }}>
          {ticks.map((t) => (
            <span key={t}>{format(t)}</span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1 overflow-x-auto">
          <div className={`flex min-w-full items-end justify-around ${dense ? "gap-1.5" : "gap-3"}`} style={{ minWidth: labels.length * 34 }}>
            {labels.map((label, i) => (
              <div key={`${label}-${i}`} className="group relative flex flex-1 flex-col items-center gap-2">
                <div className="relative flex w-full items-end justify-center" style={{ height }}>
                  {/* Hover target spans the whole column */}
                  <div
                    className={`flex flex-col-reverse gap-[2px] ${dense ? "w-[18px]" : "w-[28px]"}`}
                    style={{ height: (totals[i] / max) * height }}
                  >
                    {series.map((s) =>
                      s.values[i] > 0 ? (
                        <span
                          key={s.key}
                          className="block w-full last:rounded-t-[4px] group-hover:opacity-90"
                          style={{ backgroundColor: s.color, flexGrow: s.values[i], flexBasis: 0, minHeight: 2 }}
                        />
                      ) : null,
                    )}
                  </div>
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-max min-w-[150px] -translate-x-1/2 rounded-[8px] border border-white/10 bg-[#1c1c22] p-2.5 text-[11px] shadow-lg group-hover:block">
                    <p className="mb-1.5 font-semibold text-white">
                      {label} · {format(totals[i])}
                    </p>
                    {series
                      .filter((s) => s.values[i] > 0)
                      .map((s) => (
                        <p key={s.key} className="flex items-center justify-between gap-4 text-stone-300">
                          <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: s.color }} />
                            {s.label}
                          </span>
                          <span className="tabular-nums text-white">{format(s.values[i])}</span>
                        </p>
                      ))}
                  </div>
                </div>
                <span className="text-[10px] text-stone-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-2 rounded-lg bg-black/20 p-2.5">
        {series.map((s) => (
          <li key={s.key} className="flex items-center gap-2 text-[11px]">
            <span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: s.color }} />
            <span className="text-stone-400">{s.label}</span>
            <span className="tabular-nums text-stone-200">{format(s.values.reduce((a, b) => a + b, 0))}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Kpi = ({ label, value, lines }: { label: string; value: React.ReactNode; lines: React.ReactNode[] }) => (
  <div className="min-w-0 rounded-[12px] bg-[#111115] p-4 sm:p-5">
    <p className="text-[11px] text-stone-400">{label}</p>
    <div className="mt-2 text-2xl font-semibold leading-tight text-white tabular-nums sm:text-[26px]">{value}</div>
    <div className="mt-2 flex flex-col gap-0.5">
      {lines.map((line, i) => (
        <p key={i} className="truncate text-[11px] text-stone-400">
          {line}
        </p>
      ))}
    </div>
  </div>
);

const Delta = ({ now, before }: { now: number; before: number }) => {
  if (!before) return <span className="text-stone-400">vs {formatCount(before)} last month</span>;
  const change = Math.round(((now - before) / before) * 100);
  return (
    <span>
      <span className={change >= 0 ? "text-[#4cc38a]" : "text-[#ec835a]"}>
        {change >= 0 ? "▲" : "▼"} {Math.abs(change)}%
      </span>{" "}
      <span className="text-stone-400">vs last month ({formatCount(before)})</span>
    </span>
  );
};

/** Unread / waiting items, linking to where they are handled. */
const ATTENTION: {
  key: keyof AdminDashboard["attention"];
  label: string;
  href?: string;
  tab?: [string, string][];
  icon: React.ReactNode;
}[] = [
  {
    key: "unionReviews",
    label: "University Union uploads to review",
    href: "/admin/university-union",
    tab: [["tab", "Tasks"]],
    icon: <ClipboardCheck className="h-4 w-4" />,
  },
  {
    key: "callRequests",
    label: "Agent call requests unanswered",
    href: "/admin/university-union",
    tab: [["tab", "Calls"], ["callTab", "Call Requests"]],
    icon: <PhoneCall className="h-4 w-4" />,
  },
  {
    key: "unreadChats",
    label: "Model chats with unread messages",
    href: "/admin/university-union",
    tab: [["tab", "Messages"]],
    icon: <MessageCircle className="h-4 w-4" />,
  },
  { key: "unassignedModels", label: "Models without an agent", href: "/admin/model-mansion", icon: <UserX className="h-4 w-4" /> },
  { key: "shoutouts", label: "Shoutout requests pending", href: "/admin/subscriptions/shoutouts", icon: <Megaphone className="h-4 w-4" /> },
  {
    key: "studioAttendance",
    label: "Studio sessions not marked attended",
    href: "/admin/shoot-studio",
    icon: <CalendarCheck className="h-4 w-4" />,
  },
  { key: "frozenEarnings", label: "Earnings frozen (disputes)", icon: <Snowflake className="h-4 w-4" /> },
];

const rememberTabs = (path: string, tabs: [string, string][] = []) => {
  try {
    for (const [name, value] of tabs) window.sessionStorage.setItem(`tab:${path}:${name}`, value);
  } catch {
    // Storage blocked: the page opens on its default tab
  }
};

/* --------------------------------- Page ---------------------------------- */

export default function Dashboard() {
  const [rangeKey, setRangeKey] = usePersistedTab<(typeof RANGE_KEYS)[number]>("range", "6", [...RANGE_KEYS]);
  const months = Number(rangeKey) as DashboardRange;
  const { data, isPending, isFetching, refetch } = useAdminDashboard(months);

  return (
    <main className="w-full text-stone-100">
      <div className="mb-5 flex flex-wrap items-center justify-end gap-3">
        {data && (
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex h-9 items-center gap-2 rounded-[6px] border border-[#332C2D] px-3 text-[12px] text-stone-300 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Updated {ago(data.generatedAt)}
          </button>
        )}
        <label className="relative block w-full max-w-[210px]">
          <select
            value={rangeKey}
            onChange={(event) => setRangeKey(event.target.value as (typeof RANGE_KEYS)[number])}
            className="h-9 w-full appearance-none rounded-[6px] border border-[#332C2D] bg-[#0F0F13] px-4 pr-9 text-[12px] text-stone-300 outline-none focus:border-[#EF476F]"
          >
            {RANGES.map((range) => (
              <option key={range.value} value={String(range.value)} className="bg-[#111115]">
                {range.label}
              </option>
            ))}
          </select>
          <ArrowSeparateVertical className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
        </label>
      </div>

      {isPending ? (
        <Loader />
      ) : !data ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <p className="text-sm text-stone-400">The dashboard couldn&apos;t be loaded.</p>
          <button type="button" onClick={() => refetch()} className="rounded-full bg-[#EF476F] px-5 py-2 text-xs text-white">
            Try again
          </button>
        </div>
      ) : (
        <div className={isFetching ? "opacity-80 transition-opacity" : ""}>
          <DashboardBody data={data} />
        </div>
      )}
    </main>
  );
}

function DashboardBody({ data }: { data: AdminDashboard }) {
  const { kpis, attention, series, range } = data;
  const labels = range.labels;
  const [currency, setCurrency] = usePersistedTab<string>(
    "revenueCurrency",
    series.revenue[0]?.currency ?? "eur",
    series.revenue.length ? series.revenue.map((r) => r.currency) : undefined,
  );
  const [growthTab, setGrowthTab] = usePersistedTab<"signups" | "subscriptions">("growthTab", "signups", ["signups", "subscriptions"]);

  const revenue = series.revenue.find((r) => r.currency === currency) ?? series.revenue[0];
  const waiting = ATTENTION.filter((item) => attention[item.key] > 0);
  const planTotal = data.subscribersByPlan.plans.reduce((s, p) => s + p.count, 0);
  const choiceTotal = data.subscribersByPlan.flex + data.subscribersByPlan.commitment;
  const periodLabel = `last ${range.months} months`;

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* Needs attention */}
      <Card
        title="Needs attention"
        subtitle={waiting.length ? "Work waiting for the team" : undefined}
      >
        {waiting.length ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {ATTENTION.map((item) => {
              const count = attention[item.key];
              const body = (
                <>
                  <span className={count ? "text-[#fab219]" : "text-stone-600"}>{item.icon}</span>
                  <span className={`min-w-0 flex-1 text-[12px] ${count ? "text-stone-200" : "text-stone-500"}`}>{item.label}</span>
                  <span className={`text-lg font-semibold tabular-nums ${count ? "text-white" : "text-stone-600"}`}>{count}</span>
                </>
              );
              const className = `flex items-center gap-3 rounded-[8px] border px-3 py-2.5 ${
                count ? "border-[#fab219]/30 bg-[#fab219]/[0.06]" : "border-white/5 bg-white/[0.02]"
              }`;
              return item.href ? (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => rememberTabs(item.href!, item.tab)}
                  className={`${className} transition-colors hover:border-[#fab219]/60`}
                >
                  {body}
                </Link>
              ) : (
                <div key={item.key} className={className}>
                  {body}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-stone-400">All clear: nothing is waiting for the team.</p>
        )}
      </Card>

      {/* Headline numbers */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5 sm:gap-5">
        <Kpi
          label="Users"
          value={formatCount(kpis.users.total)}
          lines={[
            `${formatCount(kpis.users.newThisMonth)} new this month`,
            <Delta key="delta" now={kpis.users.newThisMonth} before={kpis.users.newLastMonth} />,
            `${formatCount(kpis.users.activeThisWeek)} active in the last 7 days`,
          ]}
        />
        <Kpi
          label="Subscribed models"
          value={
            <>
              {formatCount(kpis.subscribers.active)}
              <span className="ml-1.5 text-xs font-normal text-stone-400">of {formatCount(kpis.subscribers.models)} models</span>
            </>
          }
          lines={[
            `${kpis.subscribers.newThisMonth} new this month · ${kpis.subscribers.trialing} on trial`,
            `${kpis.subscribers.canceling} cancelling · ${kpis.subscribers.lapsed} lapsed`,
          ]}
        />
        <Kpi
          label="Revenue this month"
          value={<MoneyStack list={kpis.revenue.thisMonth} />}
          lines={[`Last month: ${moneyLine(kpis.revenue.lastMonth)}`]}
        />
        <Kpi
          label="Revenue this year"
          value={<MoneyStack list={kpis.revenue.thisYear} />}
          lines={["Succeeded payments, full refunds excluded"]}
        />
        <Kpi
          label="Seller balances held"
          value={<MoneyStack list={kpis.balances.onHold} />}
          lines={[
            "In the 14-day hold",
            `Ready to transfer: ${kpis.balances.toTransfer.length ? moneyLine(kpis.balances.toTransfer, 2) : "nothing"}`,
          ]}
        />
      </div>

      {/* Revenue and growth */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-2">
        <Card
          title="Revenue"
          subtitle={`By source, ${periodLabel}${revenue ? ` · ${formatMoney(revenue.total, revenue.currency)} in total` : ""}`}
          right={
            series.revenue.length > 1 ? (
              <Tabs
                tabs={series.revenue.map((r) => ({ label: r.currency.toUpperCase(), value: r.currency }))}
                value={revenue?.currency ?? currency}
                onChange={setCurrency}
              />
            ) : null
          }
        >
          <StackedBars
            labels={labels}
            series={revenue ? ordered(revenue.series, REVENUE_ORDER) : []}
            format={(n) => formatMoney(n, revenue?.currency ?? "eur")}
            emptyText="No payments in this period."
          />
        </Card>

        <Card
          title={growthTab === "signups" ? "Signups" : "New subscriptions"}
          subtitle={growthTab === "signups" ? `New accounts by role, ${periodLabel}` : `Subscriptions started, by plan, ${periodLabel}`}
          right={
            <Tabs
              tabs={[
                { label: "Signups", value: "signups" as const },
                { label: "Subscriptions", value: "subscriptions" as const },
              ]}
              value={growthTab}
              onChange={setGrowthTab}
            />
          }
        >
          {growthTab === "signups" ? (
            <StackedBars labels={labels} series={ordered(series.signups, ROLE_ORDER)} emptyText="No signups in this period." />
          ) : (
            <StackedBars
              labels={labels}
              series={ordered(series.subscriptions, PLAN_ORDER)}
              emptyText="No new subscriptions in this period."
            />
          )}
        </Card>

        <Card
          title="Jobs posted"
          subtitle={`By who posted them · ${formatCount(series.jobApplications.reduce((a, b) => a + b, 0))} applications in the ${periodLabel}`}
        >
          <StackedBars
            labels={labels}
            series={ordered(series.jobs, POSTER_ORDER, (k) => POSTER_LABEL[k] ?? k)}
            emptyText="No jobs posted in this period."
          />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[320px] text-[11px]">
              <tbody>
                <tr>
                  <td className="pr-3 text-stone-500">Applications</td>
                  {series.jobApplications.map((n, i) => (
                    <td key={i} className="text-center tabular-nums text-stone-300">
                      <span className="block text-[9px] text-stone-600">{labels[i]}</span>
                      {n}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Activity" subtitle={`Monthly, ${periodLabel}`}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {series.activity.map((item) => {
              const total = item.values.reduce((a, b) => a + b, 0);
              const peak = Math.max(...item.values, 1);
              const current = item.values[item.values.length - 1] ?? 0;
              return (
                <div key={item.key} className="rounded-[8px] bg-black/20 px-3 py-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[11px] text-stone-400">{item.key}</p>
                    <p className="text-[10px] text-stone-500">{current} this month</p>
                  </div>
                  <div className="mt-1 flex items-end justify-between gap-3">
                    <p className="text-lg font-semibold tabular-nums text-white">{formatCount(total)}</p>
                    <div className="flex h-7 items-end gap-[2px]" aria-hidden>
                      {item.values.map((v, i) => (
                        <span
                          key={i}
                          title={`${labels[i]}: ${v}`}
                          className="w-[5px] rounded-t-[2px] bg-[#3987e5]"
                          style={{ height: `${Math.max((v / peak) * 100, v > 0 ? 8 : 3)}%`, opacity: v > 0 ? 1 : 0.25 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Subscribers, marketplace, users */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-3">
        <Card title="Subscribers by plan" subtitle="Plans valid right now">
          <ul className="flex flex-col gap-2.5">
            {data.subscribersByPlan.plans.map((plan) => (
              <li key={plan.code} className="flex items-center gap-3 text-[12px]">
                <span className="w-12 shrink-0 text-stone-300">{plan.code}</span>
                <div className="h-2.5 flex-1 rounded-[4px] bg-white/5">
                  <div
                    className="h-full rounded-[4px] bg-[#3987e5]"
                    style={{ width: planTotal ? `${(plan.count / planTotal) * 100}%` : 0 }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right tabular-nums text-white">{plan.count}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 grid grid-cols-2 gap-2 text-center">
            {[
              { label: "Flex", value: data.subscribersByPlan.flex },
              { label: "Commitment", value: data.subscribersByPlan.commitment },
            ].map((c) => (
              <div key={c.label} className="rounded-[8px] bg-black/20 py-3">
                <p className="text-[22px] font-bold text-[#EF476F]">
                  {choiceTotal ? Math.round((c.value / choiceTotal) * 100) : 0}%
                </p>
                <p className="text-[10px] text-stone-300">
                  {c.label} · {c.value}
                </p>
              </div>
            ))}
          </div>
          {data.subscribersByPlan.unknown > 0 && (
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-stone-500">
              <AlertTriangle className="h-3 w-3" /> {data.subscribersByPlan.unknown} on a plan that isn&apos;t one of the six
            </p>
          )}
        </Card>

        <Card title="Marketplace" subtitle="This month and this year">
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <table className="w-full text-left text-[12px]">
              <thead className="border-b border-stone-900 text-stone-500">
                <tr>
                  <th className="pb-3 font-medium">Subject</th>
                  <th className="pb-3 text-right font-medium">Month</th>
                  <th className="pb-3 text-right font-medium">Year</th>
                </tr>
              </thead>
              <tbody>
                {data.table.map((row) => (
                  <tr key={row.subject} className="text-stone-200">
                    <td className="py-1.5">{row.subject}</td>
                    <td className="py-1.5 text-right tabular-nums text-stone-400">{formatCount(row.month)}</td>
                    <td className="py-1.5 text-right font-semibold tabular-nums text-[#EF476F]">{formatCount(row.year)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Users" subtitle="By role and by country">
          <ul className="flex flex-wrap gap-1.5">
            {data.usersByRole.map((r) => (
              <li key={r.role} className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-stone-300">
                {r.role} <span className="tabular-nums text-white">{formatCount(r.count)}</span>
              </li>
            ))}
          </ul>
          <table className="mt-4 w-full text-left text-[12px]">
            <thead className="border-b border-stone-900 text-stone-500">
              <tr>
                <th className="pb-2 font-medium">Country</th>
                <th className="pb-2 text-right font-medium">Users</th>
                <th className="pb-2 text-right font-medium">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {data.usersByCountry.map((c) => (
                <tr key={c.country} className="text-stone-200">
                  <td className="py-1.5">{c.country}</td>
                  <td className="py-1.5 text-right tabular-nums">{formatCount(c.users)}</td>
                  <td className="py-1.5 text-right tabular-nums text-stone-400">{formatCount(c.subscribers)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
