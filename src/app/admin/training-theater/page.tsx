"use client";

import React, { ReactElement, useEffect, useMemo, useState } from "react";
import CustomInput from "@/app/components/CustomInput";
import DynamicTable from "@/app/components/DynamicTable";
import Pagination from "@/app/components/Pagination";
import { Search, ChevronsUpDown, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetActivities } from "@/hooks/useAdmin";
import Loader from "../components/ui/Loader";
import { toast } from "sonner";
import { useCountry } from "@/app/components/CountryContext";
import { useDebouncedValue } from "@/hooks/useDebounce";

interface TableRow {
  _id: string;
  userId: string;
  modelName: string;
  activityType: string;
  studio: string;
  date: string;
  timeSlot: string;
}

interface TableHeader {
  label: string;
  key: string;
  width?: string;
  icon?: ReactElement;
  align?: "start" | "end" | "center";
  fontWeight?: string;
}
type ApplicantFilter = "upcoming" | "past" | "reviewed" | "Rejected";

const ShootStudio: React.FC = () => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ApplicantFilter>("upcoming");
  const [page, setPage] = useState(1);
  const { country } = useCountry();
  const limit = 10;
  const router = useRouter();


  const debouncedSearch = useDebouncedValue(search, 500);

  const activityTypeByFilter: Record<ApplicantFilter, string> = {
    upcoming: "Upcoming",
    past: "Past",
    reviewed: "Reviewed",
    Rejected: "Cancelled",
  };

  const { data, isPending, isError, error } = useGetActivities({
  page,
  limit,
  type: activityTypeByFilter[activeFilter],
  country,
  search:debouncedSearch,
  activity:"trainingTheater"
});
useEffect(() => {
  if (isError) {
    const errorMessage =
      (error as any)?.response?.data?.message ||
      (error as any)?.message ||
      "Failed to fetch activities";

    toast.error(errorMessage);
  }
}, [isError, error]);

 const headers: TableHeader[] = [
  {
    label: "User ID",
    key: "userId",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
  {
    label: "Model Name",
    key: "modelName",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
  {
    label: "Activity Type",
    key: "activityType",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
  {
    label: "Studio",
    key: "studio",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
  {
    label: "Date",
    key: "date",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
  {
    label: "Time Slot",
    key: "timeSlot",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
];

  const filters: { label: string; value: ApplicantFilter }[] = [
  { label: "Upcoming Activities", value: "upcoming" },
  { label: "Past Activities", value: "past" },
  { label: "Reviewed", value: "reviewed" },
  { label: "Rejected", value: "Rejected" },
];

  const tableData: TableRow[] = useMemo(() => {
    const keyword = debouncedSearch.toLowerCase();

    return (data?.data ?? [])
      .map((activity: any) => ({
        _id: activity._id,
        userId: activity.userId?._id ?? "-",
        modelName: activity.userId?.fullName ?? "-",
        activityType: activity.activityType ?? "-",
        studio: activity.studioId?.name ?? "-",
        date: new Date(activity.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        timeSlot: `${activity.startTime} - ${activity.endtime}`,
      }))
      .filter((activity: TableRow) =>
        keyword
          ? Object.values(activity).some((value) =>
              value.toLowerCase().includes(keyword)
            )
          : true
      );
  }, [data, debouncedSearch]);

  const totalPages = data?.pagination?.totalPages ?? 1;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeFilter]);

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="w-full inline-flex flex-col justify-center items-start gap-10">
      <div className="self-stretch flex flex-col justify-start items-end gap-2.5">
        <div className="flex flex-wrap justify-between items-end gap-2.5 w-full">
          <div className="w-fit max-w-full overflow-x-auto">
            <div className="flex min-w-max rounded-full bg-white/10 p-1">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => {
                    setActiveFilter(filter.value);
                    setPage(1);
                  }}
                  className={`rounded-full px-4 py-2 text-xs font-normal transition-colors ${
                    activeFilter === filter.value
                      ? "bg-rose-500 text-white"
                      : "text-stone-400 hover:bg-stone-800 hover:text-white"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <CustomInput
              placeholder="Search"
              icon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value.trimStart())}
            />
          </div>
        </div>

        <div className="self-stretch rounded-md outline outline-offset-[-1px] outline-stone-700">
          <DynamicTable
            headers={headers}
            data={tableData}
            isEyeShow={false}
            renderActions={(row) =>
              activeFilter === "past" ? (
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/admin/training-theater/review-activity/${row._id}`)
                  }
                  className="text-xs font-medium text-blue-500 hover:underline"
                >
                  Review
                </button>
              ) : activeFilter === "upcoming" ? (
                <button
                  type="button"
                  aria-label="Edit booking"
                  onClick={() =>
                    router.push(`/admin/training-theater/edit-booking/${row._id}`)
                  }
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-stone-800 text-stone-300 transition-colors hover:bg-stone-700 hover:text-white"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              ) : null
            }
            showActionsHeaderLabel={true}
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

export default ShootStudio;
