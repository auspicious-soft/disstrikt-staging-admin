"use client";

/**
 * Agent Dashboard: what the agent has to act on today (call requests,
 * University Union reviews, unread messages, bookings waiting for a model)
 * and how their models are doing. Only the agent's own models are counted;
 * sections the role can't open (Manage Roles) are left out.
 */
import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  CalendarClock,
  ClipboardCheck,
  Eye,
  Heart,
  Bookmark,
  MessageCircle,
  PhoneCall,
  RefreshCw,
  ShoppingBag,
  Users,
  Video,
} from "lucide-react";
import Loader from "@/app/admin/components/ui/Loader";
import { formatName, resolveMediaUrl } from "@/lib/media";
import {
  AgentDashboard,
  DashboardBooking,
  DashboardCall,
  DashboardModel,
  useAgentDashboard,
} from "@/hooks/useAgentDashboard";

/* ------------------------------- Helpers -------------------------------- */

// Categorical slots (dark), validated on the panel's dark surface; always
// used in this order and always shown with a legend and counts
const SLOT = ["#3987e5", "#d95926", "#199e70", "#c98500"];

const PAGES = {
  calls: "/agent/calls",
  models: "/agent/assigned-models",
  messages: "/agent/messages",
  jobs: "/agent/job-junction",
  market: "/agent/model-market",
  settings: "/agent/account-settings",
};

/** Opens a page on a given tab (the pages keep their tab in sessionStorage). */
const rememberTab = (path: string, tab: string) => {
  try {
    window.sessionStorage.setItem(`tab:${path}:tab`, tab);
  } catch {
    // Storage blocked: the page opens on its default tab
  }
};

const modelName = (model: DashboardModel) => formatName(model?.fullName) || "Deleted user";

const ago = (iso: string | null | undefined) => {
  if (!iso) return "";
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return minutes <= 1 ? "just now" : `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
};

const waitedDays = (iso: string | null | undefined) =>
  iso ? Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)) : 0;

const shortDate = (iso: string | null | undefined, timeZone?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone })
    : "-";

// "2026-10-09" + "10:00 - 10:30" -> "Fri, 9 Oct · 10:00 - 10:30" (already in the agent's zone)
const callWhen = (call: DashboardCall) => {
  const [y, m, d] = call.date.split("-").map(Number);
  const day = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  return `${day} · ${call.time}`;
};

const money = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency.toUpperCase()}`;
  }
};

const greeting = (timeZone: string) => {
  let hour = new Date().getHours();
  try {
    hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone }).format(new Date()));
  } catch {
    // Unknown zone: the browser's hour
  }
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
};

/* ------------------------------ Components ------------------------------ */

const Avatar = ({ src, name, size = 32 }: { src?: string | null; name: string; size?: number }) => {
  const [failed, setFailed] = React.useState(false);
  const url = src ? resolveMediaUrl(src) : "";
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
  return url && !failed ? (
    <img
      src={url}
      alt=""
      onError={() => setFailed(true)}
      className="shrink-0 rounded-full object-cover bg-neutral-800"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      aria-hidden
      className="shrink-0 rounded-full bg-[#3a2f31] text-[11px] font-semibold text-stone-300 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {initials || "?"}
    </span>
  );
};

