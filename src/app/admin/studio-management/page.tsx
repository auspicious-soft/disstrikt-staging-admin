"use client";

import React, { ReactElement, useEffect, useMemo, useState } from "react";
import CustomInput from "@/app/components/CustomInput";
import DynamicTable from "@/app/components/DynamicTable";
import Pagination from "@/app/components/Pagination";
import { Search, ChevronsUpDown, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import CustomButton from "@/app/components/CustomButton";
import { Eye } from "iconoir-react";

interface SelectOption {
  label: string;
  value: string;
}

interface TableRow {
  _id: string;
  id: string;
  studioName: string;
  location: string;
  upcomingActivities: number;
  status: "Active" | "Inactive";
}

interface TableHeader {
  label: string;
  key: string;
  width?: string;
  icon?: ReactElement;
  align?: "start" | "end" | "center";
  fontWeight?: string;
}

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
  const [currentPage, setCurrentPage] = useState(1);

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const router = useRouter();

  const debouncedSearch = useDebouncedValue(search, 500);

const headers: TableHeader[] = [
  {
    label: "Id",
    key: "id",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
  {
    label: "Studio Name",
    key: "studioName",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
  {
    label: "Location",
    key: "location",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
  {
    label: "Upcoming Activities",
    key: "upcomingActivities",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
];

const dummyUsers: TableRow[] = [
  {
    _id: "1",
    id: "STD-001",
    studioName: "Elite Studio",
    location: "Paris, France",
    upcomingActivities: 12,
    status: "Active",
  },
  {
    _id: "2",
    id: "STD-002",
    studioName: "Vision Studio",
    location: "London, UK",
    upcomingActivities: 8,
    status: "Active",
  },
  {
    _id: "3",
    id: "STD-003",
    studioName: "Fashion Hub",
    location: "Milan, Italy",
    upcomingActivities: 15,
    status: "Inactive",
  },
  {
    _id: "4",
    id: "STD-004",
    studioName: "Prime Studio",
    location: "Barcelona, Spain",
    upcomingActivities: 5,
    status: "Active",
  },
  {
    _id: "5",
    id: "STD-005",
    studioName: "Creative Space",
    location: "Berlin, Germany",
    upcomingActivities: 7,
    status: "Inactive",
  },
  {
    _id: "6",
    id: "STD-006",
    studioName: "Studio One",
    location: "Amsterdam, Netherlands",
    upcomingActivities: 10,
    status: "Active",
  },
  {
    _id: "7",
    id: "STD-007",
    studioName: "Icon Studio",
    location: "New York, USA",
    upcomingActivities: 18,
    status: "Active",
  },
  {
    _id: "8",
    id: "STD-008",
    studioName: "Focus Studio",
    location: "Toronto, Canada",
    upcomingActivities: 6,
    status: "Inactive",
  },
  {
    _id: "9",
    id: "STD-009",
    studioName: "Model Point",
    location: "Sydney, Australia",
    upcomingActivities: 11,
    status: "Active",
  },
  {
    _id: "10",
    id: "STD-010",
    studioName: "Creative Lens",
    location: "Dubai, UAE",
    upcomingActivities: 9,
    status: "Inactive",
  },
];

 const filteredUsers = useMemo(() => {
  let data = [...dummyUsers];

  if (debouncedSearch) {
    const keyword = debouncedSearch.toLowerCase();

    data = data.filter(
      (item) =>
        item.id.toLowerCase().includes(keyword) ||
        item.studioName.toLowerCase().includes(keyword) ||
        item.location.toLowerCase().includes(keyword) ||
        item.status.toLowerCase().includes(keyword)
    );
  }

  return data;
}, [debouncedSearch]);

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
      <div className="self-stretch flex flex-col justify-start items-end gap-4">
        <div className="flex flex-wrap justify-end items-end gap-3 w-full">
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
                label="+ Add New Studio"
                size="Medium"
                bgColor="bg-rose-500"
                textColor="text-white"
                onClick={() =>
                  router.push("/admin/studio-management/studio-details")
                }
              />
            </div>
            <div className="w-full sm:w-auto max-w-full">
              <CustomButton
                label="+ Manage Shoot Features"
                size="Medium"
                bgColor="bg-rose-500"
                textColor="text-white"
                onClick={() =>
                  router.push("/admin/studio-management/manage-shoot-features")
                }
              />
            </div>
        
        </div>

        {/* <div className="self-stretch rounded-md outline outline-offset-[-1px] outline-stone-700"> */}
          <DynamicTable
            headers={headers}
            data={paginatedUsers}
            isEyeShow={false}
            renderActions={(row) => (
              <button
                type="button"
                onClick={() =>
                  router.push(`/admin/studio-management/manage-shoot-features`)
                }
                className="text-xs font-medium bg-white/10 p-2 rounded-md text-stone-200 hover:bg-white/20 transition-colors"
              >
                <Eye className="h-4 w-4" />
              </button>
            )}
            showActionsHeaderLabel={true}
          />
        {/* </div> */}

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
