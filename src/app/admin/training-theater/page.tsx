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
  name: string;
  subscriptionPlan: string;
  country: string;
  agent: string;
  likes: number;
  activeMonths: number;
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

const TrainingTheater: React.FC = () => {
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
      label: "Job Title",
      key: "userId",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Company Name",
      key: "name",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Posted By",
      key: "subscriptionPlan",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Posted For",
      key: "country",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Country",
      key: "agent",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
  ];

  const dummyUsers: TableRow[] = [
    {
      _id: "1",
      userId: "USR001",
      name: "John Doe",
      subscriptionPlan: "Premium",
      country: "USA",
      agent: "Sarah",
      likes: 125,
      activeMonths: 12,
    },
    {
      _id: "2",
      userId: "USR002",
      name: "Emily Smith",
      subscriptionPlan: "Basic",
      country: "Canada",
      agent: "Michael",
      likes: 86,
      activeMonths: 8,
    },
    {
      _id: "3",
      userId: "USR003",
      name: "David Wilson",
      subscriptionPlan: "Enterprise",
      country: "UK",
      agent: "Olivia",
      likes: 231,
      activeMonths: 20,
    },
    {
      _id: "4",
      userId: "USR004",
      name: "Sophia Brown",
      subscriptionPlan: "Premium",
      country: "Australia",
      agent: "Daniel",
      likes: 150,
      activeMonths: 10,
    },
    {
      _id: "5",
      userId: "USR005",
      name: "Liam Johnson",
      subscriptionPlan: "Basic",
      country: "Germany",
      agent: "Emma",
      likes: 54,
      activeMonths: 4,
    },
    {
      _id: "6",
      userId: "USR006",
      name: "Noah Williams",
      subscriptionPlan: "Premium",
      country: "India",
      agent: "Lucas",
      likes: 189,
      activeMonths: 16,
    },
    {
      _id: "7",
      userId: "USR007",
      name: "Ava Davis",
      subscriptionPlan: "Enterprise",
      country: "France",
      agent: "Henry",
      likes: 310,
      activeMonths: 30,
    },
    {
      _id: "8",
      userId: "USR008",
      name: "James Miller",
      subscriptionPlan: "Basic",
      country: "Japan",
      agent: "Mia",
      likes: 74,
      activeMonths: 5,
    },
    {
      _id: "9",
      userId: "USR009",
      name: "Charlotte Moore",
      subscriptionPlan: "Premium",
      country: "Italy",
      agent: "Ethan",
      likes: 143,
      activeMonths: 11,
    },
    {
      _id: "10",
      userId: "USR010",
      name: "Benjamin Taylor",
      subscriptionPlan: "Enterprise",
      country: "Spain",
      agent: "Grace",
      likes: 275,
      activeMonths: 24,
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
          String(user.userId).toLowerCase().includes(keyword) ||
          String(user.name).toLowerCase().includes(keyword) ||
          String(user.country).toLowerCase().includes(keyword)
      );
    }

    switch (sort) {
      case "highToLowLikes":
        data.sort((a, b) => Number(b.likes) - Number(a.likes));
        break;

      case "lowToHighLikes":
        data.sort((a, b) => Number(a.likes) - Number(b.likes));
        break;

      default:
        break;
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
        <div className="flex flex-wrap justify-between items-end gap-2.5 w-full">
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

export default TrainingTheater;