const Card = ({
  title,
  subtitle,
  href,
  linkText = "View all",
  onLink,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkText?: string;
  onLink?: () => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={`min-w-0 rounded-[10px] border border-white/10 bg-[#1f1c1c] p-4 md:p-5 flex flex-col gap-4 ${className}`}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-stone-400">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          onClick={onLink}
          className="shrink-0 inline-flex items-center gap-1 text-xs text-[#EF476F] hover:text-white transition-colors"
        >
          {linkText} <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
    {children}
  </section>
);

const Empty = ({ children }: { children: React.ReactNode }) => (
  <p className="py-6 text-center text-xs text-stone-500">{children}</p>
);

const StatTile = ({
  label,
  value,
  sub,
  href,
  onClick,
  icon,
  highlight,
}: {
  label: string;
  value: number | string;
  sub?: string;
  href: string;
  onClick?: () => void;
  icon: React.ReactNode;
  // Something waits for the agent: the tile gets the accent border
  highlight?: boolean;
}) => (
  <Link
    href={href}
    onClick={onClick}
    className={`group min-w-0 rounded-[10px] border p-4 flex flex-col gap-3 transition-colors bg-[#1f1c1c] hover:bg-[#2B2426] ${
      highlight ? "border-[#EF476F]/70" : "border-white/10"
    }`}
  >
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-stone-400 truncate">{label}</span>
      <span className={highlight ? "text-[#EF476F]" : "text-stone-500 group-hover:text-stone-300"}>{icon}</span>
    </div>
    <span className="text-3xl font-semibold leading-none text-white tabular-nums">{value}</span>
    <span className="text-[11px] text-stone-400 truncate min-h-[14px]">{sub}</span>
  </Link>
);

type Segment = { label: string; value: number };

/** Part-to-whole bar: 2px gaps, legend with counts, hover tooltip per segment. */
const SegmentBar = ({ segments, ariaLabel }: { segments: Segment[]; ariaLabel: string }) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  return (
    <div className="flex flex-col gap-3">
      <div role="img" aria-label={ariaLabel} className="flex h-3 w-full gap-[2px] overflow-hidden rounded-[4px] bg-white/5">
        {total > 0 &&
          segments.map((s, i) =>
            s.value > 0 ? (
              <div
                key={s.label}
                title={`${s.label}: ${s.value} (${Math.round((s.value / total) * 100)}%)`}
                className="h-full first:rounded-l-[4px] last:rounded-r-[4px] hover:opacity-80"
                style={{ width: `${(s.value / total) * 100}%`, background: SLOT[i] }}
              />
            ) : null,
          )}
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {segments.map((s, i) => (
          <li key={s.label} className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-2 min-w-0 text-stone-400">
              <span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ background: SLOT[i] }} />
              <span className="truncate">{s.label}</span>
            </span>
            <span className="tabular-nums text-stone-200">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Row = ({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick?: () => void;
  children: React.ReactNode;
}) => (
  <li>
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-[8px] px-2 py-2 -mx-2 hover:bg-white/5 transition-colors"
    >
      {children}
    </Link>
  </li>
);

const Badge = ({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "accent" | "neutral" | "warn" }) => (
  <span
    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
      tone === "accent"
        ? "bg-[#EF476F] text-white"
        : tone === "warn"
          ? "bg-[#fab219]/15 text-[#fab219]"
          : "bg-white/10 text-stone-300"
    }`}
  >
    {children}
  </span>
);

/* -------------------------------- Sections ------------------------------- */

const CallList = ({ calls, kind }: { calls: DashboardCall[]; kind: "requests" | "upcoming" }) => (
  <ul className="flex flex-col">
    {calls.map((call) => {
      const soon = new Date(call.startTime).getTime() - Date.now() < 24 * 3600 * 1000;
      return (
        <Row
          key={call._id}
          href={PAGES.calls}
          onClick={() => rememberTab(PAGES.calls, kind === "requests" ? "Requests" : "Upcoming Calls")}
        >
          <Avatar src={call.model?.image} name={modelName(call.model)} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-white">{modelName(call.model)}</p>
            <p className="truncate text-xs text-stone-400">{callWhen(call)}</p>
          </div>
          {kind === "requests" && soon && <Badge tone="warn">Within 24h</Badge>}
          {kind === "upcoming" && call.meetingLink && (
            <span
              role="link"
              tabIndex={0}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(call.meetingLink!, "_blank", "noopener,noreferrer");
              }}
              className="shrink-0 inline-flex items-center gap-1 rounded-full border border-[#EF476F] px-2.5 py-1 text-[11px] text-[#EF476F] hover:bg-[#EF476F] hover:text-white"
            >
              <Video className="h-3 w-3" /> Join
            </span>
          )}
        </Row>
      );
    })}
  </ul>
);

const BookingList = ({ bookings, kind, timeZone }: { bookings: DashboardBooking[]; kind: "awaiting" | "upcoming"; timeZone: string }) => (
  <ul className="flex flex-col">
    {bookings.map((b) => (
      <Row key={b._id} href={`${PAGES.market}/${b._id}`}>
        <Avatar src={b.model?.image} name={modelName(b.model)} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-white">{b.projectName}</p>
          <p className="truncate text-xs text-stone-400">
            {modelName(b.model)} ·{" "}
            {kind === "awaiting" ? `booked ${ago(b.createdAt)}` : `next ${shortDate(b.nextDate, timeZone)}`}
          </p>
        </div>
        <span className="shrink-0 text-xs tabular-nums text-stone-200">{money(b.budget, b.currency)}</span>
      </Row>
    ))}
  </ul>
);

const JOB_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  SELECTED: "Selected",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

/* ---------------------------------- Page --------------------------------- */

export default function AgentDashboardPage() {
  const { data, isPending, refetch, isFetching } = useAgentDashboard();

  if (isPending) return <Loader />;
  // A failed refresh keeps showing the last numbers
  if (!data) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <p className="text-sm text-stone-400">The dashboard couldn&apos;t be loaded.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-full bg-[#EF476F] px-5 py-2 text-xs text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  return <Dashboard data={data} refreshing={isFetching} onRefresh={() => refetch()} />;
}

function Dashboard({ data, refreshing, onRefresh }: { data: AgentDashboard; refreshing: boolean; onRefresh: () => void }) {
  const { calls, messages, models, jobs, market, agent, timeZone } = data;
  const zoneLabel = timeZone.replace(/_/g, " ");
  const firstName = formatName(agent.fullName).split(" ")[0];

  const alerts: { text: string; href: string; onClick?: () => void; action: string }[] = [];
  if (!agent.availability.set) {
    alerts.push({
      text: "You haven't set your call availability yet, so your models can't book calls with you.",
      href: PAGES.settings,
      action: "Set availability",
    });
  }
  if (calls.urgentRequests > 0) {
    alerts.push({
      text: `${calls.urgentRequests} call ${calls.urgentRequests === 1 ? "request starts" : "requests start"} within 24 hours and ${calls.urgentRequests === 1 ? "is" : "are"} still unanswered.`,
      href: PAGES.calls,
      onClick: () => rememberTab(PAGES.calls, "Requests"),
      action: "Answer now",
    });
  }
  if (models && models.union.waitingReview > 0) {
    const oldest = waitedDays(models.union.reviewQueue[0]?.pendingSince);
    if (oldest >= 2) {
      alerts.push({
        text: `A University Union task has been waiting ${oldest} days for your review.`,
        href: models.union.reviewQueue[0]?.model ? `${PAGES.models}/${models.union.reviewQueue[0].model._id}` : PAGES.models,
        onClick: () =>
          models.union.reviewQueue[0]?.model &&
          rememberTab(`${PAGES.models}/${models.union.reviewQueue[0].model._id}`, "University Union"),
        action: "Review",
      });
    }
  }

  return (
    <div className="w-full flex flex-col gap-5 md:gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-semibold text-white">
            {greeting(timeZone)}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-1 text-xs text-stone-400">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone })} · Times
            in {zoneLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-stone-300 hover:text-white hover:border-white/30"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Updated {ago(data.generatedAt)}
        </button>
      </div>

      {/* Needs attention */}
      {alerts.length > 0 && (
        <div className="flex flex-col gap-2">
          {alerts.map((alert) => (
            <div
              key={alert.text}
              className="flex flex-wrap items-center gap-3 rounded-[10px] border border-[#fab219]/30 bg-[#fab219]/10 px-4 py-3"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 text-[#fab219]" aria-label="Warning" />
              <p className="min-w-0 flex-1 text-xs text-stone-200">{alert.text}</p>
              <Link
                href={alert.href}
                onClick={alert.onClick}
                className="shrink-0 text-xs font-semibold text-[#fab219] hover:text-white"
              >
                {alert.action} →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Headline numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatTile
          label="Call requests"
          value={calls.requests}
          sub={calls.urgentRequests ? `${calls.urgentRequests} within 24 hours` : "Waiting for your answer"}
          href={PAGES.calls}
          onClick={() => rememberTab(PAGES.calls, "Requests")}
          icon={<PhoneCall className="h-4 w-4" />}
          highlight={calls.requests > 0}
        />
        <StatTile
          label="Upcoming calls"
          value={calls.upcoming}
          sub={`${calls.today} today · ${calls.heldThisMonth} held this month`}
          href={PAGES.calls}
          onClick={() => rememberTab(PAGES.calls, "Upcoming Calls")}
          icon={<CalendarClock className="h-4 w-4" />}
        />
        {messages && (
          <StatTile
            label="Unread messages"
            value={messages.totalUnread}
            sub={messages.unreadChats ? `In ${messages.unreadChats} ${messages.unreadChats === 1 ? "chat" : "chats"}` : "All caught up"}
            href={PAGES.messages}
            icon={<MessageCircle className="h-4 w-4" />}
            highlight={messages.totalUnread > 0}
          />
        )}
        {models && (
          <StatTile
            label="Tasks to review"
            value={models.union.waitingReview}
            sub="University Union"
            href={PAGES.models}
            icon={<ClipboardCheck className="h-4 w-4" />}
            highlight={models.union.waitingReview > 0}
          />
        )}
        {models && (
          <StatTile
            label="Assigned models"
            value={models.total}
            sub={`${models.activeThisWeek} active this week${models.joinedThisMonth ? ` · ${models.joinedThisMonth} new` : ""}`}
            href={PAGES.models}
            icon={<Users className="h-4 w-4" />}
          />
        )}
        {market && (
          <StatTile
            label="Bookings awaiting model"
            value={market.awaitingModel}
            sub={`${market.upcoming} upcoming accepted`}
            href={PAGES.market}
            icon={<ShoppingBag className="h-4 w-4" />}
            highlight={market.awaitingModel > 0}
          />
        )}
        {jobs && (
          <StatTile
            label="Job applications"
            value={jobs.byStatus.PENDING}
            sub={`Pending · ${jobs.thisMonth} sent this month`}
            href={PAGES.jobs}
            icon={<Briefcase className="h-4 w-4" />}
          />
        )}
      </div>

      {/* Today's work */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card
          title="Call requests"
          subtitle="Approve with a meeting link or reject, soonest first"
          href={PAGES.calls}
          onLink={() => rememberTab(PAGES.calls, "Requests")}
          linkText="Open calls"
        >
          {calls.nextRequests.length ? (
            <CallList calls={calls.nextRequests} kind="requests" />
          ) : (
            <Empty>No call requests waiting for you.</Empty>
          )}
        </Card>

        <Card
          title="Upcoming calls"
          subtitle={`${calls.today} today`}
          href={PAGES.calls}
          onLink={() => rememberTab(PAGES.calls, "Upcoming Calls")}
          linkText="All calls"
        >
          {calls.nextCalls.length ? <CallList calls={calls.nextCalls} kind="upcoming" /> : <Empty>No upcoming calls.</Empty>}
        </Card>

        {models && (
          <Card
            title="University Union reviews"
            subtitle="Uploads your models are waiting on, longest wait first"
            href={PAGES.models}
            linkText="All models"
          >
            {models.union.reviewQueue.length ? (
              <ul className="flex flex-col">
                {models.union.reviewQueue.map((item) => {
                  const path = item.model ? `${PAGES.models}/${item.model._id}` : PAGES.models;
                  const days = waitedDays(item.pendingSince);
                  return (
                    <Row key={`${item.model?._id}-${item.key}`} href={path} onClick={() => rememberTab(path, "University Union")}>
                      <Avatar src={item.model?.image} name={modelName(item.model)} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-white">{modelName(item.model)}</p>
                        <p className="truncate text-xs text-stone-400">
                          {item.key} {item.title}
                          {item.taskTitle ? ` · ${item.taskTitle}` : ""}
                        </p>
                      </div>
                      <Badge tone={days >= 2 ? "warn" : "neutral"}>
                        {days === 0 ? "Today" : `${days}d waiting`}
                      </Badge>
                    </Row>
                  );
                })}
              </ul>
            ) : (
              <Empty>Nothing to review. Your models aren&apos;t waiting on you.</Empty>
            )}
          </Card>
        )}

        {messages && (
          <Card title="Messages" subtitle="Unread first" href={PAGES.messages} linkText="Open inbox">
            {messages.recent.length ? (
              <ul className="flex flex-col">
                {messages.recent.map((chat) => {
                  // A model thread opens on the model's Chat tab; groups in the inbox
                  const path = chat.type === "model" ? `${PAGES.models}/${chat.id}` : PAGES.messages;
                  const preview = chat.lastMessage
                    ? `${chat.lastMessage.isMine ? "You" : formatName(chat.lastMessage.senderName)}${
                        chat.lastMessage.isMine || chat.lastMessage.senderName ? ": " : ""
                      }${chat.lastMessage.content ?? "Photo"}`
                    : "No messages yet";
                  return (
                    <Row
                      key={`${chat.type}-${chat.id}`}
                      href={path}
                      onClick={() => chat.type === "model" && rememberTab(path, "Chat")}
                    >
                      <Avatar src={chat.image} name={chat.name} />
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 truncate text-sm text-white">
                          <span className="truncate">{formatName(chat.name)}</span>
                          {chat.type === "group" && <span className="shrink-0 text-[10px] text-stone-500">Group</span>}
                        </p>
                        <p className={`truncate text-xs ${chat.unreadCount ? "text-stone-200" : "text-stone-400"}`}>{preview}</p>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <span className="text-[10px] text-stone-500">{ago(chat.lastMessageAt)}</span>
                        {chat.unreadCount > 0 && <Badge tone="accent">{chat.unreadCount}</Badge>}
                      </div>
                    </Row>
                  );
                })}
              </ul>
            ) : (
              <Empty>No conversations yet.</Empty>
            )}
          </Card>
        )}
      </div>

      {/* Models */}
      {models && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card title="University Union progress" subtitle={`${models.union.totalSteps} steps per model`}>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-semibold leading-none text-white tabular-nums">{models.union.averageProgress}%</span>
              <span className="pb-0.5 text-xs text-stone-400">average completion</span>
            </div>
            <SegmentBar
              ariaLabel="University Union stages of your models"
              segments={[
                { label: "In progress", value: models.union.inProgress },
                { label: "Waiting for review", value: models.union.waitingReview },
                { label: "Finished", value: models.union.finished },
                { label: "Not started", value: models.union.notStarted },
              ]}
            />
            {models.union.needsNudge.length > 0 && (
              <div className="flex flex-col gap-1 border-t border-white/10 pt-3">
                <p className="text-xs text-stone-400">
                  No progress for {models.union.stallDays}+ days ({models.union.stalled})
                </p>
                <ul className="flex flex-col">
                  {models.union.needsNudge.map((item) => {
                    const path = item.model ? `${PAGES.models}/${item.model._id}` : PAGES.models;
                    return (
                      <Row key={item.model?._id} href={path} onClick={() => rememberTab(path, "University Union")}>
                        <Avatar src={item.model?.image} name={modelName(item.model)} size={28} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs text-white">{modelName(item.model)}</p>
                          <p className="truncate text-[11px] text-stone-400">
                            On {item.key} {item.title} · last step {ago(item.lastCompletedAt)}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs tabular-nums text-stone-300">{item.percentage}%</span>
                      </Row>
                    );
                  })}
                </ul>
              </div>
            )}
          </Card>

          <Card title="Plans" subtitle="Subscriptions of your models" href={PAGES.models} linkText="Models">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-semibold leading-none text-white tabular-nums">{models.plans.active}</span>
              <span className="pb-0.5 text-xs text-stone-400">of {models.total} on an active plan</span>
            </div>
            <SegmentBar
              ariaLabel="Plans of your models"
              segments={[
                { label: "Active", value: models.plans.active },
                { label: "Expired", value: models.plans.expired },
                { label: "Never subscribed", value: models.plans.none },
              ]}
            />
            {models.byCountry.length > 0 && (
              <div className="flex flex-col gap-2 border-t border-white/10 pt-3">
                <p className="text-xs text-stone-400">Where your models are</p>
                <div className="flex flex-wrap gap-1.5">
                  {models.byCountry.map((c) => (
                    <span key={c.country} className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-stone-300">
                      {c.country} <span className="tabular-nums text-white">{c.count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card title="Engagement" subtitle="Across your models' portfolios">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Views", value: models.engagement.views, icon: <Eye className="h-3.5 w-3.5" /> },
                { label: "Likes", value: models.engagement.likes, icon: <Heart className="h-3.5 w-3.5" /> },
                { label: "Saves", value: models.engagement.saves, icon: <Bookmark className="h-3.5 w-3.5" /> },
              ].map((m) => (
                <div key={m.label} className="rounded-[8px] bg-white/5 px-3 py-2.5">
                  <p className="flex items-center gap-1.5 text-[11px] text-stone-400">
                    {m.icon} {m.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white tabular-nums">{m.value.toLocaleString("en-GB")}</p>
                </div>
              ))}
            </div>
            {models.engagement.top.length ? (
              <div className="flex flex-col gap-1">
                <p className="text-xs text-stone-400">Most viewed and liked</p>
                <ul className="flex flex-col">
                  {models.engagement.top.map((item) => (
                    <Row
                      key={item.model._id}
                      href={`${PAGES.models}/${item.model._id}`}
                      onClick={() => rememberTab(`${PAGES.models}/${item.model._id}`, "Likes & Saves")}
                    >
                      <Avatar src={item.model.image} name={modelName(item.model)} size={28} />
                      <p className="min-w-0 flex-1 truncate text-xs text-white">{modelName(item.model)}</p>
                      <span className="shrink-0 text-[11px] tabular-nums text-stone-400">
                        {item.views} views · {item.likes} likes · {item.saves} saves
                      </span>
                    </Row>
                  ))}
                </ul>
              </div>
            ) : (
              <Empty>No views, likes or saves yet.</Empty>
            )}
          </Card>
        </div>
      )}

      {/* Work for the models */}
      {(market || jobs) && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {market && (
            <Card
              title="Model Market bookings"
              subtitle="Paid bookings of your models"
              href={PAGES.market}
              linkText="All projects"
            >
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Awaiting model", value: market.awaitingModel },
                  { label: "Accepted", value: market.accepted },
                  { label: "Declined", value: market.declined },
                ].map((m) => (
                  <div key={m.label} className="rounded-[8px] bg-white/5 px-3 py-2.5">
                    <p className="text-[11px] text-stone-400">{m.label}</p>
                    <p className="mt-1 text-lg font-semibold text-white tabular-nums">{m.value}</p>
                  </div>
                ))}
              </div>
              {market.acceptedValue.length > 0 && (
                <p className="text-xs text-stone-400">
                  Accepted booking value:{" "}
                  <span className="text-white">
                    {market.acceptedValue.map((v) => money(v.amount, v.currency)).join(" + ")}
                  </span>
                </p>
              )}
              <div className="flex flex-col gap-1">
                <p className="text-xs text-stone-400">Waiting for your model to answer</p>
                {market.awaitingList.length ? (
                  <BookingList bookings={market.awaitingList} kind="awaiting" timeZone={data.timeZone} />
                ) : (
                  <Empty>No bookings waiting for an answer.</Empty>
                )}
              </div>
              {market.upcomingList.length > 0 && (
                <div className="flex flex-col gap-1 border-t border-white/10 pt-3">
                  <p className="text-xs text-stone-400">Coming up</p>
                  <BookingList bookings={market.upcomingList} kind="upcoming" timeZone={data.timeZone} />
                </div>
              )}
            </Card>
          )}

          {jobs && (
            <Card
              title="Job applications"
              subtitle={`${jobs.total} sent by your models`}
              href={PAGES.jobs}
              linkText="Job Junction"
            >
              <SegmentBar
                ariaLabel="Job applications of your models by status"
                segments={(["PENDING", "SELECTED", "ACCEPTED", "REJECTED"] as const).map((key) => ({
                  label: JOB_STATUS_LABEL[key],
                  value: jobs.byStatus[key],
                }))}
              />
              <div className="flex flex-col gap-1 border-t border-white/10 pt-3">
                <p className="text-xs text-stone-400">Latest updates</p>
                {jobs.recent.length ? (
                  <ul className="flex flex-col">
                    {jobs.recent.map((a) => (
                      <Row key={a._id} href={`${PAGES.jobs}/${a.jobId}`}>
                        <Avatar src={a.model?.image} name={modelName(a.model)} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-white">{a.title}</p>
                          <p className="truncate text-xs text-stone-400">
                            {modelName(a.model)}
                            {a.companyName ? ` · ${a.companyName}` : ""} · {ago(a.updatedAt)}
                          </p>
                        </div>
                        <Badge tone={a.status === "SELECTED" || a.status === "ACCEPTED" ? "accent" : "neutral"}>
                          {JOB_STATUS_LABEL[a.status] ?? a.status}
                        </Badge>
                      </Row>
                    ))}
                  </ul>
                ) : (
                  <Empty>Your models haven&apos;t applied to any jobs yet.</Empty>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
