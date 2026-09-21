"use client";

import React, { ReactElement, useEffect, useMemo, useState } from "react";
import CustomInput from "@/app/components/CustomInput";
import CustomSelect from "@/app/components/CustomSelect";
import DynamicTable from "@/app/components/DynamicTable";
import Pagination from "@/app/components/Pagination";
import { Search, ChevronsUpDown } from "lucide-react";
import eyeimg from "../../../assets/icons/Eye.png";
import { useRouter } from "next/navigation";
import { useDebouncedValue } from "@/hooks/useDebounce";

type TableRow = { _id: string } & Record<string, string>;

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

const sortIcon = <ChevronsUpDown className="w-4 h-4" />;

// ---------- Market tab ----------
const MARKET_HEADERS: TableHeader[] = [
  { label: "Booker", key: "booker", icon: sortIcon },
  { label: "Type", key: "type", icon: sortIcon },
  { label: "Models", key: "models", icon: sortIcon },
  { label: "Budget", key: "budget", icon: sortIcon },
  { label: "Agent", key: "agent", icon: sortIcon },
  { label: "Country", key: "country", icon: sortIcon },
  { label: "Status", key: "status", icon: sortIcon },
];

const MARKET_DATA: TableRow[] = [
  {
    _id: "1",
    booker: "Elite Models Ltd.",
    type: "Fashion",
    models: "1",
    budget: "$2,500",
    agent: "Sarah",
    country: "United Kingdom",
    status: "Open",
  },
  {
    _id: "2",
    booker: "Vision Media",
    type: "Commercial",
    models: "1",
    budget: "$1,800",
    agent: "Sarah",
    country: "Canada",
    status: "Closed",
  },
  {
    _id: "3",
    booker: "Luxury Brands",
    type: "Lifestyle",
    models: "1",
    budget: "$3,000",
    agent: "Michael",
    country: "United States",
    status: "In Review",
  },
  {
    _id: "4",
    booker: "Next Agency",
    type: "Editorial",
    models: "1",
    budget: "$1,200",
    agent: "Sarah",
    country: "Australia",
    status: "Open",
  },
  {
    _id: "5",
    booker: "Fashion Hub",
    type: "Runway",
    models: "2",
    budget: "$4,500",
    agent: "Michael",
    country: "France",
    status: "Completed",
  },
  {
    _id: "6",
    booker: "Prime Casting",
    type: "Commercial",
    models: "4",
    budget: "$2,100",
    agent: "Sarah",
    country: "Germany",
    status: "Open",
  },
  {
    _id: "7",
    booker: "Urban Studio",
    type: "Fitness",
    models: "3",
    budget: "$1,900",
    agent: "Michael",
    country: "India",
    status: "Closed",
  },
  {
    _id: "8",
    booker: "Creative Works",
    type: "Beauty",
    models: "2",
    budget: "$2,750",
    agent: "Sarah",
    country: "Italy",
    status: "In Review",
  },
  {
    _id: "9",
    booker: "Iconic Agency",
    type: "Catalogue",
    models: "3",
    budget: "$3,250",
    agent: "Michael",
    country: "Spain",
    status: "Completed",
  },
  {
    _id: "10",
    booker: "Global Talent",
    type: "E-commerce",
    models: "5",
    budget: "$2,900",
    agent: "Sarah",
    country: "United States",
    status: "Open",
  },
];

// ---------- Collab tab ----------
const COLLAB_HEADERS: TableHeader[] = [
  { label: "Collaborator", key: "collaborator", icon: sortIcon },
  { label: "Type", key: "type", icon: sortIcon },
  { label: "Models", key: "models", icon: sortIcon },
  { label: "Compensation", key: "compensation", icon: sortIcon },
  { label: "Agent", key: "agent", icon: sortIcon },
  { label: "Country", key: "country", icon: sortIcon },
  { label: "Status", key: "status", icon: sortIcon },
];

