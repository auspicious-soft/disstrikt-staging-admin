"use client";

import Link from "next/link";
import { useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebounce";
import { useSubscriptionUsers } from "@/hooks/useSubscriptionAdmin";
import Loader from "../components/ui/Loader";
import { SubscriptionTabs } from "./SubscriptionTabs";

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—";

const statusTone = (status: string, valid: boolean) =>
  valid
    ? "bg-emerald-500/15 text-emerald-300"
    : status
      ? "bg-rose-500/15 text-rose-300"
      : "bg-stone-500/15 text-stone-400";

export default function SubscriptionUsersPage() {
  const [search, setSearch] = useState("");
  const [userMode, setUserMode] = useState("MODEL");
  const [page, setPage] = useState(1);
  const debounced = useDebouncedValue(search, 400);
  const { data, isLoading, isError } = useSubscriptionUsers({ page, limit: 20, search: String(debounced ?? ""), userMode });
  const users: any[] = data?.users ?? [];
  const pagination = data?.pagination;

  return (
    <main className="w-full text-stone-200">
      <SubscriptionTabs active="users" />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or email"
          className="h-[38px] w-full max-w-[340px] rounded-[6px] border border-[#332C2D] bg-[#111111] px-3 text-sm outline-none focus:border-[#EF476F]"
        />
        <select
          value={userMode}
          onChange={(e) => {
            setUserMode(e.target.value);
            setPage(1);
          }}
          className="h-[38px] rounded-[6px] border border-[#332C2D] bg-[#111111] px-3 text-sm"
        >
          <option value="MODEL">Models</option>
          <option value="">All accounts</option>
        </select>
        <p className="text-xs text-stone-400">
          Plans, access and limits shown here are what the server enforces right now.
        </p>
      </div>

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <p className="text-sm text-rose-300">Could not load users.</p>
      ) : (
        <div className="overflow-x-auto rounded-[8px] border border-[#332C2D]">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#111111] text-xs uppercase text-stone-400">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Renews / ends</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                    No users found.
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user._id} className="border-t border-[#332C2D]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-stone-100">{user.fullName || "—"}</div>
                    <div className="text-xs text-stone-400">{user.email || ""}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">{user.userMode ?? "—"}</td>
                  <td className="px-4 py-3">
                    {user.planCode ? (
                      <span className="rounded-full bg-[#EF476F]/15 px-2 py-0.5 text-xs font-medium text-[#EF476F]">
                        {user.planCode}
                      </span>
                    ) : (
                      <span className="text-xs text-stone-500">No plan</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${statusTone(user.status, user.subscriptionValid)}`}>
                      {user.status || "none"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {formatDate(user.status === "trialing" ? user.trialEnd : user.currentPeriodEnd)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/subscriptions/${user._id}`}
                      className="rounded-[6px] border border-[#332C2D] px-3 py-1.5 text-xs hover:border-[#EF476F]"
                    >
                      View access
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-3 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-[6px] border border-[#332C2D] px-3 py-1.5 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-stone-400">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-[6px] border border-[#332C2D] px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}
