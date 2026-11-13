"use client";

import { useState } from "react";
import { toast } from "sonner";
import Loader from "../../components/ui/Loader";
import { SubscriptionTabs } from "../SubscriptionTabs";
import { errorMessage, useReviewShoutout, useShoutouts } from "@/hooks/useSubscriptionAdmin";
import { useDebouncedValue } from "@/hooks/useDebounce";
import { BASE_IMG_URL } from "@/constants/apiUrls";

const STATUSES = ["PENDING", "APPROVED", "POSTED", "REJECTED", "CANCELLED", "ALL"] as const;

const imageUrl = (key: string) => (/^https?:\/\//.test(key) ? key : `${BASE_IMG_URL}${key}`);

export default function ShoutoutsPage() {
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("PENDING");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debounced = useDebouncedValue(search, 400);
  const { data, isLoading, isError } = useShoutouts({ page, status, search: String(debounced ?? "").trim() });
  const review = useReviewShoutout();
  const rows: any[] = data?.rows ?? [];

  const act = (id: string, action: "APPROVE" | "REJECT" | "POST") => {
    let note: string | undefined;
    let postUrl: string | undefined;
    if (action === "REJECT") {
      note = window.prompt("Reason (shown to the model)") ?? undefined;
      if (!note) return;
    }
    if (action === "POST") {
      postUrl = window.prompt("Instagram link of the post (https://www.instagram.com/...)") ?? undefined;
      if (!postUrl) return;
    }
    review.mutate(
      { id, action, note, postUrl },
      {
        onSuccess: () => toast.success("Updated; the model has been notified"),
        onError: (e) => toast.error(errorMessage(e, "Could not update")),
      },
    );
  };

  return (
    <main className="w-full space-y-4 text-stone-200">
      <SubscriptionTabs active="shoutouts" />
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2 text-xs">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1 ${status === s ? "bg-[#EF476F] text-white" : "bg-[#111111] text-stone-300"}`}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value.replace(/^\s+/, ""));
            setPage(1);
          }}
          placeholder="Name, email or Instagram"
          className="h-[34px] w-full max-w-[280px] rounded-[6px] border border-[#332C2D] bg-[#111111] px-3 text-sm"
        />
      </div>
      <p className="text-xs text-stone-400">Rising Star models (RSP-F / RSP-C) can send one shoutout request at a time.</p>

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <p className="text-sm text-rose-300">Could not load shoutout requests.</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-stone-400">Nothing here.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((row) => (
            <article key={row._id} className="rounded-[8px] border border-[#332C2D] bg-[#111111] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-medium text-stone-100">{row.userId?.fullName ?? "Model"}</h2>
                  <p className="text-xs text-stone-400">
                    {row.instagramHandle} · {row.type === "STORY" ? "Story" : "Post"} · {new Date(row.createdAt).toLocaleDateString()}
                    {row.preferredDate ? ` · wants ${new Date(row.preferredDate).toLocaleDateString()}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-black px-2 py-0.5 text-xs">{row.status}</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-stone-200">{row.caption}</p>
              {row.images?.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {row.images.map((img: string) => (
                    <a key={img} href={imageUrl(img)} target="_blank" rel="noreferrer">
                      <img src={imageUrl(img)} alt="" className="h-24 w-24 rounded-[6px] object-cover" />
                    </a>
                  ))}
                </div>
              )}
              {row.reviewNote && <p className="mt-2 text-xs text-stone-400">Note: {row.reviewNote}</p>}
              {row.postUrl && (
                <a href={row.postUrl} target="_blank" rel="noreferrer" className="mt-2 block text-xs text-[#EF476F]">
                  View post
                </a>
              )}
              {(row.status === "PENDING" || row.status === "APPROVED") && (
                <div className="mt-3 flex gap-2 text-xs">
                  {row.status === "PENDING" && (
                    <button disabled={review.isPending} onClick={() => act(row._id, "APPROVE")} className="rounded-[6px] bg-emerald-600 px-3 py-1.5 text-white">
                      Approve
                    </button>
                  )}
                  <button disabled={review.isPending} onClick={() => act(row._id, "POST")} className="rounded-[6px] bg-[#EF476F] px-3 py-1.5 text-white">
                    Mark posted
                  </button>
                  <button disabled={review.isPending} onClick={() => act(row._id, "REJECT")} className="rounded-[6px] border border-[#332C2D] px-3 py-1.5">
                    Reject
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {data?.pagination?.totalPages > 1 && (
        <div className="flex items-center justify-end gap-3 text-sm">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-[6px] border border-[#332C2D] px-3 py-1.5 disabled:opacity-40">
            Previous
          </button>
          <span className="text-stone-400">
            Page {page} of {data.pagination.totalPages}
          </span>
          <button
            disabled={page >= data.pagination.totalPages}
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