const COLLAB_DATA: TableRow[] = [
  {
    _id: "c1",
    collaborator: "Studio Nova",
    type: "Photoshoot",
    models: "2",
    compensation: "TFP",
    agent: "Sarah",
    country: "United Kingdom",
    status: "Open",
  },
  {
    _id: "c2",
    collaborator: "Lens & Light",
    type: "Editorial",
    models: "1",
    compensation: "Paid",
    agent: "Michael",
    country: "France",
    status: "In Review",
  },
  {
    _id: "c3",
    collaborator: "Glow Beauty Co.",
    type: "Beauty",
    models: "3",
    compensation: "Barter",
    agent: "Sarah",
    country: "Spain",
    status: "Open",
  },
  {
    _id: "c4",
    collaborator: "Street Frame",
    type: "Lifestyle",
    models: "2",
    compensation: "TFP",
    agent: "Michael",
    country: "Netherlands",
    status: "Closed",
  },
  {
    _id: "c5",
    collaborator: "Atelier 9",
    type: "Fashion",
    models: "4",
    compensation: "Paid",
    agent: "Sarah",
    country: "Belgium",
    status: "Completed",
  },
  {
    _id: "c6",
    collaborator: "Golden Hour Films",
    type: "Video",
    models: "2",
    compensation: "Paid",
    agent: "Michael",
    country: "United Kingdom",
    status: "Open",
  },
  {
    _id: "c7",
    collaborator: "Pixel & Pose",
    type: "Portfolio",
    models: "1",
    compensation: "TFP",
    agent: "Sarah",
    country: "France",
    status: "In Review",
  },
  {
    _id: "c8",
    collaborator: "Velvet Studio",
    type: "Swimwear",
    models: "3",
    compensation: "Barter",
    agent: "Michael",
    country: "Spain",
    status: "Closed",
  },
  {
    _id: "c9",
    collaborator: "Northern Lights",
    type: "Commercial",
    models: "2",
    compensation: "Paid",
    agent: "Sarah",
    country: "Netherlands",
    status: "Completed",
  },
  {
    _id: "c10",
    collaborator: "Raw Frames",
    type: "Editorial",
    models: "1",
    compensation: "TFP",
    agent: "Michael",
    country: "Belgium",
    status: "Open",
  },
];

const ModelMarket: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MarketTab>("market");
  const [search, setSearch] = useState("");
  const [agent, setAgent] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const router = useRouter();

  const debouncedSearch = useDebouncedValue(search, 500);

  const headers = activeTab === "market" ? MARKET_HEADERS : COLLAB_HEADERS;
  const sourceData = activeTab === "market" ? MARKET_DATA : COLLAB_DATA;

  const filteredUsers = useMemo(() => {
    let data = [...sourceData];

    if (agent) {
      data = data.filter((row) => row.agent === agent);
    }

    if (debouncedSearch) {
      const keyword = debouncedSearch.toLowerCase();

      // Search across every visible column (skips the internal _id).
      data = data.filter((row) =>
        headers.some((header) =>
          (row[header.key] ?? "").toLowerCase().includes(keyword),
        ),
      );
    }

    return data;
  }, [sourceData, headers, agent, debouncedSearch]);

  const totalPages = Math.ceil(filteredUsers.length / limit);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredUsers.slice(start, start + limit);
  }, [filteredUsers, page, limit]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, agent, activeTab]);

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

          <div className="flex flex-col sm:flex-row items-end gap-2.5 w-full sm:w-auto">
            <div className="w-52">
              <CustomSelect
                placeholder="Select Agent"
                options={[
                  { label: "All", value: "" },
                  { label: "Sarah", value: "Sarah" },
                  { label: "Michael", value: "Michael" },
                ]}
                value={agent}
                onChange={setAgent}
              />
            </div>
            <div className="w-full sm:w-auto">
              <CustomInput
                placeholder="Search"
                icon={<Search className="w-4 h-4" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="self-stretch rounded-md outline outline-offset-[-1px] outline-stone-700">
          <DynamicTable
            headers={headers}
            data={paginatedUsers}
            rowIcon={eyeimg.src}
            onclickFunction={(id) =>
              router.push(
                activeTab === "market"
                  ? `/admin/model-market/${id}`
                  : `/admin/model-market/${id}?tab=collab`,
              )
            }
            showActionsHeaderLabel={false}
          />
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

export default ModelMarket;