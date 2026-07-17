"use client";

import React, { ReactElement, useEffect, useMemo, useState } from "react";
import CustomInput from "@/app/components/CustomInput";
import DynamicTable from "@/app/components/DynamicTable";
import Pagination from "@/app/components/Pagination";
import { Search, ChevronsUpDown, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import CustomButton from "@/app/components/CustomButton";

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
  const [limit] = useState(5);
  const router = useRouter();

  const debouncedSearch = useDebouncedValue(search, 500);

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

  const dummyUsers: TableRow[] = [
    {
      _id: "1",
      eventName: "Summer Fashion Gala",
      date: "24 Jul 2026",
      time: "10:00 AM",
      location: "Paris, France",
      status: "Active",
    },
    {
      _id: "2",
      eventName: "Luxury Yacht Party",
      date: "28 Jul 2026",
      time: "4:00 PM",
      location: "Monaco",
      status: "Upcoming",
    },
    {
      _id: "3",
      eventName: "Celebrity Networking",
      date: "02 Aug 2026",
      time: "6:30 PM",
      location: "London",
      status: "Active",
    },
    {
      _id: "4",
      eventName: "Beach Photoshoot",
      date: "05 Aug 2026",
      time: "9:00 AM",
      location: "Ibiza",
      status: "Upcoming",
    },
    {
      _id: "5",
      eventName: "Luxury Dinner",
      date: "10 Aug 2026",
      time: "8:00 PM",
      location: "Dubai",
      status: "Completed",
    },
    {
      _id: "6",
      eventName: "Model Meetup",
      date: "12 Aug 2026",
      time: "3:00 PM",
      location: "Milan",
      status: "Active",
    },
    {
      _id: "7",
      eventName: "Fashion Week",
      date: "16 Aug 2026",
      time: "11:00 AM",
      location: "New York",
      status: "Upcoming",
    },
    {
      _id: "8",
      eventName: "Brand Launch",
      date: "20 Aug 2026",
      time: "5:00 PM",
      location: "Los Angeles",
      status: "Completed",
    },
    {
      _id: "9",
      eventName: "Networking Dinner",
      date: "23 Aug 2026",
      time: "7:30 PM",
      location: "Rome",
      status: "Completed",
    },
    {
      _id: "10",
      eventName: "VIP Cruise",
      date: "28 Aug 2026",
      time: "1:00 PM",
      location: "Barcelona",
      status: "Upcoming",
    },
  ];

  const filters: { label: string; value: ApplicantFilter }[] = [
    { label: "All", value: "all" },
    { label: "Active Events", value: "active" },
    { label: "Past Events", value: "past" },
  ];

  const filteredUsers = useMemo(() => {
    let data = [...dummyUsers];

    if (debouncedSearch) {
      const keyword = debouncedSearch.toLowerCase();

      data = data.filter(
        (item) =>
          item.eventName.toLowerCase().includes(keyword) ||
          item.location.toLowerCase().includes(keyword) ||
          item.status.toLowerCase().includes(keyword),
      );
    }

    if (activeFilter === "active") {
      data = data.filter((item) => item.status === "Active");
    }

    if (activeFilter === "past") {
      data = data.filter((item) => item.status === "Completed");
    }

    return data;
  }, [debouncedSearch, activeFilter]);
  const totalPages = Math.ceil(filteredUsers.length / limit);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredUsers.slice(start, start + limit);
  }, [filteredUsers, page, limit]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sort]);

  const baseSortOptions: SelectOption[] = [
    { label: "Likes (High → Low)", value: "highToLowLikes" },
    { label: "Likes (Low → High)", value: "lowToHighLikes" },
  ];

  const sortOptions = sort
    ? [...baseSortOptions, { label: "Clear Sorting", value: "" }]
    : baseSortOptions;

  return (
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
            data={paginatedUsers}
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
  );
};

export default CelebrationCruise;
