"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import dummyUserImg from "@/assets/images/dummyUserImg.png";

type ActivityCategory = "brands" | "photographer" | "content creator";
type ActivityFilter = "all" | ActivityCategory;

const peopleWhoLiked = [
  { id: 1, name: "Emma", action: "Photographer", time: "2 Hr", category: "photographer" },
  { id: 2, name: "Ella Jacobs", action: "appreciated your profile", time: "2 Yr", category: "brands" },
  { id: 3, name: "Jack", action: "appreciated your profile", time: "1 Hr", category: "content creator" },
  { id: 4, name: "Ella Jacobs", action: "saved your profile", time: "4 Yr", category: "brands" },
  { id: 5, name: "Jack", action: "appreciated your profile", time: "5 Hr", category: "photographer" },
  { id: 6, name: "Ella Jacobs", action: "appreciated your profile", time: "1 Yr", category: "content creator" },
  { id: 7, name: "Jack", action: "appreciated your profile", time: "3 Hr", category: "photographer" },
  { id: 8, name: "Ella Jacobs", action: "appreciated your profile", time: "2 Yr", category: "brands" },
  { id: 9, name: "Jack", action: "appreciated your profile", time: "2 Hr", category: "content creator" },
];

const profileStats = [
  { id: 1, name: "Ella Jacobs", action: "appreciated your profile", time: "2 Yr" },
  { id: 2, name: "Jack", action: "appreciated your profile", time: "1 Hr" },
  { id: 3, name: "Ella Jacobs", action: "saved your profile", time: "4 Yr" },
  { id: 4, name: "Jack", action: "appreciated your profile", time: "5 Hr" },
  { id: 5, name: "Ella Jacobs", action: "appreciated your profile", time: "1 Yr" },
  { id: 6, name: "Jack", action: "appreciated your profile", time: "3 Hr" },
  { id: 7, name: "Ella Jacobs", action: "appreciated your profile", time: "2 Yr" },
  { id: 8, name: "Jack", action: "appreciated your profile", time: "3 Hr" },
  { id: 9, name: "Jack", action: "appreciated your profile", time: "2 Yr" },
];

type ActivityItem = {
  id: number;
  name: string;
  action: string;
  time: string;
  category?: ActivityCategory;
};

const filterTabs: { label: string; value: ActivityFilter }[] = [
  { label: "All", value: "all" },
  { label: "Brands", value: "brands" },
  { label: "Photographer", value: "photographer" },
  { label: "Content Creator", value: "content creator" },
];

const ActivityList = ({
  title,
  items,
  children,
}: {
  title: string;
  items: ActivityItem[];
  children?: React.ReactNode;
}) => (
  <div className="overflow-hidden rounded-md border border-stone-800 ">
    <div className="bg-white/10 px-3 py-2">
      <h2 className="text-sm font-medium text-stone-100">{title}</h2>
    </div>
    <div className="px-3 text-xs font-light mb-2">

      {children}
    </div>

    <div className="flex flex-col px-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 border-b border-[#313131] px-3 py-2 last:border-b-0"
        >
          <Image
            src={dummyUserImg}
            alt={item.name}
            width={26}
            height={26}
            className="h-8 w-8 shrink-0 rounded-full object-cover"
          />

          <p className="min-w-0 flex-1 truncate text-xs font-normal text-stone-300">
            <span className="text-stone-100">{item.name}</span>{" "}
            {item.action}
          </p>

          <span className="shrink-0 text-xs font-light text-stone-500">
            {item.time}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const LikesSavesContent = () => {
  const [activeFilter, setActiveFilter] = useState<ActivityFilter>("all");

  const filteredPeopleWhoLiked = useMemo(() => {
    if (activeFilter === "all") return peopleWhoLiked;
    return peopleWhoLiked.filter((item) => item.category === activeFilter);
  }, [activeFilter]);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <ActivityList
        title="People Who Liked & Saved This Profile"
        items={filteredPeopleWhoLiked}
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
      <ActivityList title="Profile Liked And Saved By User" items={profileStats} />
    </div>
  );
};

export default LikesSavesContent;
