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
  modelName: string;
  chapter: string;
  module: string;
  task: string;
  agent: string;
  lastCompleted: string;
  progress: string;
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

const UniversityUnion: React.FC = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
    const router = useRouter();


  const debouncedSearch = useDebouncedValue(search, 500);

 const headers: TableHeader[] = [
  {
    label: "Model Name",
    key: "modelName",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
  {
    label: "Chapter",
    key: "chapter",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
  {
    label: "Module",
    key: "module",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
  {
    label: "Task",
    key: "task",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
  {
    label: "Agent",
    key: "agent",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
  {
    label: "Last Completed",
    key: "lastCompleted",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
  {
    label: "Progress",
    key: "progress",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
];

 const dummyUsers: TableRow[] = [
  {
    _id: "1",
    modelName: "Naomi",
    chapter: "Introduction",
    module: "Model Basics",
    task: "Profile Setup",
    agent: "Sarah",
    lastCompleted: "10 Jul 2026",
    progress: "100%",
  },
  {
    _id: "2",
    modelName: "Emily Smith",
    chapter: "Posing",
    module: "Beginner",
    task: "Standing Poses",
    agent: "Michael",
    lastCompleted: "11 Jul 2026",
    progress: "85%",
  },
  {
    _id: "3",
    modelName: "David Wilson",
    chapter: "Lighting",
    module: "Studio Lights",
    task: "Soft Light",
    agent: "Olivia",
    lastCompleted: "12 Jul 2026",
    progress: "70%",
  },
  {
    _id: "4",
    modelName: "Sophia Brown",
    chapter: "Runway",
    module: "Catwalk",
    task: "Walking Practice",
    agent: "Daniel",
    lastCompleted: "13 Jul 2026",
    progress: "90%",
  },
  {
    _id: "5",
    modelName: "Liam Johnson",
    chapter: "Photography",
    module: "Portraits",
    task: "Headshots",
    agent: "Emma",
    lastCompleted: "14 Jul 2026",
    progress: "60%",
  },
  {
    _id: "6",
    modelName: "Noah Williams",
    chapter: "Expressions",
    module: "Advanced",
    task: "Facial Expressions",
    agent: "Lucas",
    lastCompleted: "15 Jul 2026",
    progress: "45%",
  },
  {
    _id: "7",
    modelName: "Ava Davis",
    chapter: "Fashion",
    module: "Editorial",
    task: "Magazine Shoot",
    agent: "Henry",
    lastCompleted: "16 Jul 2026",
    progress: "100%",
  },
  {
    _id: "8",
    modelName: "James Miller",
    chapter: "Fitness",
    module: "Workout",
    task: "Gym Shoot",
    agent: "Mia",
    lastCompleted: "17 Jul 2026",
    progress: "75%",
  },
  {
    _id: "9",
    modelName: "Charlotte Moore",
    chapter: "Commercial",
    module: "Advertising",
    task: "Product Shoot",
    agent: "Ethan",
    lastCompleted: "18 Jul 2026",
    progress: "55%",
  },
  {
    _id: "10",
    modelName: "Benjamin Taylor",
    chapter: "Final Assessment",
    module: "Certification",
    task: "Complete Exam",
    agent: "Grace",
    lastCompleted: "19 Jul 2026",
    progress: "95%",
  },
];

  const filteredUsers = useMemo(() => {
    let data = [...dummyUsers];

   if (debouncedSearch) {
  const keyword = debouncedSearch.toLowerCase();

  data = data.filter(
    (user) =>
      user.modelName.toLowerCase().includes(keyword) ||
      user.chapter.toLowerCase().includes(keyword) ||
      user.module.toLowerCase().includes(keyword) ||
      user.task.toLowerCase().includes(keyword) ||
      user.agent.toLowerCase().includes(keyword)
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

  const renderCell = (row: TableRow, key: string) => {
    if (key === "progress") {
      return (
        <span className="font-medium text-blue-500">
          {row.progress}
        </span>
      );
    }

    return row[key as keyof TableRow];
  };

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
            onclickFunction={(id) => router.push(`/admin/university-union/${id}`)}
            renderCell={renderCell}
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

export default UniversityUnion;
