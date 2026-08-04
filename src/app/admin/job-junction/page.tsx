"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Tag,
  User,
  CheckCircle2,
  X,
} from "lucide-react";
import { ArrowSeparateVertical } from "iconoir-react";
import { useDebouncedValue } from "@/hooks/useDebounce";
import { JobCard } from "@/app/components/JobCard";
import { useRouter } from "next/navigation";

type JobStatus = "Completed" | "In Progress" | "Pending";

type Job = {
  id: string;
  tag: string;
  title: string;
  image: string;
  applicants: number;
  role: string;
  status: JobStatus;
};

const jobs: Job[] = [
  {
    id: "1",
    tag: "Agent",
    title: "Summer Campaign Shoot",
    image: "https://picsum.photos/seed/summer-campaign/600/700",
    applicants: 40,
    role: "Models",
    status: "Completed",
  },
  {
    id: "2",
    tag: "Agent",
    title: "Urban Streetwear Lookbook",
    image: "https://picsum.photos/seed/streetwear-look/600/700",
    applicants: 40,
    role: "Models",
    status: "Completed",
  },
  {
    id: "3",
    tag: "Agent",
    title: "Fitness Brand Collaboration",
    image: "https://picsum.photos/seed/fitness-brand/600/700",
    applicants: 40,
    role: "Models",
    status: "Completed",
  },
  {
    id: "4",
    tag: "Agent",
    title: "Fitness Brand Collaboration",
    image: "https://picsum.photos/seed/fitness-brand-2/600/700",
    applicants: 40,
    role: "Models",
    status: "Completed",
  },
  {
    id: "5",
    tag: "Designer",
    title: "Jewellery Product Shoot",
    image: "https://picsum.photos/seed/jewellery-shoot/600/700",
    applicants: 40,
    role: "Models",
    status: "Completed",
  },
  {
    id: "6",
    tag: "Agent",
    title: "Urban Streetwear Lookbook",
    image: "https://picsum.photos/seed/streetwear-look-2/600/700",
    applicants: 40,
    role: "Models",
    status: "Completed",
  },
];

const filterOptions = {
  postedBy: ["Posted By", "Agencies", "Brands", "Agents"],
  role: ["Role", "Models", "Designers", "Photographers"],
  status: ["Status", "Completed", "In Progress", "Pending"],
};

const FilterSelect = ({
  options,
  value,
  onChange,
}: {
  options: string[];
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
        <option key={option} value={option} className="bg-[#151518]">
          {option}
        </option>
      ))}
    </select>
    <ArrowSeparateVertical className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
  </label>
);

const JobJunction: React.FC = () => {
  const [postedBy, setPostedBy] = useState(filterOptions.postedBy[0]);
  const [role, setRole] = useState(filterOptions.role[0]);
  const [status, setStatus] = useState(filterOptions.status[0]);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const debouncedSearch = useDebouncedValue(search, 300);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesRole = role === filterOptions.role[0] || job.role === role;
      const matchesStatus =
        status === filterOptions.status[0] || job.status === status;
      const matchesSearch = job.title
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase());
      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [role, status, debouncedSearch]);

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
        <button className="flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-[8px] bg-[#EF476F] px-4 text-sm font-medium text-white hover:bg-[#e13a63]"
        onClick={()=> router.push('/admin/job-junction/post-job')}
        >
          <Plus className="h-4 w-4" />
          Post A New Job
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredJobs.map((job) => (
          <JobCard key={job.id} job={job} href={`/admin/job-junction/${job.id}`} isjob={true} />
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <p className="mt-10 text-center text-[13px] text-stone-500">
          No jobs match your filters.
        </p>
      )}
    </main>
  );
};

export default JobJunction;