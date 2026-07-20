"use client";

import Image from "next/image";
import { useState } from "react";
import dummyUserImg from "../../../../assets/images/dummyUserImg.png";
import ModelMansionTabContent from "./model-mansion-tab-content";

const TABS = [
  "Portfolio",
  "Achievements",
  "University Union",
  "Bookings",
  "Collab Requests",
  "Notifications",
  "Likes & Saves",
];

const profileDetails = [
  { label: "Full Name", value: "Alex Johnson" },
  { label: "Email Address", value: "Johnsonalexuy789@Dummyemail" },
  { label: "Phone Number", value: "+7 584 789 5689" },
  { label: "Gender", value: "Male" },
  { label: "Time for Portfolio", value: "No" },
  { label: "Desired Rate Per Hour", value: "\u20ac50 - \u20ac150" },
  { label: "Subscription Plan", value: "Rising Star Plan" },
  { label: "Plan Duration", value: "6 Months" },
  { label: "Views, Likes & Saves", value: "458 Views, 385 Likes, 58 Saves" },
  { label: "Assigned Agent", value: "Agent Name" },
];

const modelNiches = ["Commercial", "Editorial", "Fitness", "Runway"];

const ModelMansionDetailsPage = () => {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  return (
    <div className="w-full flex flex-col gap-8 text-stone-200">
      <section className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 lg:gap-8 items-start">
        <div className="relative w-full max-w-[420px] mx-auto xl:mx-0 aspect-[1.16/1] rounded-2xl overflow-hidden bg-neutral-800">
          <Image
            src={dummyUserImg}
            alt="Alex Johnson"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 420px"
            className="object-cover"
          />
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-x-14 gap-y-5 pt-2">
          {profileDetails.map((detail) => (
            <div key={detail.label} className="min-w-0">
              <p className="text-neutral-400 text-xs leading-tight">
                {detail.label}
              </p>
              <p className={`mt-1 ${detail.label === "Assigned Agent" ? "underline" : "" } text-stone-200 text-sm font-medium leading-4 break-words`}>
                {detail.value}
              </p>
            </div>
          ))}

          <div className="sm:col-span-2">
            <p className="text-neutral-400 text-xs leading-tight">
              Model Niches
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {modelNiches.map((niche) => (
                <span
                  key={niche}
                  className="px-3 py-1.5 rounded-full bg-rose-500 text-white text-xs font-light leading-4"
                >
                  {niche}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full min-w-0 flex flex-col gap-4">
        <div className="w-full max-w-fit mx-auto overflow-x-auto overflow-y-hidden">
          <div className="mx-auto flex min-w-max items-center gap-1.5 rounded-full bg-white/10 p-[3px]">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`h-9 px-4 rounded-full text-xs font-normal leading-4 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab
                    ? "bg-rose-500 text-white"
                    : "text-stone-300 hover:bg-neutral-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <ModelMansionTabContent
          activeTab={activeTab}
          profileImage={dummyUserImg}
        />
      </section>
    </div>
  );
};

export default ModelMansionDetailsPage;
