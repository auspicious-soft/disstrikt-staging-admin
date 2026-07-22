"use client";

import React, { ReactElement, useEffect, useMemo, useState } from "react";
import CustomInput from "@/app/components/CustomInput";
import CustomSelect from "@/app/components/CustomSelect";
import DynamicTable from "@/app/components/DynamicTable";
import Pagination from "@/app/components/Pagination";
import { Search, ChevronsUpDown } from "lucide-react";
import eyeimg from "../../../assets/icons/Eye.png";
import { useRouter } from "next/navigation";
import CustomButton from "@/app/components/CustomButton";

interface SelectOption {
  label: string;
  value: string;
}
interface TableRow {
  _id: string;
  booker: string;
  type: string;
  models: string;
  budget: string;
  country: string;
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

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

const ModelMarket: React.FC = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
    const router = useRouter();


  const debouncedSearch = useDebouncedValue(search, 500);

const headers: TableHeader[] = [
  {
    label: "Booker",
    key: "booker",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
  {
    label: "Type",
    key: "type",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
  {
    label: "Models",
    key: "models",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
  {
    label: "Budget",
    key: "budget",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
  {
    label: "Country",
    key: "country",
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
    booker: "Elite Models Ltd.",
    type: "Fashion",
    models: "11",
    budget: "$2,500",
    country: "United Kingdom",
    status: "Open",
  },
  {
    _id: "2",
    booker: "Vision Media",
    type: "Commercial",
    models: "11",
    budget: "$1,800",
    country: "Canada",
    status: "Closed",
  },
  {
    _id: "3",
    booker: "Luxury Brands",
    type: "Lifestyle",
    models: "11",
    budget: "$3,000",
    country: "United States",
    status: "In Review",
  },
  {
    _id: "4",
    booker: "Next Agency",
    type: "Editorial",
    models: "11",
    budget: "$1,200",
    country: "Australia",
    status: "Open",
  },
  {
    _id: "5",
    booker: "Fashion Hub",
    type: "Runway",
    models: "11",
    budget: "$4,500",
    country: "France",
    status: "Completed",
  },
  {
    _id: "6",
    booker: "Prime Casting",
    type: "Commercial",
    models: "11",
    budget: "$2,100",
    country: "Germany",
    status: "Open",
  },
  {
    _id: "7",
    booker: "Urban Studio",
    type: "Fitness",
    models: "11",
    budget: "$1,900",
    country: "India",
    status: "Closed",
  },
  {
    _id: "8",
    booker: "Creative Works",
    type: "Beauty",
    models: "11",
    budget: "$2,750",
    country: "Italy",
    status: "In Review",
  },
  {
    _id: "9",
    booker: "Iconic Agency",
    type: "Catalogue",
    models: "11",
    budget: "$3,250",
    country: "Spain",
    status: "Completed",
  },
  {
    _id: "10",
    booker: "Global Talent",
    type: "E-commerce",
    models: "11",
    budget: "$2,900",
    country: "United States",
    status: "Open",
  },
];

const filteredUsers = useMemo(() => {
  let data = [...dummyUsers];

  if (debouncedSearch) {
    const keyword = debouncedSearch.toLowerCase();

    data = data.filter(
      (user) =>
        user.booker.toLowerCase().includes(keyword) ||
        user.type.toLowerCase().includes(keyword) ||
        user.models.toLowerCase().includes(keyword) ||
        user.country.toLowerCase().includes(keyword) ||
        user.status.toLowerCase().includes(keyword)
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
  }, [debouncedSearch]);



  return (
    <div className="w-full inline-flex flex-col justify-center items-start gap-10">
      <div className="self-stretch flex flex-col justify-start items-end gap-2.5">
        <div className="flex flex-col sm:flex-row justify-end items-end gap-2.5 w-full">

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
            rowIcon={eyeimg.src}
            onclickFunction={(id) => router.push(`/agent/model-market/${id}`)}
            showActionsHeaderLabel={false}
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

export default ModelMarket;
