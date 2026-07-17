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
  booker: string; // Model Name
  type: string;   // Date
  models: string; // Time
  budget: string; // Reason
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
    label: "Model Name",
    key: "booker",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
  {
    label: "Date",
    key: "type",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
  {
    label: "Time",
    key: "models",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
  {
    label: "Reason",
    key: "budget",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
];

const dummyUsers: TableRow[] = [
  {
    _id: "1",
    booker: "Naomi Dubois",
    type: "15 Jul 2026",
    models: "10:00 AM",
    budget: "Personal Leave",
  },
  {
    _id: "2",
    booker: "Emily Smith",
    type: "16 Jul 2026",
    models: "09:30 AM",
    budget: "Medical Appointment",
  },
  {
    _id: "3",
    booker: "Sophia Brown",
    type: "17 Jul 2026",
    models: "02:00 PM",
    budget: "Family Emergency",
  },
  {
    _id: "4",
    booker: "David Wilson",
    type: "18 Jul 2026",
    models: "11:15 AM",
    budget: "Travel",
  },
  {
    _id: "5",
    booker: "James Miller",
    type: "19 Jul 2026",
    models: "04:00 PM",
    budget: "Photoshoot Preparation",
  },
  {
    _id: "6",
    booker: "Charlotte Moore",
    type: "20 Jul 2026",
    models: "08:30 AM",
    budget: "Training Session",
  },
  {
    _id: "7",
    booker: "Benjamin Taylor",
    type: "21 Jul 2026",
    models: "01:45 PM",
    budget: "Client Meeting",
  },
  {
    _id: "8",
    booker: "Liam Johnson",
    type: "22 Jul 2026",
    models: "03:30 PM",
    budget: "Vacation",
  },
  {
    _id: "9",
    booker: "Ava Davis",
    type: "23 Jul 2026",
    models: "12:00 PM",
    budget: "Portfolio Update",
  },
  {
    _id: "10",
    booker: "Noah Williams",
    type: "24 Jul 2026",
    models: "05:00 PM",
    budget: "Sick Leave",
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
        user.budget.toLowerCase().includes(keyword)
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
