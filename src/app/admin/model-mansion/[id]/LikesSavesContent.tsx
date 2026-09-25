"use client";

import { useState } from "react";
import SafeImage from "@/app/components/SafeImage";
import { useGetModelMansionLikesSaves } from "@/hooks/useModelMansion";
import { formatName } from "@/lib/media";
import { timeAgo, titleCase } from "./format";

type ActivityEntry = {
  user: { _id: string; fullName: string; image?: string; userMode?: string };
  action: "liked" | "saved";
  at: string | null;
};

// Filter value = the liker's userMode
const filterTabs: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Brands", value: "BRAND" },
  { label: "Photographer", value: "PHOTOGRAPHER" },
  { label: "Content Creator", value: "CREATOR" },
];

const ActivityList = ({
  title,
  items,
  emptyText,
  describe,
  children,
}: {
  title: string;
  items: ActivityEntry[];
  emptyText: string;
  describe: (item: ActivityEntry) => string;
  children?: React.ReactNode;
}) => (
  <div className="overflow-hidden rounded-md border border-stone-800 ">
    <div className="bg-white/10 px-3 py-2">
      <h2 className="text-sm font-medium text-stone-100">{title}</h2>
    </div>
    <div className="px-3 text-xs font-light mb-2">{children}</div>

    <div className="flex flex-col px-2">
      {items.length ? (
        items.map((item, index) => (
          <div
            key={`${item.user._id}-${item.action}-${index}`}
            className="flex items-center gap-3 border-b border-[#313131] px-3 py-2 last:border-b-0"
          >
            <SafeImage
              src={item.user.image}
              alt={formatName(item.user.fullName)}
              className="h-8 w-8 shrink-0 rounded-full object-cover bg-stone-700"
            />

            <p className="min-w-0 flex-1 truncate text-xs font-normal text-stone-300">
              <span className="text-stone-100">{formatName(item.user.fullName)}</span>{" "}
              {describe(item)}
              {item.user.userMode ? (
                <span className="text-stone-500"> · {titleCase(item.user.userMode)}</span>
              ) : null}
            </p>

            <span className="shrink-0 text-xs font-light text-stone-500">
              {timeAgo(item.at)}
            </span>
          </div>
        ))
      ) : (
        <p className="px-3 py-6 text-center text-xs text-stone-500">{emptyText}</p>
      )}
    </div>
  </div>
);

const LikesSavesContent = ({ modelId }: { modelId: string }) => {
  const [activeFilter, setActiveFilter] = useState("");
  const { data, isPending, isError } = useGetModelMansionLikesSaves(
    modelId,
    activeFilter,
  );

  if (isPending) {
    return <p className="py-8 text-center text-xs text-stone-500">Loading...</p>;
  }

  if (isError) {
    return (
      <p className="py-8 text-center text-xs text-stone-500">
        Couldn&apos;t load likes and saves.
      </p>
    );
  }

  const received: ActivityEntry[] = data?.received ?? [];
  const given: ActivityEntry[] = data?.given ?? [];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <ActivityList
        title={`People Who Liked & Saved This Profile (${data?.counts?.likes ?? 0} Likes, ${data?.counts?.saves ?? 0} Saves)`}
        items={received}
        emptyText="Nobody has liked or saved this profile yet."
        describe={(item) => `${item.action} this profile`}
      >
        <div className="mt-2 flex flex-wrap items-center gap-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveFilter(tab.value)}
              className={`px-2 py-1 text-[10px] font-normal capitalize transition-colors ${
                activeFilter === tab.value
                  ? "border-b border-rose-500 text-rose-500"
                  : "text-stone-400 hover:bg-stone-800 hover:text-stone-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </ActivityList>
      <ActivityList
        title="Profile Liked And Saved By User"
        items={given}
        emptyText="This model hasn't liked or saved any profiles."
        describe={(item) => `was ${item.action} by this model`}
      />
    </div>
  );
};

export default LikesSavesContent;
