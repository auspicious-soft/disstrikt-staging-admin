"use client";

import Image, { StaticImageData } from "next/image";
import { ChevronDown } from "lucide-react";
import AchievementsContent from "../../components/AchievementsContent";
import UniversityUnionContent from "../../components/UniversityUnionContent";
import BookingsContent from "../../components/BookingsContent";
import CollabRequestsContent from "./CollabRequestsContent";
import NotificationsContent from "./NotificationsContent";
import LikesSavesContent from "./LikesSavesContent";
import { NavArrowDownSolid } from "iconoir-react";

type TabContentProps = {
  activeTab: string;
  profileImage: StaticImageData;
};

type MeasurementItem = {
  label: string;
  value: string;
};

type Section = {
  title: string;
  items?: MeasurementItem[];
};

const portfolioSections: Section[] = [
  {
    title: "Headshot & Measurements",
    items: [
      { label: "Height", value: "172 Cm" },
      { label: "Bust", value: "Cm" },
      { label: "Waist", value: "Cm" },
      { label: "Hips", value: "Cm" },
      { label: "Shoe Size", value: "Cm" },
      { label: "Hair Color", value: "Select" },
      { label: "Eye Color", value: "Select" },
    ],
  },
  {
    title: "Basic Portfolio",
    items: [
      { label: "Primary Market", value: "Commercial" },
      { label: "Languages", value: "English, French" },
      { label: "Availability", value: "Weekdays" },
      { label: "Travel Ready", value: "Yes" },
    ],
  },
  {
    title: "Versatility & Experience",
    items: [
      { label: "Editorial", value: "Advanced" },
      { label: "Fitness", value: "Intermediate" },
      { label: "Runway", value: "Advanced" },
      { label: "Commercial", value: "Advanced" },
    ],
  },
  {
    title: "Detailed Measurements",
    items: [
      { label: "Shoulder", value: "Cm" },
      { label: "Inseam", value: "Cm" },
      { label: "Dress Size", value: "Select" },
      { label: "Cup Size", value: "Select" },
    ],
  },
  {
    title: "Videos",
    items: [
      { label: "Introduction Reel", value: "Not uploaded" },
      { label: "Walk Video", value: "Not uploaded" },
    ],
  },
];

const tabSections: Record<string, Section[]> = {
  Portfolio: portfolioSections,
  Achievements: [
    {
      title: "Campaigns & Awards",
      items: [
        { label: "Featured Campaigns", value: "12" },
        { label: "Awards", value: "Best Emerging Model" },
        { label: "Published In", value: "5 magazines" },
      ],
    },
  ],
  "University Union": [
    {
      title: "University Union",
      items: [
        { label: "University", value: "New York Arts Institute" },
        { label: "Program", value: "Fashion Media" },
        { label: "Status", value: "Active" },
      ],
    },
  ],
  Bookings: [
    {
      title: "Bookings",
      items: [
        { label: "Completed", value: "18" },
        { label: "Upcoming", value: "3" },
        { label: "Cancelled", value: "1" },
      ],
    },
  ],
  "Collab Requests": [
    {
      title: "Collab Requests",
      items: [
        { label: "Pending", value: "4" },
        { label: "Accepted", value: "9" },
        { label: "Rejected", value: "2" },
      ],
    },
  ],
  Notifications: [
    {
      title: "Notifications",
      items: [
        { label: "Unread", value: "6" },
        { label: "Mentions", value: "2" },
        { label: "System Alerts", value: "0" },
      ],
    },
  ],
  "Likes & Saves": [
    {
      title: "Likes & Saves",
      items: [
        { label: "Profile Views", value: "458" },
        { label: "Likes", value: "38" },
        { label: "Saves", value: "58" },
      ],
    },
  ],
};

const ModelMansionTabContent = ({
  activeTab,
  profileImage,
}: TabContentProps) => {
  const sections = tabSections[activeTab] ?? portfolioSections;

  return (
    <div className="w-full flex flex-col gap-2">
      {activeTab === "Achievements" ? (
      <AchievementsContent />
    ) : activeTab === "University Union" ? (
      <UniversityUnionContent />
      ) : activeTab === "Bookings" ? (
      <BookingsContent />
    ) : activeTab === "Collab Requests" ? (
      <CollabRequestsContent />
    ) : activeTab === "Notifications" ? (
      <NotificationsContent />
    ) : activeTab === "Likes & Saves" ? (
      <LikesSavesContent />
    ) : sections.map((section, index) => (
        <details
          key={section.title}
          open={activeTab === "Portfolio" && index === 0}
          className="group rounded-md border border-stone-700 bg-black/20 overflow-hidden"
        >
          <summary className="min-h-9 px-3 py-2 flex items-center justify-between gap-3 cursor-pointer list-none text-stone-200 text-sm font-medium">
            <span>{section.title}</span>
            <NavArrowDownSolid className="w-4 h-4 shrink-0 text-stone-300 transition-transform group-open:rotate-180" />
          </summary>

          <div className="border-t border-stone-800 px-3 py-4">
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-5">
              {activeTab === "Portfolio" && index === 0 ? (
                <div className="relative w-full max-w-[240px] aspect-square rounded-md overflow-hidden bg-neutral-800">
                  <Image
                    src={profileImage}
                    alt="Model headshot"
                    fill
                    sizes="240px"
                    className="object-cover"
                  />
                </div>
              ) : null}

              <div
                className={`grid grid-cols-2 sm:grid-cols-2 gap-x-10 gap-y-4 ${
                  activeTab === "Portfolio" && index === 0
                    ? ""
                    : "md:col-span-2"
                }`}
              >
                {section.items?.map((item) => (
                  <div key={`${section.title}-${item.label}`} className="min-w-0">
                    <p className="text-neutral-400 text-xs font-normal leading-tight">
                      {item.label}
                    </p>
                    <p className="mt-1 text-stone-200 text-sm font-medium leading-tight break-words">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
};

export default ModelMansionTabContent;
