"use client";

import React, { ReactElement, useEffect, useMemo, useState } from "react";
import CustomInput from "@/app/components/CustomInput";
import DynamicTable from "@/app/components/DynamicTable";
import Pagination from "@/app/components/Pagination";
import { Search, ChevronsUpDown, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import CustomButton from "@/app/components/CustomButton";
import { useGetCelebrationCruise } from "@/hooks/useAdmin";
import Loader from "../components/ui/Loader";

interface SelectOption {
  label: string;
  value: string;
}

interface TableRow {
  _id: string;
  eventName: string;
  date: string;
  time: string;
  location: string;
  status: string;
}

interface TableHeader {
  label: string;
  key: string;
  width?: string;
  icon?: ReactElement;
  align?: "start" | "end" | "center";
  fontWeight?: string;
}
type ApplicantFilter = "all" | "active" | "past";

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

const CelebrationCruise: React.FC = () => {
  const [sort, setSort] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ApplicantFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const router = useRouter();
  const debouncedSearch = useDebouncedValue(search, 500);
  const { data, isPending } = useGetCelebrationCruise({
    page,
    limit,
    country: "",
    search: debouncedSearch,
    activeFilter,
  });

  const headers: TableHeader[] = [
    {
      label: "Event Name",
      key: "eventName",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Date",
      key: "date",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Time",
      key: "time",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Location",
      key: "location",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Status",
      key: "status",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
  ];

  const tableData: TableRow[] = useMemo(() => {
    return (
      data?.data?.map((event: any) => ({
        _id: event._id,
        eventName: event.title,
        date: new Date(event.startDateTime).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        time: new Date(event.startDateTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        location: `${event.city}, ${event.country}`,
        status: event.status,
      })) ?? []
    );
  }, [data]);

  const filters: { label: string; value: ApplicantFilter }[] = [
    { label: "All", value: "all" },
    { label: "Active Events", value: "active" },
    { label: "Past Events", value: "past" },
  ];
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeFilter]);
  const totalPages = data?.pagination?.totalPages ?? 1;

  const baseSortOptions: SelectOption[] = [
    { label: "Likes (High → Low)", value: "highToLowLikes" },
    { label: "Likes (Low → High)", value: "lowToHighLikes" },
  ];

  return (
    <>
    {isPending ?
    <Loader/>
     : 
    (
    <div className="w-full inline-flex flex-col justify-center items-start gap-10">
      <div className="self-stretch flex flex-col justify-start items-end gap-2.5">
        <div className="flex flex-wrap justify-between items-end gap-2.5 w-full">
          <div className="w-full md:w-fit  overflow-x-auto">
            <div className="flex w-full min-w-max rounded-full bg-white/10 p-1">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => {
                    setActiveFilter(filter.value);
                    setCurrentPage(1);
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
          <div className="flex flex-col w-full sm:flex-row justify-end items-center gap-2.5 sm:w-auto">
            <div className="w-full sm:w-auto">
              <CustomInput
                placeholder="Search"
                icon={<Search className="w-4 h-4" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-auto max-w-full">
              <CustomButton
                label="+ Create Event"
                size="Medium"
                bgColor="bg-rose-500"
                textColor="text-white"
                onClick={() =>
                  router.push("/admin/celebration-cruise/create-event")
                }
              />
            </div>
          </div>
        </div>

        <div className="self-stretch rounded-md outline outline-offset-[-1px] outline-stone-700">
          <DynamicTable
            headers={headers}
            data={tableData}
            isEyeShow={false}
            renderActions={(row) => (
              <button
                type="button"
                onClick={() =>
                  router.push(`/admin/celebration-cruise/${row._id}`)
                }
                className="text-xs font-medium text-blue-500 hover:underline"
              >
                Review
              </button>
            )}
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
    )}
    </>
  );
};

export default CelebrationCruise;
