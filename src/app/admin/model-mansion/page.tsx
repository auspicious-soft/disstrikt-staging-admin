"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { ArrowSeparateVertical } from "iconoir-react";
import { useDebouncedValue } from "@/hooks/useDebounce";
import { JobCard } from "@/app/components/JobCard";
import Pagination from "@/app/components/Pagination";
import { useCountry } from "@/app/components/CountryContext";
import Loader from "../components/ui/Loader";
import {
  useGetModelMansionAgents,
  useGetModelMansionModels,
} from "@/hooks/useModelMansion";
import { formatName } from "@/lib/media";
import { usePanel } from "@/app/components/PanelContext";

type Option = { label: string; value: string };

type Agent = { _id: string; fullName: string; modelCount: number };

type MansionModel = {
  _id: string;
  fullName: string;
  image?: string;
  headshot?: string;
  likedCount: number;
  savedCount: number;
  bookingCount: number;
};

const FilterSelect = ({
  options,
  value,
  onChange,
}: {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}) => (
  <label className="relative block w-full sm:w-[180px]">
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full appearance-none rounded-[8px] border border-[#2A2A2E] bg-[#151518] px-4 pr-9 text-[13px] text-stone-300 outline-none focus:border-[#EF476F]"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-[#151518]">
          {option.label}
        </option>
      ))}
    </select>
    <ArrowSeparateVertical className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
  </label>
);

const ModelMansion: React.FC = () => {
  const { kind, mansionPath } = usePanel();
  const [agent, setAgent] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const debouncedSearch = useDebouncedValue(search, 500);
  const { country } = useCountry();

  const { data: agents = [] } = useGetModelMansionAgents();
  const { data, isPending, isError } = useGetModelMansionModels({
    page,
    limit,
    search: debouncedSearch.trim(),
    agent,
    country,
  });

  const models: MansionModel[] = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  const agentOptions: Option[] = [
    { label: "All Agents", value: "" },
    ...(agents as Agent[]).map((item) => ({
      label: `${formatName(item.fullName)} (${item.modelCount})`,
      value: item._id,
    })),
    { label: "Unassigned", value: "unassigned" },
  ];

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, agent, country]);

  return (
    <main className="min-h-screen w-full text-stone-100">
      <div className="mb-6 flex justify-end flex-col gap-3 sm:flex-row sm:items-center">
        {/* Agents only see their own models, so no agent filter for them */}
        {kind === "admin" && (
          <FilterSelect options={agentOptions} value={agent} onChange={setAgent} />
        )}

        <label className="relative block w-full sm:w-[220px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or email"
            className="h-10 w-full rounded-[8px] border border-[#2A2A2E] bg-[#151518] pl-4 pr-9 text-[13px] text-stone-300 outline-none placeholder:text-stone-500 focus:border-[#EF476F]"
          />
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
        </label>
      </div>

      {isPending ? (
        <Loader />
      ) : isError ? (
        <p className="mt-10 text-center text-[13px] text-stone-500">
          Couldn&apos;t load models. Please try again.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {models.map((model) => (
              <JobCard
                key={model._id}
                job={{
                  _id: model._id,
                  name: formatName(model.fullName),
                  // Headshot first, then the profile photo
                  image: [model.headshot, model.image].filter(Boolean),
                  likes: model.likedCount,
                  saves: model.savedCount,
                  booking: model.bookingCount,
                }}
                href={`${mansionPath}/${model._id}`}
                isjob={false}
              />
            ))}
          </div>

          {models.length === 0 && (
            <p className="mt-10 text-center text-[13px] text-stone-500">
              No models match your filters.
            </p>
          )}

          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </main>
  );
};

export default ModelMansion;
