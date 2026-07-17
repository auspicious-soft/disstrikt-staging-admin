"use client";

import Image from "next/image";
import dummyUserImg from "@/assets/images/dummyUserImg.png";
import { Clock3, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { Calendar } from "iconoir-react";

const selectedModels = [
  {
    id: 1,
    name: "Naomi Dubois",
    location: "Paris, France",
    height: "172 cm",
    stats: "84 / 60 / 86",
    shoe: "39 EU",
  },
  {
    id: 2,
    name: "Naomi Dubois",
    location: "Paris, France",
    height: "172 cm",
    stats: "84 / 60 / 86",
    shoe: "39 EU",
  },
  {
    id: 3,
    name: "Naomi Dubois",
    location: "Paris, France",
    height: "172 cm",
    stats: "84 / 60 / 86",
    shoe: "39 EU",
  },
];

const labelClass = "";
const valueClass = "";

const ModelCard = ({ model }: { model: (typeof selectedModels)[number] }) => (
  <article className="flex min-w-0 gap-3 rounded-md bg-white/10 p-2">
    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-stone-800">
      <Image
        src={dummyUserImg}
        alt={model.name}
        fill
        sizes="96px"
        className="object-cover"
      />
    </div>

    <div className="min-w-0 flex-1 py-1">
      <h2 className="truncate text-base font-medium text-stone-100">
        {model.name}
      </h2>

      <div className="mt-2 flex items-center gap-1 text-xs font-light text-stone-400">
        <MapPin className="h-3 w-3 shrink-0" />
        <span className="truncate">{model.location}</span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-light text-stone-400">
        <span>{model.height}</span>
        <span>{model.stats}</span>
        <span>{model.shoe}</span>
      </div>

      <button
        type="button"
        className="mt-2 text-xs font-medium text-white/70 underline"
      >
        View Portfolio
      </button>
    </div>
  </article>
);

const Panel = ({
  title,
  children,
  right,
}: {
  title: string;
  children: ReactNode;
  right?: ReactNode;
}) => (
  <section className="overflow-hidden rounded-md border border-stone-700 bg-black/10">
    <div className="flex h-10 items-center justify-between bg-white/10 px-3">
      <h1 className="text-sm font-medium text-stone-100">{title}</h1>
      {right}
    </div>
    <div className="p-3">{children}</div>
  </section>
);

const InfoItem = ({
  label,
  value,
  labelClassName = "",
  valueClassName = "",
}: {
  label: string;
  value: string;
  labelClassName?: string;
  valueClassName?: string;
}) => (
  <div>
    <p className={`${labelClassName} ${labelClass}`}>{label}</p>
    <p className={`${valueClass} ${valueClassName}`}>{value}</p>
  </div>
);

const ModelMarketDetailsPage = () => {
  return (
    <div className="w-full space-y-4 text-stone-100">
      <Panel
        title="3 Selected Models"
      >
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {selectedModels.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      </Panel>

      <Panel title="Booking Summary">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1.5fr]">
          <div className="rounded-md p-2">
            <div className="flex items-center justify-between gap-4">
              <InfoItem
                label="Agency Name"
                value=""
                labelClassName="text-rose-500 text-sm font-medium"
              />
              <span className="text-sm font-semibold text-rose-500">€500</span>
            </div>

            <div className="mt-3 space-y-2 text-[10px] font-normal text-stone-400">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                Paris, France
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-2 border-r border-stone-600 pr-4">
                  <Calendar className="h-3.5 w-3.5" />
                  12 Jun - 14 Jun
                </span>
                <span className="flex items-center gap-2">
                  <Clock3 className="h-3.5 w-3.5" />
                  10:00 AM
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 rounded-md bg-white/10 p-4 md:grid-cols-[0.55fr_1.45fr]">
            <InfoItem label="Travel Covered" value="Yes"  labelClassName="text-white/60 text-sm font-normal"/>
            <InfoItem
              label="Creative Team"
              value="Photographer, Makeup Artist, Stylist"
              labelClassName="text-white/60 text-[10px] font-normal "
              valueClassName="mt-1 text-xs font-medium text-stone-100"
            />
          </div>
        </div>
      </Panel>

      <Panel title="Investment">
        <div className="grid grid-cols-1 gap-5 px-1 pb-4 md:grid-cols-2">
          <InfoItem label="Investment Per Model" value="€500" labelClassName="text-white/60 text-[10px] font-normal " valueClassName="mt-1 text-xs font-medium text-stone-100" />
          <InfoItem label="Total Number Of Models" value="3"  labelClassName="text-white/60 text-[10px] font-normal " valueClassName="mt-1 text-xs font-medium text-stone-100"/>
        </div>

        <div className="flex items-center justify-between rounded-md bg-white/10 px-4 py-3">
          <span className="text-xs font-medium text-stone-100">Total</span>
          <span className="text-base font-medium text-rose-500">€1500</span>
        </div>
      </Panel>
    </div>
  );
};

export default ModelMarketDetailsPage;
