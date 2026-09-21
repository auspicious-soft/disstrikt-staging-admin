"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, Tag, User, CheckCircle2, X } from "lucide-react";
import { ArrowSeparateVertical } from "iconoir-react";
import { useDebouncedValue } from "@/hooks/useDebounce";
import { JobCard } from "@/app/components/JobCard";
import { useRouter } from "next/navigation";
import { useGetJobJunction } from "@/hooks/useAdmin";
import Pagination from "@/app/components/Pagination";
import { useCountry } from "@/app/components/CountryContext";
import Loader from "../components/ui/Loader";

type Option = { label: string; value: string };

const filterOptions: Record<"postedBy" | "role" | "status", Option[]> = {
  postedBy: [
    { label: "Posted By", value: "" },
    { label: "AGENCY", value: "AGENCIES" },
    { label: "DESIGNER", value: "DESIGNER" },
    { label: "PHOTOGRAPHER", value: "PHOTOGRAPHER" },
    { label: "BEAUTY PROFESSIONALS", value: "STYLIST" },
    { label: "DISTRIKT", value: "DISTRIKT" },
  ],
  role: [
    { label: "Role", value: "" },
    { label: "MODEL", value: "MODEL" },
    { label: "DESIGNER", value: "DESIGNER" },
    { label: "PHOTOGRAPHER", value: "PHOTOGRAPHER" },
    { label: "BEAUTY PROFESSIONALS", value: "STYLIST" },
  ],
  status: [
    { label: "Status", value: "" },
    { label: "Completed", value: "Completed" },
    { label: "Pending", value: "Pending" },
  ],
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
  <label className="relative block w-full sm:w-[150px]">
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full appearance-none rounded-[8px] border border-[#2A2A2E] bg-[#151518] px-4 pr-9 text-[13px] text-stone-300 outline-none focus:border-[#EF476F]"
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="bg-[#151518]"
        >
          {option.label}
        </option>
      ))}
    </select>
    <ArrowSeparateVertical className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
  </label>
);

const JobJunction: React.FC = () => {
  const router = useRouter();
  const [postedBy, setPostedBy] = useState(filterOptions.postedBy[0].value);
  const [role, setRole] = useState(filterOptions.role[0].value);
  const [status, setStatus] = useState(filterOptions.status[0].value);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const debouncedSearch = useDebouncedValue(search, 500);
  const { country } = useCountry();
  const { data, isPending } = useGetJobJunction({
  search: debouncedSearch,
  page,
  limit,
  country,
  status,
  role,
  postedBy,
});
  const jobs = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, postedBy, role, status, country]);
  return (
    <main className="min-h-screen w-full text-stone-100">
      <div className="mb-6 flex justify-end flex-col gap-3 sm:flex-row sm:items-center">
        {/* <div className="flex flex-1 flex-col gap-3 sm:flex-row"> */}
        <FilterSelect
          options={filterOptions.postedBy}
          value={postedBy}
          onChange={setPostedBy}
        />
        <FilterSelect
          options={filterOptions.role}
          value={role}
          onChange={setRole}
        />
        <FilterSelect
          options={filterOptions.status}
          value={status}
          onChange={setStatus}
        />
        <label className="relative block w-full sm:w-[220px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search"
            className="h-10 w-full rounded-[8px] border border-[#2A2A2E] bg-[#151518] pl-4 pr-4 text-[13px] text-stone-300 outline-none placeholder:text-stone-500 focus:border-[#EF476F]"
          />
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
        </label>
        {/* </div> */}
        <button
          className="flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-[8px] bg-[#EF476F] px-4 text-sm font-medium text-white hover:bg-[#e13a63]"
          onClick={() => router.push("/admin/job-junction/post-job")}
        >
          <Plus className="h-4 w-4" />
          Post A New Job
        </button>
      </div>

      {isPending ? (
        <Loader />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                href={`/admin/job-junction/${job._id}`}
                isjob={true}
              />
            ))}
          </div>

          {jobs.length === 0 && (
            <p className="mt-10 text-center text-[13px] text-white">
              No jobs found.
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

export default JobJunction;
