"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Clock3, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { Calendar } from "iconoir-react";
import SafeImage from "@/app/components/SafeImage";
import { formatName } from "@/lib/media";
import { usePanel } from "@/app/components/PanelContext";
import { getSession } from "@/lib/auth";
import {
  PROJECT_STATUS_BADGE,
  STATUS_PILL_CLASS,
  useGetModelMarketProject,
  type ProjectStatus,
} from "@/hooks/useModelMarket";
import {
  formatDate,
  formatMoney,
  formatTime,
  titleCase,
} from "../../model-mansion/[id]/format";
import Loader from "../../components/ui/Loader";
import ProjectGroupChat from "./ProjectGroupChat";

type ProjectModel = {
  bookingId: string;
  userId: string;
  fullName: string;
  image: string | null;
  headshot: string | null;
  country: string | null;
  agent: { _id: string; fullName: string } | null;
  height: number | null;
  bust: number | null;
  waist: number | null;
  hips: number | null;
  shoeSize: string | null;
  budget: number;
  paymentStatus: "pending" | "success" | "failed" | "cancelled";
  modelStatus: "pending" | "accepted" | "rejected";
  isRefunded: boolean;
};

// One badge per booked model: payment first, then the model's answer
const modelBadge = (model: ProjectModel) => {
  if (model.paymentStatus === "pending") return { label: "Awaiting Payment", className: "bg-[#3A7BD5]" };
  if (model.paymentStatus !== "success") return { label: titleCase(model.paymentStatus), className: "bg-[#6B6B6B]" };
  if (model.modelStatus === "accepted") return { label: "Accepted", className: "bg-[#3DA755]" };
  if (model.modelStatus === "rejected") {
    return { label: model.isRefunded ? "Rejected · Refunded" : "Rejected", className: "bg-[#E0414F]" };
  }
  return { label: "Awaiting Answer", className: "bg-[#E09F1F]" };
};

const cm = (value: number | null) => (value ? Math.round(value) : "-");

