"use client";

import React from "react";
import { CalendarDays, ChevronDown, Trash2 } from "lucide-react";

interface AvailabilityRow {
  date: string;
  activitiesBooked: number;
  startTime: string;
  endTime: string;
}

const availabilityRows: AvailabilityRow[] = [
  { date: "09/09/24", activitiesBooked: 0, startTime: "09:00", endTime: "16:00" },
  { date: "10/09/24", activitiesBooked: 0, startTime: "09:00", endTime: "16:00" },
  { date: "11/09/24", activitiesBooked: 0, startTime: "09:00", endTime: "16:00" },
  { date: "12/09/24", activitiesBooked: 0, startTime: "09:00", endTime: "16:00" },
  { date: "13/09/24", activitiesBooked: 0, startTime: "09:00", endTime: "16:00" },
];

const inputClass =
  "h-12 w-full rounded-md border border-stone-700 bg-transparent px-3 text-sm text-stone-200 outline-none placeholder:text-stone-500 focus:border-rose-400";

const timeInputClass =
  "h-10 w-full rounded-md border border-stone-700 bg-transparent px-3 text-xs text-stone-200 outline-none placeholder:text-stone-500 focus:border-rose-400";

const selectClass =
  "h-10 w-full appearance-none rounded-md border border-stone-700 bg-transparent px-3 pr-9 text-xs text-stone-200 outline-none focus:border-rose-400";

const StudioDetails = () => {
  return (
    <main className="w-full text-stone-200">
      <form className="space-y-6">
        <section className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-stone-100">
              Studio Name
            </span>
            <input className={inputClass} placeholder="Name" type="text" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-stone-100">
              Location
            </span>
            <input className={inputClass} placeholder="Name" type="text" />
          </label>
        </section>

        <section className="overflow-hidden rounded-lg border border-stone-700">
          <div className="bg-white/15 px-4 py-3">
            <h2 className="text-xs font-medium text-stone-100">Availability</h2>
          </div>

          <div className="space-y-4 p-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-stone-100">
                Select Date
              </span>
              <div className="relative">
                <input className={inputClass} placeholder="Date" type="text" />
                <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              </div>
            </label>

            <div className="overflow-x-auto rounded-lg border border-stone-700">
              <table className="w-full min-w-[880px] table-fixed border-collapse">
                <thead>
                  <tr className="h-11 text-left text-xs font-medium text-stone-100">
                    <th className="w-[22%] px-6">Date</th>
                    <th className="w-[22%] px-6">Activities Booked</th>
                    <th className="w-[16%] px-2">Start Time</th>
                    <th className="w-[16%] px-2">End Time</th>
                    <th className="w-[17%] px-2">Interval in hours</th>
                    <th className="w-[7%] px-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {availabilityRows.map((row) => (
                    <tr key={row.date} className="h-14 text-xs text-stone-200">
                      <td className="px-6">{row.date}</td>
                      <td className="px-6">{row.activitiesBooked}</td>
                      <td className="px-2">
                        <input
                          className={timeInputClass}
                          defaultValue={row.startTime}
                          aria-label={`Start time ${row.date}`}
                        />
                      </td>
                      <td className="px-2">
                        <input
                          className={timeInputClass}
                          defaultValue={row.endTime}
                          aria-label={`End time ${row.date}`}
                        />
                      </td>
                      <td className="px-2">
                        <div className="relative">
                          <select className={selectClass} defaultValue="">
                            <option value="" disabled>
                              Select
                            </option>
                            <option value="1">1 hour</option>
                            <option value="2">2 hours</option>
                            <option value="3">3 hours</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                        </div>
                      </td>
                      <td className="px-2 text-center">
                        <button
                          type="button"
                          aria-label={`Remove availability ${row.date}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-rose-500 text-white transition-colors hover:bg-rose-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-[minmax(160px,315px)_1fr]">
          <button
            type="button"
            className="h-12 rounded-md border border-stone-200/70 text-sm font-medium text-stone-200 transition-colors hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-12 rounded-md bg-rose-500 text-sm font-medium text-white transition-colors hover:bg-rose-400"
          >
            Save
          </button>
        </div>
      </form>
    </main>
  );
};

export default StudioDetails;
