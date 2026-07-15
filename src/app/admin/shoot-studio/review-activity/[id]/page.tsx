"use client";

import Image from "next/image";
import dummyUserImg from "@/assets/images/dummyUserImg.png";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { NavArrowDownSolid } from "iconoir-react";

const labelClass = "text-xs font-normal text-stone-400";
const valueClass = "text-sm font-medium text-stone-100";
const controlClass =
  "h-11 w-full appearance-none rounded-md border border-stone-700 bg-transparent px-3 text-xs font-normal text-stone-200 outline-none transition-colors focus:border-rose-500";

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-2">
    <p className={labelClass}>{label}</p>
    <p className={valueClass}>{value}</p>
  </div>
);

const Panel = ({
  title,
  children,
  collapsible = false,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-md border border-stone-700 bg-black/10">
      <button
        type="button"
        onClick={() => collapsible && setIsOpen((prev) => !prev)}
        className="flex h-10 w-full items-center justify-between bg-white/10 px-4"
      >
        <h2 className="text-sm font-medium text-stone-100">{title}</h2>

        {collapsible && (
          <NavArrowDownSolid
            className={`h-4 w-4 text-stone-300 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {isOpen && <div className="px-2 pt-3 pb-3">{children}</div>}
    </section>
  );
};

const SelectControl = ({ label }: { label: string }) => (
  <label className="block">
    <span className="mb-2 block text-xs font-normal text-stone-200">
      {label}
    </span>
    <div className="relative">
      <select defaultValue="1 Star" className={`${controlClass} pr-9`}>
        <option className="bg-neutral-900">1 Star</option>
        <option className="bg-neutral-900">2 Stars</option>
        <option className="bg-neutral-900">3 Stars</option>
        <option className="bg-neutral-900">4 Stars</option>
        <option className="bg-neutral-900">5 Stars</option>
      </select>
      <NavArrowDownSolid className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-300" />
    </div>
  </label>
);

const ReviewActivityPage = () => {
  const router = useRouter();

  return (
    <div className="w-full space-y-5 text-stone-100">
      <Panel title="Model Details" collapsible>
        <div className="grid grid-cols-1 gap-x-20 gap-y-6 md:grid-cols-2">
          <DetailItem label="Model Name" value="Naomi" />
          <DetailItem label="Gender" value="Male" />
          <DetailItem label="Phone Number" value="+7 457 458 7896" />
          <DetailItem label="Email Address" value="johnsonalexu@gmail.com" />
        </div>
      </Panel>
      <Panel title="Shoot Details" collapsible>
        <div className="grid grid-cols-1 gap-x-20 gap-y-6 md:grid-cols-2 mb-2 md:mb-4">
          <DetailItem label="Shoot Goal" value="Digitals" />
          <DetailItem label="Shoot Format" value="Portraits" />

          <DetailItem label="Shoot Vibes" value="Clean & Minimal" />
          <DetailItem label="Outfit" value="1" />
        </div>
        <div className="md:col-span-2 space-y-2">
          <p className={labelClass}>Requested add ons</p>

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

      <Panel title="More Information" collapsible>
        <div className="space-y-6">
          <div>
            <p className="mb-3 text-xs font-normal text-white/60">
              Was Present?
            </p>
            <div className="flex flex-wrap gap-10">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-stone-100">
                <input
                  type="radio"
                  name="presence"
                  defaultChecked
                  className="h-3 w-3 accent-rose-500"
                />
                Yes, was present.
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-stone-100">
                <input
                  type="radio"
                  name="presence"
                  className="h-3 w-3 accent-rose-500"
                />
                No, did not show up
              </label>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-normal text-white/60">
              Upload Pictures
            </p>
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="relative h-28 w-32 overflow-hidden rounded-md border border-stone-600 bg-stone-900"
                >
                  <Image
                    src={dummyUserImg}
                    alt="Uploaded activity"
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                </div>
              ))}
              <button
                type="button"
                className="flex h-28 w-32 items-center justify-center gap-2 rounded-md border border-stone-700 bg-[#1A1A1ACC] text-[10px] font-normal text-stone-300 transition-colors hover:bg-white/10"
              >
                <Plus className="h-3 w-3" />
                Add More
              </button>
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Ratings & Review" collapsible>
        <div className="space-y-4">
          <SelectControl label="Rate this activity" />

          <label className="block">
            <span className="mb-2 block text-xs font-normal text-stone-200">
              Comments
            </span>
            <div className="relative">
              <textarea
                placeholder="Add Comments"
                rows={5}
                className="w-full resize-none rounded-md border border-stone-700 bg-transparent px-3 py-3 text-xs font-normal text-stone-200 outline-none transition-colors focus:border-rose-500"
              />
            </div>
          </label>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[260px_1fr]">
        <button
          type="button"
          onClick={() => router.push("/admin/training-theater")}
          className="h-11 rounded-md border border-stone-500 text-xs font-medium text-stone-200 transition-colors hover:border-stone-300 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/training-theater")}
          className="h-11 rounded-md bg-[#EF476F] text-sm font-medium text-white transition-colors hover:bg-rose-600"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default ReviewActivityPage;
