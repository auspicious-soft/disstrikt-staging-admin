"use client";

import React from "react";
import { Clock3, Plus } from "lucide-react";
import { Attachment, Calendar, NavArrowDownSolid } from "iconoir-react";

const fieldBase =
  "h-12 w-full rounded-md border border-stone-700 bg-transparent px-4 text-sm text-stone-200 outline-none transition-colors placeholder:text-stone-500 focus:border-rose-400";

const selectBase =
  "h-12 w-full appearance-none rounded-md border border-stone-700 bg-transparent px-4 pr-11 text-sm text-stone-400 outline-none transition-colors focus:border-rose-400";

const CreateCelebrationCruiseEvent = () => {
  return (
    <main className="w-full text-stone-200">
      <form className="space-y-2">
        <section className="rounded-xl border border-stone-700 p-2 sm:p-2">
          <h2 className="mb-2 text-sm font-medium text-stone-100">
            Event Details
          </h2>

          <div className="grid gap-4 lg:grid-cols-2 mb-3">
            <label className="space-y-1">
              <span className="block text-xs font-normal text-stone-100">
                Name of Event
              </span>
              <input className={fieldBase} placeholder="Title" type="text" />
            </label>

            <label className="space-y-1">
              <span className="block text-xs font-medium text-stone-100">
                Number Of Tickets
              </span>
              <input className={fieldBase} placeholder="500" type="number" />
            </label>
          </div>
          <div className="grid gap-4 lg:grid-cols-3 mb-3">
            <label className="space-y-1">
              <span className="block text-xs font-normal text-stone-100">
                Select Currency
              </span>
              <div className="relative">
                <select className={selectBase} defaultValue="">
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="eur">EUR</option>
                  <option value="usd">USD</option>
                  <option value="gbp">GBP</option>
                </select>
                <NavArrowDownSolid className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
              </div>
            </label>

            <label className="space-y-1">
              <span className="block text-xs font-medium text-stone-100">
                Ticket Price
              </span>
              <input className={fieldBase} placeholder="500" type="number" />
            </label>

            <label className="space-y-1">
              <span className="block text-xs font-medium text-stone-100">
                Upload Image
              </span>
              <div className="relative">
                <input
                  className="sr-only"
                  id="event-image"
                  type="file"
                  accept="image/*"
                />
                <label
                  htmlFor="event-image"
                  className={`${fieldBase} flex cursor-pointer items-center justify-between text-stone-400`}
                >
                  <span>Browse</span>
                  <Attachment className="h-4 w-4 text-stone-400" />
                </label>
              </div>
            </label>
          </div>
          <label className="space-y-1 lg:col-span-2">
            <span className="block text-xs font-normal text-stone-100">
              Description
            </span>
            <textarea
              className="min-h-36 w-full resize-none rounded-md border border-stone-700 bg-transparent px-4 py-4 text-sm text-stone-200 outline-none transition-colors placeholder:text-stone-500 focus:border-rose-400"
              placeholder="Model"
            />
          </label>
        </section>

        <section className="rounded-xl border border-stone-700 p-2 sm:p-2 mb-5">
          <h2 className="mb-2 text-sm font-medium text-stone-100">
            Schedule &amp; Location
          </h2>

          <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr_0.65fr_auto]">
            <label className="space-y-1">
              <span className="block text-xs font-normal text-stone-100">
                Date
              </span>
              <div className="relative">
                <input className={fieldBase} placeholder="Enter Date" />
                <Calendar className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
              </div>
            </label>

            <label className="space-y-1">
              <span className="block text-xs font-normal text-stone-100">
                Start Time
              </span>
              <div className="relative">
                <select className={selectBase} defaultValue="">
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="19:00">07:00 PM</option>
                  <option value="20:00">08:00 PM</option>
                </select>
                <Clock3 className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
              </div>
            </label>

            <label className="space-y-1">
              <span className="block text-xs font-normal text-stone-100">
                End Time
              </span>
              <div className="relative">
                <select className={selectBase} defaultValue="">
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="21:00">09:00 PM</option>
                  <option value="22:00">10:00 PM</option>
                </select>
                <Clock3 className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
              </div>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                className="mb-5 inline-flex h-6 items-center gap-2 whitespace-nowrap text-xs text-stone-300 transition-colors hover:text-white lg:mb-5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add another day
              </button>
            </div>

            <label className="space-y-1 lg:col-span-2">
              <span className="block text-xs font-normal text-stone-100">
                Country
              </span>
              <div className="relative">
                <select className={selectBase} defaultValue="">
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="france">France</option>
                  <option value="spain">Spain</option>
                  <option value="netherlands">Netherlands</option>
                </select>
                <NavArrowDownSolid className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
              </div>
            </label>

            <label className="space-y-1 lg:col-span-2">
              <span className="block text-xs font-normal text-stone-100">
                City
              </span>
              <div className="relative">
                <select className={selectBase} defaultValue="">
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="paris">Paris</option>
                  <option value="barcelona">Barcelona</option>
                  <option value="amsterdam">Amsterdam</option>
                </select>
                <NavArrowDownSolid className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
              </div>
            </label>
          </div>
        </section>

        <div className="grid gap-6 sm:grid-cols-[minmax(180px,310px)_1fr]">
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
            Add Event
          </button>
        </div>
      </form>
    </main>
  );
};

export default CreateCelebrationCruiseEvent;
