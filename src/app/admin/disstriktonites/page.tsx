"use client";

import React, { ReactElement, useEffect, useMemo, useState } from "react";
import { ChevronsUpDown, Pencil, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import CustomButton from "@/app/components/CustomButton";
import CustomInput from "@/app/components/CustomInput";
import DynamicTable from "@/app/components/DynamicTable";
import Pagination from "@/app/components/Pagination";
import { NavArrowDownSolid } from "iconoir-react";

interface DisstriktoniteRow {
  _id: string;
  name: string;
  phone: string;
  role: string;
  languages: string[];
}

interface TableHeader {
  label: string;
  key: string;
  width?: string;
  icon?: ReactElement;
  align?: "start" | "end" | "center";
  fontWeight?: string;
}

const disstriktonites: DisstriktoniteRow[] = [
  {
    _id: "1",
    name: "Alex Johnson",
    phone: "555-987-6543",
    role: "Agent",
    languages: ["English", "Spanish", "German"],
  },
  {
    _id: "2",
    name: "Maria Smith",
    phone: "555-123-4567",
    role: "Agent",
    languages: ["English", "Spanish", "German"],
  },
  {
    _id: "3",
    name: "Emily Davis",
    phone: "555-345-7890",
    role: "Agent",
    languages: ["English", "Spanish", "German"],
  },
  {
    _id: "4",
    name: "Daniel Martinez",
    phone: "555-876-5432",
    role: "Agent",
    languages: ["English", "Spanish", "German"],
  },
  {
    _id: "5",
    name: "Sophia Lee",
    phone: "555-432-1098",
    role: "Agent",
    languages: ["English", "Spanish", "German"],
  },
  {
    _id: "6",
    name: "William Walker",
    phone: "555-210-9876",
    role: "Agent",
    languages: ["English", "Spanish", "German"],
  },
  {
    _id: "7",
    name: "Olivia Hall",
    phone: "555-765-4321",
    role: "Agent",
    languages: ["English", "Spanish", "German"],
  },
  {
    _id: "8",
    name: "James Young",
    phone: "555-505-1212",
    role: "Agent",
    languages: ["English", "Spanish", "German"],
  },
  {
    _id: "9",
    name: "Daniel Martinez",
    phone: "555-876-5432",
    role: "Agent",
    languages: ["English", "Spanish", "German"],
  },
  {
    _id: "10",
    name: "William Walker",
    phone: "555-210-9876",
    role: "Agent",
    languages: ["English", "Spanish", "German"],
  },
  {
    _id: "11",
    name: "James Young",
    phone: "555-505-1212",
    role: "Agent",
    languages: ["English", "Spanish", "German"],
  },
];

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

const headers: TableHeader[] = [
  {
    label: "Name",
    key: "name",
    icon: <ChevronsUpDown className="h-4 w-4" />,
  },
  {
    label: "Phone",
    key: "phone",
    icon: <ChevronsUpDown className="h-4 w-4" />,
  },
  {
    label: "Role",
    key: "role",
    icon: <ChevronsUpDown className="h-4 w-4" />,
  },
  {
    label: "Languages",
    key: "languages",
    icon: <ChevronsUpDown className="h-4 w-4" />,
  },
];

const DisstriktonitesPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(11);
  const router = useRouter();
  const debouncedSearch = useDebouncedValue(search, 400);

  const filteredRows = useMemo(() => {
    if (!debouncedSearch) return disstriktonites;

    const keyword = debouncedSearch.toLowerCase();

    return disstriktonites.filter((item) =>
      [item.name, item.phone, item.role, item.languages.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / limit));
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredRows.slice(start, start + limit);
  }, [filteredRows, limit, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return (
    <main className="w-full">
      <div className="flex w-full flex-col gap-2.5">
        <div className="flex flex-col items-stretch justify-end gap-2.5 sm:flex-row sm:items-center">
          <CustomInput
            placeholder="Search"
            icon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="max-w-fit">
          <CustomButton
            label="Manage Roles"
            size="Medium"
            bgColor="bg-rose-500"
            textColor="text-white"
            onClick={() => router.push("/admin/disstriktonites/manage-roles")}
          />
          </div>
          <div className="max-w-fit">
          <CustomButton
            label="Add Disstriktonites"
            size="Medium"
            bgColor="bg-rose-500"
            textColor="text-white"
            onClick={() => router.push("/admin/disstriktonites/add")}
          />
          </div>
        </div>

        <div className="self-stretch rounded-md outline outline-offset-[-1px] outline-stone-700">
          <DynamicTable
            headers={headers}
            data={paginatedRows}
            isEyeShow={false}
            renderCell={(row: DisstriktoniteRow, key: keyof DisstriktoniteRow) => {
              if (key !== "languages") return row[key];

              return (
                <div className="flex flex-wrap gap-1">
                  {row.languages.map((language) => (
                    <span
                      key={language}
                      className="rounded bg-neutral-800 px-2 py-1 text-xs leading-none text-stone-300"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              );
            }}
            renderActions={() => (
              <>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-800 text-stone-300 transition-colors hover:bg-neutral-700 hover:text-white"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-800 text-stone-300 transition-colors hover:bg-neutral-700 hover:text-white"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
            showActionsHeaderLabel
          />
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </main>
  );
};

export default DisstriktonitesPage;
