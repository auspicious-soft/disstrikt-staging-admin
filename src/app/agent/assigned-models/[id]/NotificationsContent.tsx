"use client";

import { ArrowSeparateVertical, Copy, NavArrowDownSolid } from "iconoir-react";

const NotificationsContent = () => {
  return (
    <div className="w-full rounded-lg border border-stone-800 bg-black/10 p-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium text-stone-100">Notification</h2>

        <button
          type="button"
          className="flex h-8 min-w-44 items-center justify-between rounded-md border border-stone-800 px-3 text-[10px] font-normal text-stone-400"
        >
          Preferred Language
          <ArrowSeparateVertical className="h-3 w-3" />
        </button>
      </div>

      <form className="mt-4 flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-normal text-stone-200">Title</span>
          <input
            type="text"
            placeholder="Rising Star Plan"
            className="h-10 rounded-md border border-stone-700 bg-transparent px-3 text-xs text-stone-200 outline-none transition-colors placeholder:text-stone-500 focus:border-rose-500"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-normal text-stone-200">
            Description
          </span>

          <div className="relative">
            <textarea
              placeholder="Description of the notification goes here"
              className="min-h-28 w-full resize-y rounded-md border border-stone-700 bg-transparent px-3 py-3 pr-12 text-xs text-stone-300 outline-none transition-colors placeholder:text-stone-500 focus:border-rose-500"
            />

            <button
              type="button"
              className="absolute bottom-5 right-2 text-stone-400 transition-colors hover:text-white"
              onClick={() =>
                navigator.clipboard.writeText(
                  "Description of the notification goes here",
                )
              }
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </label>

        <div className="flex justify-end">
          <button
            type="submit"
            className="h-10 rounded-md bg-rose-500 px-5 text-sm font-medium text-white transition-colors hover:bg-rose-600"
          >
            Send Notification
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationsContent;
