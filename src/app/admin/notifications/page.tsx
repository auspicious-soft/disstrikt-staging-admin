import React from "react";
import { ChevronDown } from "lucide-react";
import { ArrowSeparateVertical, Copy, NavArrowDownSolid } from "iconoir-react";

const inputClass =
  "h-11 w-full rounded-md border border-stone-700 bg-transparent px-3 text-xs font-normal text-stone-200 outline-none transition-colors placeholder:text-stone-500 focus:border-rose-400";

const selectClass =
  "h-9 w-full appearance-none rounded-md border border-stone-700 bg-transparent px-3 pr-9 text-[11px] font-normal text-stone-300 outline-none transition-colors focus:border-rose-400";

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="mb-1.5 block text-xs font-normal leading-none text-stone-200">
    {children}
  </span>
);

const NotificationsPage = () => {
  return (
    <main className="w-full text-stone-200">
      <section className="w-full rounded-md border border-stone-700 bg-black/10 p-4">
        <form className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-sm font-medium leading-none text-stone-100">
              Notification
            </h1>

            <label className="relative w-full sm:w-[295px]" aria-label="Preferred Language">
              <select className={selectClass} placeholder="">
                <option value="" disabled className="bg-stone-900">
                  Preferred Language
                </option>
                <option className="bg-stone-900">English</option>
                <option className="bg-stone-900">French</option>
                <option className="bg-stone-900">Spanish</option>
                <option className="bg-stone-900">Dutch</option>
              </select>
              <ArrowSeparateVertical className="pointer-events-none absolute right-3 top-1/2 h-2.5 w-3.5 -translate-y-1/2 text-stone-500" />
            </label>
          </div>

          <label className="block">
            <FieldLabel>Title</FieldLabel>
            <input
              className={inputClass}
              placeholder="Rising Star Plan"
              type="text"
            />
          </label>

          <label className="block">
            <FieldLabel>Description</FieldLabel>
            <div className="relative">
            <textarea
              className="h-44 w-full resize-none rounded-md border border-stone-700 bg-transparent px-3 py-3 text-xs font-normal text-stone-200 outline-none transition-colors placeholder:text-stone-500 focus:border-rose-400 md:h-[174px]"
              placeholder="Description of the notification goes here"
            />
            <Copy className="pointer-events-none absolute right-2 bottom-4 h-3.5 w-3.5 text-stone-500" />
            </div>
          </label>

          <label className="flex w-fit cursor-pointer items-center gap-2 text-xs font-normal text-stone-500">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-stone-700 bg-stone-800 accent-rose-500"
            />
            <span>Send to specific people</span>
          </label>

          <label className="block">
            <FieldLabel>Select People</FieldLabel>
            <div className="relative">
              <select className={inputClass + " appearance-none pr-9"} placeholder="">
                <option value="" disabled className="bg-stone-900">
                  Select
                </option>
                <option className="bg-stone-900">All Users</option>
                <option className="bg-stone-900">Rising Star Users</option>
                <option className="bg-stone-900">Hot Fame Users</option>
                <option className="bg-stone-900">Aspire Model Users</option>
              </select>
              <NavArrowDownSolid className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
            </div>
          </label>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="h-10 w-full rounded-md bg-[#EF476F] px-5 text-sm font-medium text-white transition-colors hover:bg-rose-600 sm:w-auto"
            >
              Send Notification
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default NotificationsPage;
