"use client";

import React, { useState } from "react";
import { Building2, Calendar } from "lucide-react";
import SingleAppliedJob from "./SingleAplliedJobTab";
import { useRouter } from "next/navigation";

type Job = {
  id: string;
  title: string;
  description: string;
  company: string;
  time: string;
  date: string;
  statusColor: string; // e.g. "bg-orange-400"
  appliedJobId: string;
  userId: string;
};

type AppliedJobTabProps = {
  jobs: Job[];
};

export default function AppliedJobTab({ jobs }: AppliedJobTabProps) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const router = useRouter();

  // Function to truncate title to 20 characters
  const truncateTitle = (title: string, maxLength: number = 20) => {
    if (title.length > maxLength) {
      return title.slice(0, maxLength) + "...";
    }
    return title;
  };

  if (selectedJobId) {
    return <SingleAppliedJob />;
  }

  const navigateToJob = (id: string, userId: string) => {
    router.push(`/admin/job-management/${id}?fromUserId=${userId}`);
  };

  if (jobs.length === 0) {
    return (
      <div className="w-full flex justify-center items-center">
        <p className="text-sm sm:text-base text-muted-foreground italic">
          No jobs available.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 w-full">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="relative p-4 bg-neutral-900 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col justify-start gap-3 w-full max-w-[320px] min-h-[180px] mx-auto"
        >
          <div className="flex flex-col gap-2">
            <div className="text-stone-200 text-sm sm:text-base font-extrabold  pr-8">
              {truncateTitle(job.title)}
            </div>
            <div className="text-stone-200 text-xs sm:text-sm font-normal  line-clamp-2">
              {job.description}
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
              <div className="text-stone-200 text-xs sm:text-sm font-normal ">
                {job.company}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
              <div className="flex items-center gap-2 text-stone-200 text-xs sm:text-sm font-normal ">
                <span>{job.time}</span>
                <span>{job.date}</span>
              </div>
            </div>
          </div>
          <div className="w-full px-3 py-1.5 rounded-[99px] border-b border-stone-200 flex justify-center items-center gap-2.5 mt-auto">
            <div
              className="text-stone-200 text-xs sm:text-sm cursor-pointer font-normal "
              onClick={() => navigateToJob(job.appliedJobId, job.userId)}
            >
              View Details
            </div>
          </div>
          <div
            className={`absolute top-3 right-3 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${job.statusColor}`}
          />
        </div>
      ))}
    </div>
  );
}
