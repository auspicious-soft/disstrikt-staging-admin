"use client";

import React, { ReactElement, useEffect, useState } from "react";
import CustomInput from "@/app/components/CustomInput";
import CustomSelect from "@/app/components/CustomSelect";
import DynamicTable from "@/app/components/DynamicTable";
import Pagination from "@/app/components/Pagination";
import { useCountry } from "@/app/components/CountryContext";
import { Search, ChevronsUpDown } from "lucide-react";
import eyeimg from "../../../assets/icons/Eye.png";
import { useRouter } from "next/navigation";
import { useDebouncedValue } from "@/hooks/useDebounce";
import { useGetModelMansionAgents } from "@/hooks/useModelMansion";
import {
  PROJECT_STATUS_BADGE,
  STATUS_PILL_CLASS,
  useGetModelMarketProjects,
  type ProjectStatus,
} from "@/hooks/useModelMarket";
import { formatMoney, titleCase } from "../model-mansion/[id]/format";
import Loader from "../components/ui/Loader";
import { formatName } from "@/lib/media";
import { usePanel } from "@/app/components/PanelContext";

interface TableHeader {
  label: string;
  key: string;
  width?: string;
  icon?: ReactElement;
  align?: "start" | "end" | "center";
  fontWeight?: string;
}

type MarketTab = "market" | "collab";

const TABS: { label: string; value: MarketTab }[] = [
  { label: "Market", value: "market" },
  { label: "Collab", value: "collab" },
];

const COUNTRY_NAMES: Record<string, string> = {
  NL: "Netherlands",
  BE: "Belgium",
  FR: "France",
  UK: "United Kingdom",
  ES: "Spain",
  US: "United States",
};

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  ...Object.entries(PROJECT_STATUS_BADGE).map(([value, badge]) => ({
    label: badge.label,
    value,
  })),
];

const sortIcon = <ChevronsUpDown className="w-4 h-4" />;

// Widths sized to content: short values (count, budget) stay narrow, and
// names wrap instead of being cut off (see WRAP_KEYS)
const MARKET_HEADERS: TableHeader[] = [
  { label: "Booker", key: "booker", icon: sortIcon, width: "w-40" },
  { label: "Project", key: "project", icon: sortIcon, width: "w-56" },
  { label: "Type", key: "type", icon: sortIcon, width: "w-32" },
  { label: "Models", key: "models", icon: sortIcon, width: "w-28" },
  { label: "Budget", key: "budget", icon: sortIcon, width: "w-28" },
  { label: "Agent", key: "agent", icon: sortIcon, width: "w-40" },
  { label: "Country", key: "country", icon: sortIcon, width: "w-36" },
  { label: "Status", key: "status", icon: sortIcon, width: "w-44" },
];

// Columns shown in full on multiple lines rather than truncated
const WRAP_KEYS = new Set(["booker", "project", "agent"]);

type ProjectRow = {
  _id: string;
  projectName: string;
  client: { fullName: string; country?: string; userMode?: string; agencyType?: string } | null;
  agents: { _id: string; fullName: string }[];
  currency: string | null;
  status: ProjectStatus;
  modelCount: number;
  totalBudget: number;
};

const ModelMarket: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MarketTab>("market");
  const [search, setSearch] = useState("");
  const [agent, setAgent] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const router = useRouter();
  const { kind, marketPath } = usePanel();
  const { country } = useCountry();

  const debouncedSearch = useDebouncedValue(search, 500);

  const { data: agents = [] } = useGetModelMansionAgents();
  const { data, isPending, isError } = useGetModelMarketProjects({
    page,
    limit,
    search: debouncedSearch.trim(),
    agent,
    country,
    status,
  });

  const projects: ProjectRow[] = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  // Flat, sortable values for the table; status is rendered as a badge
  const rows = projects.map((project) => ({
    _id: project._id,
    booker: formatName(project.client?.fullName) || "Deleted user",
    project: project.projectName || "Untitled project",
    type: titleCase(project.client?.agencyType || project.client?.userMode) || "-",
    models: project.modelCount,
    budget: formatMoney(project.totalBudget, project.currency),
    agent: project.agents.map((item) => formatName(item.fullName)).join(", ") || "Unassigned",
    country: COUNTRY_NAMES[project.client?.country || ""] || project.client?.country || "-",
    status: project.status,
  }));

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, agent, status, country, activeTab]);

  return (
    <div className="w-full inline-flex flex-col justify-center items-start gap-10">
      <div className="self-stretch flex flex-col justify-start items-end gap-2.5">
        <div className="flex flex-wrap justify-between items-end gap-2.5 w-full">
          <div className="w-fit max-w-full overflow-x-auto">
            <div className="flex min-w-max rounded-full bg-white/10 p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`rounded-full px-4 py-2 text-xs font-normal transition-colors ${
                    activeTab === tab.value
                      ? "bg-rose-500 text-white"
                      : "text-stone-400 hover:bg-stone-800 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "market" && (
            <div className="flex flex-col sm:flex-row items-end gap-2.5 w-full sm:w-auto">
              <div className="w-52">
                <CustomSelect
                  placeholder="Select Status"
                  options={STATUS_OPTIONS}
                  value={status}
                  onChange={setStatus}
                />
              </div>
              {/* Agents only see projects with their own models */}
              {kind === "admin" && (
              <div className="w-52">
                <CustomSelect
                  placeholder="Select Agent"
                  options={[
                    { label: "All Agents", value: "" },
                    ...(agents as { _id: string; fullName: string }[]).map((item) => ({
                      label: formatName(item.fullName),
                      value: item._id,
                    })),
                  ]}
                  value={agent}
                  onChange={setAgent}
                />
              </div>
              )}
              <div className="w-full sm:w-auto">
                <CustomInput
                  placeholder="Search booker or project"
                  icon={<Search className="w-4 h-4" />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {activeTab === "collab" ? (
          <div className="self-stretch rounded-md border border-stone-800 bg-black/10 px-4 py-10 text-center">
            <p className="text-sm text-stone-300">Collabs aren&apos;t available yet.</p>
            <p className="mt-1 text-xs text-stone-500">
              There is no collab data in the app to show here.
            </p>
          </div>
        ) : isPending ? (
          <div className="self-stretch">
            <Loader />
          </div>
        ) : isError ? (
          <p className="self-stretch py-10 text-center text-sm text-stone-500">
            Couldn&apos;t load bookings. Please try again.
          </p>
        ) : (
          <>
            <div className="self-stretch rounded-md outline outline-offset-[-1px] outline-stone-700">
              <DynamicTable
                headers={MARKET_HEADERS}
                data={rows}
                rowIcon={eyeimg.src}
                onclickFunction={(id) => router.push(`${marketPath}/${id}`)}
                showActionsHeaderLabel={false}
                renderCell={(row, key) => {
                  if (WRAP_KEYS.has(key)) {
                    return (
                      <span className="block whitespace-normal break-words">
                        {row[key]}
                      </span>
                    );
                  }
                  if (key !== "status") return row[key];
                  const badge = PROJECT_STATUS_BADGE[row.status as ProjectStatus];
                  return (
                    <span
                      className={`${STATUS_PILL_CLASS} ${badge?.className ?? "bg-[#6B6B6B]"}`}
                    >
                      {badge?.label ?? row.status}
                    </span>
                  );
                }}
              />
              {!rows.length && (
                <p className="py-8 text-center text-sm text-stone-500">
                  No bookings match your filters.
                </p>
              )}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ModelMarket;