const ModelCard = ({ model, currency }: { model: ProjectModel; currency: string | null }) => {
  const badge = modelBadge(model);
  const { kind, mansionPath } = usePanel();
  // Agents can open only their own models; others in the project are view-only
  const canOpen =
    kind === "admin" || String(model.agent?._id) === String(getSession().admin?._id);

  return (
    <article className="flex min-w-0 gap-3 rounded-md bg-white/10 p-2">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-stone-800">
        <SafeImage
          src={[model.headshot, model.image].filter(Boolean)}
          alt={formatName(model.fullName)}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="min-w-0 flex-1 py-1">
        <div className="flex items-start justify-between gap-2">
          <h2 className="truncate text-base font-medium text-stone-100">
            {formatName(model.fullName)}
          </h2>
          <span className="shrink-0 text-sm font-semibold text-rose-500">
            {formatMoney(model.budget, currency)}
          </span>
        </div>

        <div className="mt-1 flex items-center gap-1 text-xs font-light text-stone-400">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {model.country || "-"} · Agent: {formatName(model.agent?.fullName) || "Unassigned"}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-light text-stone-400">
          <span>{model.height ? `${cm(model.height)} cm` : "-"}</span>
          <span>
            {cm(model.bust)} / {cm(model.waist)} / {cm(model.hips)}
          </span>
          <span>{model.shoeSize ? `Shoe ${model.shoeSize}` : ""}</span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          {canOpen ? (
            <Link
              href={`${mansionPath}/${model.userId}`}
              className="text-xs font-medium text-white/70 underline"
            >
              View Portfolio
            </Link>
          ) : (
            <span className="text-xs text-white/40">Another agent&apos;s model</span>
          )}
          <span
            className={`${STATUS_PILL_CLASS} ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>
      </div>
    </article>
  );
};

const Panel = ({
  title,
  children,
  right,
}: {
  title: string;
  children: ReactNode;
  right?: ReactNode;
}) => (
  <section className="overflow-hidden rounded-md border border-stone-700 bg-black/10">
    <div className="flex h-10 items-center justify-between bg-white/10 px-3">
      <h1 className="text-sm font-medium text-stone-100">{title}</h1>
      {right}
    </div>
    <div className="p-3">{children}</div>
  </section>
);

const InfoItem = ({
  label,
  value,
  labelClassName = "",
  valueClassName = "",
}: {
  label: string;
  value: string;
  labelClassName?: string;
  valueClassName?: string;
}) => (
  <div>
    <p className={labelClassName}>{label}</p>
    <p className={valueClassName}>{value}</p>
  </div>
);

const ModelMarketDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project, isPending, isError, error } = useGetModelMarketProject(id);

  if (isPending) return <Loader />;

  if (isError || !project) {
    const message =
      (error as any)?.response?.data?.message || "Couldn't load this booking.";
    return <p className="mt-10 text-center text-[13px] text-stone-500">{message}</p>;
  }

  const models: ProjectModel[] = project.models ?? [];
  const activeModels = models.filter((model) =>
    ["pending", "success"].includes(model.paymentStatus),
  );
  const budgets = new Set(activeModels.map((model) => model.budget));
  const times: string[] = (project.slot ?? [])
    .map((slot: { dateTime: string }) => slot.dateTime)
    .filter(Boolean)
    .sort();
  const dates = [...new Set(times.map((time) => formatDate(time)))];
  const badge = PROJECT_STATUS_BADGE[project.status as ProjectStatus];
  const smallLabel = "text-white/60 text-[10px] font-normal";
  const smallValue = "mt-1 text-xs font-medium text-stone-100";

  return (
    <div className="w-full space-y-4 text-stone-100">
      <Panel
        title={`${models.length} Selected Model${models.length === 1 ? "" : "s"} · ${project.projectName || "Untitled project"}`}
        right={
          badge && (
            <span
              className={`${STATUS_PILL_CLASS} ${badge.className}`}
            >
              {badge.label}
            </span>
          )
        }
      >
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {models.map((model) => (
            <ModelCard key={model.bookingId} model={model} currency={project.currency} />
          ))}
        </div>
      </Panel>

      <Panel title="Booking Summary">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1.5fr]">
          <div className="rounded-md p-2">
            <div className="flex items-center justify-between gap-4">
              <InfoItem
                label={formatName(project.client?.fullName) || "Deleted user"}
                value={titleCase(project.client?.agencyType || project.client?.userMode)}
                labelClassName="text-rose-500 text-sm font-medium"
                valueClassName="text-[10px] text-stone-500"
              />
              <span className="text-sm font-semibold text-rose-500">
                {formatMoney(project.totalBudget, project.currency)}
              </span>
            </div>

            <div className="mt-3 space-y-2 text-[10px] font-normal text-stone-400">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                {project.location || "-"}
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-2 border-r border-stone-600 pr-4">
                  <Calendar className="h-3.5 w-3.5" />
                  {dates.length ? dates.join(", ") : "-"}
                </span>
                <span className="flex items-center gap-2">
                  <Clock3 className="h-3.5 w-3.5" />
                  {times.length ? times.map((time) => formatTime(time)).join(", ") : "-"}
                </span>
              </div>
              <p>Requested {formatDate(project.createdAt)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 rounded-md bg-white/10 p-4 md:grid-cols-3">
            <InfoItem
              label="Travel Covered"
              value={project.travelCover ? "Yes" : "No"}
              labelClassName={smallLabel}
              valueClassName={smallValue}
            />
            <InfoItem
              label="TFP"
              value={project.tfp ? "Yes" : "No"}
              labelClassName={smallLabel}
              valueClassName={smallValue}
            />
            <InfoItem
              label="Creative Team"
              value={project.creativeTeam?.length ? project.creativeTeam.join(", ") : "-"}
              labelClassName={smallLabel}
              valueClassName={smallValue}
            />
          </div>
        </div>
      </Panel>

      <Panel title="Investment">
        <div className="grid grid-cols-1 gap-5 px-1 pb-4 md:grid-cols-4">
          <InfoItem
            label="Investment Per Model"
            value={
              budgets.size > 1
                ? "Varies per model"
                : formatMoney(activeModels[0]?.budget ?? 0, project.currency)
            }
            labelClassName={smallLabel}
            valueClassName={smallValue}
          />
          <InfoItem
            label="Total Number Of Models"
            value={String(activeModels.length)}
            labelClassName={smallLabel}
            valueClassName={smallValue}
          />
          <InfoItem
            label="Paid"
            value={formatMoney(project.paidTotal, project.currency)}
            labelClassName={smallLabel}
            valueClassName={smallValue}
          />
          <InfoItem
            label="Refunded"
            value={formatMoney(project.refundedTotal, project.currency)}
            labelClassName={smallLabel}
            valueClassName={smallValue}
          />
        </div>

        <div className="flex items-center justify-between rounded-md bg-white/10 px-4 py-3">
          <span className="text-xs font-medium text-stone-100">Total</span>
          <span className="text-base font-medium text-rose-500">
            {formatMoney(project.totalBudget, project.currency)}
          </span>
        </div>
      </Panel>

      <h2 className="mb-2 mt-5 text-xl font-medium">Group Chat</h2>
      <ProjectGroupChat projectId={id} />
    </div>
  );
};

export default ModelMarketDetailsPage;
