"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { ArrowSeparateVertical } from "iconoir-react";
import { useDebouncedValue } from "@/hooks/useDebounce";
import { useAllUsers } from "@/hooks/useAllUsers";
import { useCountry } from "@/app/components/CountryContext";
import Pagination from "@/app/components/Pagination";
import { formatName } from "@/lib/media";
import { JOB_USER_MODE_OPTIONS, jobUserModeLabel } from "@/lib/jobLabels";
import Loader from "../components/ui/Loader";

type UserRow = {
  _id: string;
  fullName?: string;
  email?: string;
  userMode?: string | null;
  country?: string;
  createdAt?: string;
};

const USER_TYPE_OPTIONS = [{ label: "All User Types", value: "" }, ...JOB_USER_MODE_OPTIONS];

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
    : "—";

const AllUsersPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [userMode, setUserMode] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;
  const debouncedSearch = useDebouncedValue(search, 500);
  const { country } = useCountry();

  const { data, isPending, isError } = useAllUsers({
    page,
    limit,
    search: String(debouncedSearch ?? "").trim(),
    userMode,
    country,
  });

  const users: UserRow[] = data?.users ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;
  const total = data?.pagination?.total ?? 0;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, userMode, country]);

  return (
    <main className="min-h-screen w-full text-stone-100">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-stone-400">
          {isPending ? "" : `${total} user${total === 1 ? "" : "s"}`}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block w-full sm:w-[180px]">
            <select
              value={userMode}
              onChange={(event) => setUserMode(event.target.value)}
              className="h-10 w-full appearance-none rounded-[8px] border border-[#2A2A2E] bg-[#151518] px-4 pr-9 text-[13px] text-stone-300 outline-none focus:border-[#EF476F]"
            >
              {USER_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#151518]">
                  {option.label}
                </option>
              ))}
            </select>
            <ArrowSeparateVertical className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
          </label>

          <label className="relative block w-full sm:w-[220px]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value.replace(/^\s+/, ""))}
              placeholder="Search name or email"
              className="h-10 w-full rounded-[8px] border border-[#2A2A2E] bg-[#151518] pl-4 pr-9 text-[13px] text-stone-300 outline-none placeholder:text-stone-500 focus:border-[#EF476F]"
            />
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
          </label>
        </div>
      </div>

      {isPending ? (
        <Loader />
      ) : isError ? (
        <p className="mt-10 text-center text-[13px] text-stone-500">
          Couldn&apos;t load users. Please try again.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-[8px] border border-[#2A2A2E]">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[#151518] text-xs uppercase text-stone-400">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">User Type</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[13px] text-stone-500">
                      No users match your filters.
                    </td>
                  </tr>
                )}
                {users.map((user) => (
                  <tr key={user._id} className="border-t border-[#2A2A2E]">
                    <td className="px-4 py-3">
                      <div className="font-medium text-stone-100">
                        {user.fullName ? formatName(user.fullName) : "—"}
                      </div>
                      <div className="text-xs text-stone-400">{user.email || ""}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-[#EF476F]/15 px-2.5 py-0.5 text-xs font-medium text-[#EF476F]">
                        {user.userMode ? jobUserModeLabel(user.userMode) : "Not set"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-300">{user.country || "—"}</td>
                    <td className="px-4 py-3 text-xs text-stone-300">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={
                            user.userMode === "MODEL"
                              ? `/admin/model-mansion/${user._id}`
                              : `/admin/all-users/${user._id}`
                          }
                          className="rounded-[6px] border border-[#2A2A2E] px-3 py-1.5 text-xs hover:border-[#EF476F]"
                        >
                          {user.userMode === "MODEL" ? "Model Mansion" : "View Profile"}
                        </Link>
                        {user.userMode === "MODEL" && (
                          <Link
                            href={`/admin/subscriptions/${user._id}`}
                            className="rounded-[6px] border border-[#2A2A2E] px-3 py-1.5 text-xs hover:border-[#EF476F]"
                          >
                            Subscription
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </main>
  );
};

export default AllUsersPage;
