"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import ModelMansionTabContent from "./model-mansion-tab-content";
import Loader from "../../components/ui/Loader";
import { useGetModelMansionDetails } from "@/hooks/useModelMansion";
import SafeImage from "@/app/components/SafeImage";
import { formatName } from "@/lib/media";
import { planDuration, titleCase } from "./format";

const TABS = [
  "Portfolio",
  "Achievements",
  "University Union",
  "Bookings",
  "Collab Requests",
  "Notifications",
  "Likes & Saves",
  "Chat",
];

const ModelMansionDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const { data: model, isPending, isError, error } = useGetModelMansionDetails(id);

  if (isPending) return <Loader />;

  if (isError || !model) {
    const message =
      (error as any)?.response?.data?.message || "Couldn't load this model.";
    return (
      <p className="mt-10 text-center text-[13px] text-stone-500">{message}</p>
    );
  }

  const portfolio = model.portfolio;
  const rate = portfolio?.settings?.desiredRatePerHour;
  const rateCurrency = rate?.currrency || rate?.currency || "";

  const profileDetails = [
    { label: "Full Name", value: formatName(model.fullName) || "-" },
    { label: "Email Address", value: model.email || "-" },
    {
      label: "Phone Number",
      value: model.phone
        ? `${model.countryCode ? `+${String(model.countryCode).replace(/^\+/, "")} ` : ""}${model.phone}`
        : "-",
    },
    { label: "Gender", value: model.gender ? titleCase(model.gender) : "-" },
    {
      label: "Time for Portfolio",
      value: portfolio ? (portfolio.settings?.tfp ? "Yes" : "No") : "-",
    },
    {
      label: "Desired Rate Per Hour",
      value:
        rate && (rate.min || rate.max)
          ? `${rateCurrency}${rate.min ?? 0} - ${rateCurrency}${rate.max ?? 0}`
          : "-",
    },
    {
      label: "Subscription Plan",
      value: model.subscription?.planName
        ? `${model.subscription.planName} (${titleCase(model.subscription.status)})`
        : "No Plan",
    },
    {
      label: "Plan Duration",
      value: planDuration(
        model.subscription?.currentPeriodStart,
        model.subscription?.currentPeriodEnd,
      ),
    },
    {
      label: "Views, Likes & Saves",
      value: `${model.stats?.views ?? 0} Views, ${model.stats?.likes ?? 0} Likes, ${model.stats?.saves ?? 0} Saves`,
    },
    { label: "Assigned Agent", value: formatName(model.agent?.fullName) || "Unassigned" },
  ];

  const modelNiches: string[] = portfolio?.modelNiches ?? [];

  return (
    <div className="w-full flex flex-col gap-8 text-stone-200">
      <section className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 lg:gap-8 items-start">
        <div className="relative w-full max-w-[420px] mx-auto xl:mx-0 aspect-[1.16/1] rounded-2xl overflow-hidden bg-neutral-800">
          <SafeImage
            src={[portfolio?.headshot, model.image].filter(Boolean)}
            alt={formatName(model.fullName)}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-x-14 gap-y-5 pt-2">
          {profileDetails.map((detail) => (
            <div key={detail.label} className="min-w-0">
              <p className="text-neutral-400 text-xs leading-tight">
                {detail.label}
              </p>
              <p className={`mt-1 text-stone-200 text-sm font-medium leading-4 break-words ${detail.label === "Assigned Agent" && model.agent ? "underline" : ""} `}>
                {detail.value}
              </p>
            </div>
          ))}

          <div className="sm:col-span-2">
            <p className="text-neutral-400 text-xs leading-tight">
              Model Niches
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {modelNiches.length ? (
                modelNiches.map((niche) => (
                  <span
                    key={niche}
                    className="px-3 py-1.5 rounded-full bg-rose-500 text-white text-xs font-light leading-4"
                  >
                    {titleCase(niche)}
                  </span>
                ))
              ) : (
                <span className="text-sm text-stone-500">-</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full min-w-0 flex flex-col gap-4">
        <div className="w-full md:max-w-fit mx-auto overflow-x-auto overflow-y-hidden">
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

        <ModelMansionTabContent activeTab={activeTab} model={model} />
      </section>
    </div>
  );
};

export default ModelMansionDetailsPage;
