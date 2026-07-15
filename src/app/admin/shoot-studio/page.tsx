"use client";

import React, { ReactElement, useEffect, useMemo, useState } from "react";
import CustomInput from "@/app/components/CustomInput";
import DynamicTable from "@/app/components/DynamicTable";
import Pagination from "@/app/components/Pagination";
import { Search, ChevronsUpDown, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

interface SelectOption {
  label: string;
  value: string;
}

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

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

const ShootStudio: React.FC = () => {
  const [sort, setSort] = useState("");
  const [search, setSearch] = useState("");
   const [activeFilter, setActiveFilter] = useState<ApplicantFilter>("upcoming");
    const [currentPage, setCurrentPage] = useState(1);
  
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
    const router = useRouter();


  const debouncedSearch = useDebouncedValue(search, 500);

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

 const dummyUsers: TableRow[] = [
  {
    _id: "1",
    userId: "USR001",
    modelName: "Naomi",
    activityType: "Photoshoot",
    studio: "London Studio",
    date: "24 Jul 2026",
    timeSlot: "10:30 AM - 12:30 PM",
  },
  {
    _id: "2",
    userId: "USR002",
    modelName: "Emily Smith",
    activityType: "Fashion Shoot",
    studio: "Manchester Studio",
    date: "25 Jul 2026",
    timeSlot: "11:00 AM - 1:00 PM",
  },
  {
    _id: "3",
    userId: "USR003",
    modelName: "David Wilson",
    activityType: "Commercial Shoot",
    studio: "Birmingham Studio",
    date: "26 Jul 2026",
    timeSlot: "2:00 PM - 4:00 PM",
  },
  {
    _id: "4",
    userId: "USR004",
    modelName: "Sophia Brown",
    activityType: "Portfolio Shoot",
    studio: "London Studio",
    date: "27 Jul 2026",
    timeSlot: "9:00 AM - 11:00 AM",
  },
  {
    _id: "5",
    userId: "USR005",
    modelName: "Liam Johnson",
    activityType: "Fitness Shoot",
    studio: "Leeds Studio",
    date: "28 Jul 2026",
    timeSlot: "1:00 PM - 3:00 PM",
  },
  {
    _id: "6",
    userId: "USR006",
    modelName: "Noah Williams",
    activityType: "Editorial Shoot",
    studio: "Liverpool Studio",
    date: "29 Jul 2026",
    timeSlot: "10:00 AM - 12:00 PM",
  },
  {
    _id: "7",
    userId: "USR007",
    modelName: "Ava Davis",
    activityType: "Runway Practice",
    studio: "London Studio",
    date: "30 Jul 2026",
    timeSlot: "3:00 PM - 5:00 PM",
  },
  {
    _id: "8",
    userId: "USR008",
    modelName: "James Miller",
    activityType: "Catalog Shoot",
    studio: "Bristol Studio",
    date: "31 Jul 2026",
    timeSlot: "12:00 PM - 2:00 PM",
  },
  {
    _id: "9",
    userId: "USR009",
    modelName: "Charlotte Moore",
    activityType: "Beauty Shoot",
    studio: "Oxford Studio",
    date: "01 Aug 2026",
    timeSlot: "9:30 AM - 11:30 AM",
  },
  {
    _id: "10",
    userId: "USR010",
    modelName: "Benjamin Taylor",
    activityType: "Product Shoot",
    studio: "Cambridge Studio",
    date: "02 Aug 2026",
    timeSlot: "4:00 PM - 6:00 PM",
  },
];

  const filters: { label: string; value: ApplicantFilter }[] = [
  { label: "Upcoming Activities", value: "upcoming" },
  { label: "Past Activities", value: "past" },
  { label: "Reviewed", value: "reviewed" },
  { label: "Rejected", value: "Rejected" },
];

  const filteredUsers = useMemo(() => {
    let data = [...dummyUsers];

  if (debouncedSearch) {
  const keyword = debouncedSearch.toLowerCase();

  data = data.filter(
    (user) =>
      user.userId.toLowerCase().includes(keyword) ||
      user.modelName.toLowerCase().includes(keyword) ||
      user.activityType.toLowerCase().includes(keyword) ||
      user.studio.toLowerCase().includes(keyword)
  );
}

    return data;
  }, [debouncedSearch, sort]);

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
        <div className="flex flex-col sm:flex-row justify-between items-end gap-2.5 w-full">
          <div className="w-fit max-w-full overflow-x-auto">
            <div className="flex min-w-max rounded-full bg-white/10 p-1">
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

          <div className="w-full sm:w-auto">
            <CustomInput
              placeholder="Search"
              icon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="self-stretch rounded-md outline outline-offset-[-1px] outline-stone-700">
          <DynamicTable
            headers={headers}
            data={paginatedUsers}
            isEyeShow={false}
            renderActions={(row) =>
              activeFilter === "past" ? (
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/admin/shoot-studio/review-activity/${row._id}`)
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
                    router.push(`/admin/shoot-studio/edit-booking/${row._id}`)
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
