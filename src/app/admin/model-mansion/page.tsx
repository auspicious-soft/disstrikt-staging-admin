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

type Job = {
  id: string;
  tag: string;
  name: string;
  image: string;
  likes: number;
  saves: number;
  booking: number;
};

const jobs: Job[] = [
  {
    id: "1",
    tag: "Agent",
    name: "Summer Campaign Shoot",
    image: "https://picsum.photos/seed/summer-campaign/600/700",
    likes: 40,
    saves: 40,
    booking: 50,
  },
  {
    id: "2",
    tag: "Agent",
    name: "Urban Streetwear Lookbook",
    image: "https://picsum.photos/seed/streetwear-look/600/700",
    likes: 40,
    saves: 40,
    booking: 40,
  },
  {
    id: "3",
    tag: "Agent",
    name: "Fitness Brand Collaboration",
    image: "https://picsum.photos/seed/fitness-brand/600/700",
    likes: 40,
    saves: 40,
    booking: 40,
  },
  {
    id: "4",
    tag: "Agent",
    name: "Fitness Brand Collaboration",
    image: "https://picsum.photos/seed/fitness-brand-2/600/700",
    likes: 40,
    saves: 40,
    booking: 40,
  },
  {
    id: "5",
    tag: "Designer",
    name: "Jewellery Product Shoot",
    image: "https://picsum.photos/seed/jewellery-shoot/600/700",
    likes: 40,
    saves: 40,
    booking: 40,
  },
  {
    id: "6",
    tag: "Agent",
    name: "Urban Streetwear Lookbook",
    image: "https://picsum.photos/seed/streetwear-look-2/600/700",
    likes: 40,
    saves: 40,
    booking: 40,
  },
];

const filterOptions = {
  postedBy: ["Agent", "Agencies", "Brands", "Agents"],
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
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch = job.name
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase());
      return matchesSearch;
    });
  }, [ debouncedSearch]);

  return (
    <main className="min-h-screen w-full text-stone-100">
      <div className="mb-6 flex justify-end flex-col gap-3 sm:flex-row sm:items-center">
        {/* <div className="flex flex-1 flex-col gap-3 sm:flex-row"> */}
          <FilterSelect
            options={filterOptions.postedBy}
            value={postedBy}
            onChange={setPostedBy}
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
      
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {filteredJobs.map((job) => (
          <JobCard key={job.id} job={job} href={`/admin/model-mansion/${job.id}`} isjob={false} />
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