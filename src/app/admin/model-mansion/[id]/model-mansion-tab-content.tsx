"use client";

import Image, { StaticImageData } from "next/image";
import { ChevronDown } from "lucide-react";
import AchievementsContent from "../../components/AchievementsContent";
import UniversityUnionContent from "../../components/UniversityUnionContent";
import BookingsContent from "../../components/BookingsContent";
import CollabRequestsContent from "./CollabRequestsContent";
import NotificationsContent from "./NotificationsContent";
import LikesSavesContent from "./LikesSavesContent";
import ChatWindow from "@/app/components/ChatWindow";
import ModelProfileSlider from "@/app/components/Modelprofileslider";

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
const messages = [
  {
    id: "1",
    sender: "other",
    message: "Hi, I got a message about auditions.",
    time: "18:12",
  },
  {
    id: "2",
    sender: "me",
    message: "Hi! Thanks for replying 😊",
    time: "18:16",
  },
  {
    id: "3",
    sender: "me",
    message: "Are you available for a short Zoom audition this week?",
    time: "18:16",
  },
];

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
      ) : activeTab === "Chat" ? (
        <ChatWindow name="Naomi" messages={messages} />
      ) : (
        <ModelProfileSlider profileImage={profileImage}/>
        // sections.map((section, index) => (
        //   // <details
        //   //   key={section.title}
        //   //   open={activeTab === "Portfolio" && index === 0}
        //   //   className="group rounded-2xl border-2 border-red-900/70 bg-black overflow-hidden shadow-[0_0_25px_-5px_rgba(190,18,60,0.35)]"
        //   // >
        //   //   <summary className="min-h-9 px-4 py-3 flex items-center justify-between gap-3 cursor-pointer list-none">
        //   //     <div>
        //   //       {activeTab === "Portfolio" && index === 0 && (
        //   //         <p className="text-red-500 font-serif text-sm mb-1">
        //   //           {String(index + 1).padStart(2, "0")}
        //   //         </p>
        //   //       )}
        //   //       <span className="text-red-500 font-serif uppercase tracking-wide text-lg">
        //   //         {section.title}
        //   //       </span>
        //   //     </div>
        //   //     <ChevronDown className="w-4 h-4 shrink-0 text-red-500/70 transition-transform group-open:rotate-180" />
        //   //   </summary>

        //   //   <div className="border-t border-red-900/30 px-4 py-5">
        //   //     <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
        //   //       {activeTab === "Portfolio" && index === 0 ? (
        //   //         <div className="relative w-full max-w-[240px] aspect-square rounded-xl overflow-hidden bg-neutral-900 border border-red-900/40">
        //   //           <Image
        //   //             src={profileImage}
        //   //             alt="Model headshot"
        //   //             fill
        //   //             sizes="240px"
        //   //             className="object-cover"
        //   //           />
        //   //         </div>
        //   //       ) : null}

        //   //       <div
        //   //         className={`grid grid-cols-2 gap-x-6 gap-y-4 ${
        //   //           activeTab === "Portfolio" && index === 0
        //   //             ? ""
        //   //             : "md:col-span-2"
        //   //         }`}
        //   //       >
        //   //         {section.items?.map((item) => (
        //   //           <div
        //   //             key={`${section.title}-${item.label}`}
        //   //             className="min-w-0"
        //   //           >
        //   //             <p className="text-neutral-500 text-[11px] leading-tight mb-1.5">
        //   //               {item.label}
        //   //             </p>
        //   //             <div className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2.5">
        //   //               <p className="text-stone-100 text-sm font-medium leading-tight break-words">
        //   //                 {item.value}
        //   //               </p>
        //   //             </div>
        //   //           </div>
        //   //         ))}
        //   //       </div>
        //   //     </div>
        //   //   </div>
        //   // </details>
          
        // ))
      )}
    </div>
  );
};

export default ModelMansionTabContent;
