"use client";

import React, { ReactElement, useEffect, useMemo, useState } from "react";
import { ChevronsUpDown, Pencil, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import CustomButton from "@/app/components/CustomButton";
import CustomInput from "@/app/components/CustomInput";
import DynamicTable from "@/app/components/DynamicTable";
import Pagination from "@/app/components/Pagination";
import { NavArrowDownSolid } from "iconoir-react";
import { useGetEmployees } from "@/hooks/useAdmin";
import Loader from "../components/ui/Loader";

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
  const [limit] = useState(10);
  const router = useRouter();
  const debouncedSearch = useDebouncedValue(search, 400);
  const { data, isLoading } = useGetEmployees({
    page,
    limit,
    search: debouncedSearch,
  });
  const rows = useMemo(() => {
  return (
    data?.data?.map((employee: any) => ({
      _id: employee._id,
      name: employee.fullName,
      phone: `${employee.countryCode ?? ""} ${employee.phone ?? "-"}`,
      role: employee.role,
      languages: employee.language ?? [],
    })) ?? []
  );
}, [data]);
const totalPages = data?.pagination?.totalPages ?? 1;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return (
    <>
    {isLoading ?
    <Loader/>
     : 
    (
     <main className="w-full">
      <div className="flex w-full flex-col gap-2.5">
        <div className="flex flex-wrap items-stretch justify-end gap-2.5 sm:flex-row sm:items-center">
          <CustomInput
            placeholder="Search"
            icon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="max-w-full md:max-w-fit">
            <CustomButton
              label="Manage Roles"
              size="Medium"
              bgColor="bg-rose-500"
              textColor="text-white"
              onClick={() => router.push("/admin/disstriktonites/manage-roles")}
            />
          </div>
          <div className="max-w-full md:max-w-fit">
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
            data={rows}
            isEyeShow={false}
            renderCell={(row: any, key)=> {
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
            renderActions={(row) => (
              <>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-800 text-stone-300 transition-colors hover:bg-neutral-700 hover:text-white"
                  aria-label="Edit"
                  onClick={() => router.push(`/admin/disstriktonites/${row._id}`)}
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
    )
    }
    </>
  );
};

export default DisstriktonitesPage;
