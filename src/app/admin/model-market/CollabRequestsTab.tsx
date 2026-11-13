"use client";

import React, { useEffect, useState } from "react";
import { Search, ChevronsUpDown, X } from "lucide-react";
import CustomInput from "@/app/components/CustomInput";
import CustomSelect from "@/app/components/CustomSelect";
import DynamicTable from "@/app/components/DynamicTable";
import Pagination from "@/app/components/Pagination";
import { useCountry } from "@/app/components/CountryContext";
import { useDebouncedValue } from "@/hooks/useDebounce";
import {
  COLLAB_STATUS_BADGE,
  CollabRequest,
  CollabStatus,
  useCollabRequests,
} from "@/hooks/useCollabRequests";
import { STATUS_PILL_CLASS } from "@/hooks/useModelMarket";
import { titleCase } from "../model-mansion/[id]/format";
import { formatName } from "@/lib/media";
import Loader from "../components/ui/Loader";
import eyeimg from "../../../assets/icons/Eye.png";

const sortIcon = <ChevronsUpDown className="w-4 h-4" />;

const HEADERS = [
  { label: "Requester", key: "requester", icon: sortIcon, width: "w-44" },
  { label: "Studio", key: "studio", icon: sortIcon, width: "w-44" },
  { label: "Collab type", key: "types", icon: sortIcon, width: "w-48" },
  { label: "Location", key: "location", icon: sortIcon, width: "w-36" },
  { label: "Sent", key: "sent", icon: sortIcon, width: "w-32" },
  { label: "Status", key: "status", icon: sortIcon, width: "w-32" },
];

const WRAP_KEYS = new Set(["requester", "studio", "types", "location"]);

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  ...Object.entries(COLLAB_STATUS_BADGE).map(([value, badge]) => ({ label: badge.label, value })),
];

const formatDate = (value?: string | null, time = false) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        ...(time ? { hour: "2-digit", minute: "2-digit" } : {}),
      })
    : "-";

const StatusPill = ({ status }: { status: CollabStatus }) => {
  const badge = COLLAB_STATUS_BADGE[status];
  return (
    <span className={`${STATUS_PILL_CLASS} ${badge?.className ?? "bg-[#6B6B6B]"}`}>
      {badge?.label ?? status}
    </span>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="text-[11px] uppercase tracking-wide text-stone-500">{label}</p>
    <div className="mt-0.5 break-words text-sm text-stone-200">{children || "-"}</div>
  </div>
);

const requesterName = (r: CollabRequest) =>
  formatName(r.requester?.fullName || r.personalInfo?.fullName) || "Deleted user";

const studioName = (r: CollabRequest) => r.studio?.studioName || formatName(r.studio?.fullName) || "Deleted studio";

const CollabDetails = ({ request, onClose }: { request: CollabRequest; onClose: () => void }) => {
  const info = request.personalInfo ?? ({} as CollabRequest["personalInfo"]);
  const socials = request.socials ?? ({} as CollabRequest["socials"]);
  const phone = [info.countryCode, info.phone].filter(Boolean).join(" ");
  const place = [info.city, info.country].filter(Boolean).join(", ");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[14px] border border-[#232327] bg-[#111115] p-5 text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">
              {requesterName(request)} × {studioName(request)}
            </h3>
            <p className="mt-1 text-xs text-stone-400">Sent {formatDate(request.createdAt, true)}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill status={request.status} />
            <button onClick={onClose} aria-label="Close" className="text-stone-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Requester">
            {requesterName(request)}
            {request.requester?.userMode ? ` · ${titleCase(request.requester.userMode)}` : ""}
          </Field>
          <Field label="Studio">{studioName(request)}</Field>
          <Field label="Email">{info.email}</Field>
          <Field label="Phone">{phone}</Field>
          <Field label="City / country">{place}</Field>
          <Field label="Shoot location">{request.location}</Field>
          <Field label="Collab type">{request.collabTypes?.join(", ")}</Field>
          <Field label="Primary audience">{request.primaryAudience?.join(", ")}</Field>
          <Field label="Instagram">
            {socials.instagramHandle
              ? `${socials.instagramHandle}${socials.instagramFollowers != null ? ` · ${socials.instagramFollowers.toLocaleString()} followers` : ""}`
              : ""}
          </Field>
          <Field label="TikTok">
            {socials.tiktokHandle
              ? `${socials.tiktokHandle}${socials.tiktokFollowers != null ? ` · ${socials.tiktokFollowers.toLocaleString()} followers` : ""}`
              : ""}
          </Field>
        </div>

        <div className="mt-4 space-y-4">
          <Field label="Idea">
            <p className="whitespace-pre-line">{request.idea}</p>
          </Field>
          {request.preferences && (
            <Field label="Preferences">
              <p className="whitespace-pre-line">{request.preferences}</p>
            </Field>
          )}
          {request.slots?.length > 0 && (
            <Field label={`Proposed dates${request.timeZone ? ` (${request.timeZone})` : ""}`}>
              <ul className="space-y-0.5">
                {request.slots.map((slot, i) => (
                  <li key={i}>
                    {slot.date} · {slot.startTime}
                  </li>
                ))}
              </ul>
            </Field>
          )}
          {request.references?.length > 0 && (
            <Field label="References">
              <ul className="space-y-0.5">
                {request.references.map((ref, i) => (
                  <li key={i}>
                    {/^https?:\/\//i.test(ref) ? (
                      <a href={ref} target="_blank" rel="noreferrer" className="text-[#EF476F] hover:underline">
                        {ref}
                      </a>
                    ) : (
                      ref
                    )}
                  </li>
                ))}
              </ul>
            </Field>
          )}
          {request.respondedAt && (
            <Field label={request.status === "cancelled" ? "Cancelled" : "Studio response"}>
              {formatDate(request.respondedAt, true)}
              {request.responseNote ? ` · ${request.responseNote}` : ""}
            </Field>
          )}
        </div>
      </div>
    </div>
  );
};

