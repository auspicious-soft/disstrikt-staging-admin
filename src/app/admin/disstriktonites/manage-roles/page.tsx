"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

const modules = [
  "Model Mansion",
  "Model Market",
  "Job Junction",
  "Training Theater",
  "Shoot Studio",
  "University Union",
  "Celebration Cruise",
  "Subscription Management",
  "Studio Management",
];

const selectClass =
  "h-11 w-full appearance-none rounded-md border border-stone-700 bg-transparent px-3 pr-9 text-xs font-normal text-stone-200 outline-none transition-colors focus:border-rose-400";

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="mb-1.5 block text-xs font-normal leading-none text-stone-200">
    {children}
  </span>
);

const ManageRolesPage = () => {
  const [enabledModules, setEnabledModules] = useState(
    () => new Set(modules),
  );
  const router = useRouter();

  const toggleModule = (module: string) => {
    setEnabledModules((current) => {
      const next = new Set(current);

      if (next.has(module)) {
        next.delete(module);
      } else {
        next.add(module);
      }

      return next;
    });
  };

  return (
    <main className="w-full text-stone-200">
      <form className="flex flex-col gap-6">
        <label className="block">
          <FieldLabel>Select Role</FieldLabel>
          <div className="relative">
            <select className={selectClass} defaultValue="">
              <option value="" disabled className="bg-stone-900">
                Select
              </option>
              <option className="bg-stone-900">Agent</option>
              <option className="bg-stone-900">Manager</option>
              <option className="bg-stone-900">Admin</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
          </div>
        </label>

        <section className="space-y-2">
          <FieldLabel>Access</FieldLabel>

          <div className="space-y-2">
            {modules.map((module) => {
              const checked = enabledModules.has(module);

              return (
                <label
                  key={module}
                  className="flex h-11 cursor-pointer items-center justify-between rounded-md border border-stone-700 bg-transparent px-4 text-xs font-medium text-stone-100"
                >
                  <span>{module}</span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleModule(module)}
                    className="peer sr-only"
                  />
                  <span className="relative h-3.5 w-7 rounded-full bg-stone-700 transition-colors after:absolute after:left-0.5 after:top-1/2 after:h-2.5 after:w-2.5 after:-translate-y-1/2 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-rose-300 peer-checked:after:translate-x-3.5" />
                </label>
              );
            })}
          </div>
        </section>

        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => router.push("/admin/disstriktonites")}
            className="h-11 rounded-md border border-stone-500 text-sm font-medium text-stone-200 transition-colors hover:border-stone-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-11 rounded-md bg-[#EF476F] text-sm font-medium text-white transition-colors hover:bg-rose-600"
          >
            Confirm
          </button>
        </div>
      </form>
    </main>
  );
};

export default ManageRolesPage;
