"use client";

import CustomSelect from "@/app/components/CustomSelect";
import { ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

const detailClass = "space-y-2";
const labelClass = "text-xs font-normal text-stone-400";
const valueClass = "text-sm font-medium text-stone-100";

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className={detailClass}>
    <p className={labelClass}>{label}</p>
    <p className={valueClass}>{value}</p>
  </div>
);

const Panel = ({
  title,
  children,
  columns = 2,
}: {
  title: string;
  children: ReactNode;
  columns?: 2 | 3;
}) => (
  <section className="mb-4 overflow-hidden rounded-md border border-stone-700 bg-black/10">
    <div className="flex h-10 items-center bg-white/10 px-4">
      <h2 className="text-sm font-medium text-stone-100">{title}</h2>
    </div>

    <div
      className={`grid grid-cols-1 gap-x-20 gap-y-6 px-4 py-5 ${
        columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2"
      }`}
    >
      {children}
    </div>
  </section>
);

const EditBookingPage = () => {
  const router = useRouter();
  const [country, setCountry] = useState("");

  return (
    <div className="w-full text-stone-100">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-64"></div>
      </div>

      <Panel title="Model Details">
        <DetailItem label="Model Name" value="Naomi" />
        <DetailItem label="Gender" value="Male" />
        <DetailItem label="Phone Number" value="+7 457 458 7896" />
        <DetailItem label="Email Address" value="johnsonalexu@gmail.com" />
      </Panel>

      <Panel title="Booking Details" columns={3}>
        <DetailItem label="Studio" value="London" />
        <DetailItem label="Date" value="24 July 2026" />
        <DetailItem label="Time" value="10:30 AM" />
      </Panel>
      <Panel title="Shoot Details">
        <DetailItem label="Shoot Goal" value="Digitals" />
        <DetailItem label="Shoot Format" value="Portraits" />

        <DetailItem label="Shoot Vibes" value="Clean & Minimal" />
        <DetailItem label="Outfit" value="1" />

        <div className="md:col-span-2 space-y-2">
          <p className={labelClass}>Requested addons</p>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-stone-100">
            <div className="flex items-center gap-2">
              <span className="text-stone-400">•</span>
              <span>Retouch 3 Pictures (Charges $9.99)</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stone-400">•</span>
              <span>Retouch 3 Pictures (Charges $9.99)</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stone-400">•</span>
              <span>Retouch 3 Pictures (Charges $9.99)</span>
            </div>
          </div>
        </div>
      </Panel>

      <button
        type="button"
        onClick={() => router.push("/admin/training-theater")}
        className="h-12 w-full rounded-md bg-[#EA3838] text-sm font-medium text-white transition-colors hover:bg-red-600"
      >
        Cancel Booking
      </button>
    </div>
  );
};

export default EditBookingPage;