const CollabRequestsTab: React.FC = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CollabRequest | null>(null);
  const { country } = useCountry();
  const debouncedSearch = useDebouncedValue(search, 500);

  const { data, isPending, isError } = useCollabRequests({
    page,
    limit: 10,
    search: String(debouncedSearch ?? "").trim(),
    status,
    country,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, country]);

  const requests = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  const rows = requests.map((r) => ({
    _id: r._id,
    requester: requesterName(r),
    studio: studioName(r),
    types: r.collabTypes?.join(", ") || "-",
    location: r.location || [r.personalInfo?.city, r.personalInfo?.country].filter(Boolean).join(", ") || "-",
    sent: formatDate(r.createdAt),
    status: r.status,
  }));

  return (
    <div className="self-stretch flex flex-col gap-2.5">
      <div className="flex flex-col sm:flex-row justify-end items-end gap-2.5">
        <div className="w-52">
          <CustomSelect placeholder="Select Status" options={STATUS_OPTIONS} value={status} onChange={setStatus} />
        </div>
        <div className="w-full sm:w-auto">
          <CustomInput
            placeholder="Search requester or studio"
            icon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value.replace(/^\s+/, ""))}
          />
        </div>
      </div>

      {isPending ? (
        <Loader />
      ) : isError ? (
        <p className="py-10 text-center text-sm text-stone-500">Couldn&apos;t load collab requests. Please try again.</p>
      ) : (
        <>
          <div className="rounded-md outline outline-offset-[-1px] outline-stone-700">
            <DynamicTable
              headers={HEADERS}
              data={rows}
              rowIcon={eyeimg.src}
              onclickFunction={(id) => setSelected(requests.find((r) => r._id === id) ?? null)}
              showActionsHeaderLabel={false}
              renderCell={(row, key) => {
                if (key === "status") return <StatusPill status={row.status} />;
                if (WRAP_KEYS.has(key)) {
                  return <span className="block whitespace-normal break-words">{row[key]}</span>;
                }
                return row[key];
              }}
            />
            {!rows.length &&
              (String(debouncedSearch ?? "").trim() || status || country) && (
              <p className="py-8 text-center text-sm text-stone-500">No collab requests match your filters.</p>
            )}
          </div>

          {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
        </>
      )}

      {selected && <CollabDetails request={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default CollabRequestsTab;
