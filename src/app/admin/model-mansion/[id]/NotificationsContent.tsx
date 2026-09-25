"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Copy } from "iconoir-react";
import { useSendModelMansionNotification } from "@/hooks/useModelMansion";
import { LANGUAGE_LABELS } from "./format";

const TITLE_MAX = 100;
const DESCRIPTION_MAX = 1000;

const NotificationsContent = ({
  modelId,
  language,
}: {
  modelId: string;
  language?: string;
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { mutate: send, isPending } = useSendModelMansionNotification(modelId);

  const canSend = !!title.trim() && !!description.trim() && !isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSend) return;

    send(
      { title: title.trim(), description: description.trim() },
      {
        onSuccess: (result) => {
          toast.success(
            result?.hasDeviceToken
              ? "Notification sent"
              : "Notification saved in the app. The model has no device registered for push.",
          );
          setTitle("");
          setDescription("");
        },
        onError: (error) => {
          toast.error(
            axios.isAxiosError(error)
              ? error.response?.data?.message || "Couldn't send the notification"
              : "Couldn't send the notification",
          );
        },
      },
    );
  };

  return (
    <div className="w-full rounded-lg border border-stone-800 bg-black/10 p-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium text-stone-100">Notification</h2>

        <div
          className="flex h-8 min-w-44 items-center justify-between gap-3 rounded-md border border-stone-800 px-3 text-[10px] font-normal text-stone-400"
          title="Write the notification in this language. It is sent exactly as written."
        >
          Preferred Language
          <span className="text-stone-200">
            {LANGUAGE_LABELS[language || "en"] || language}
          </span>
        </div>
      </div>

      <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-normal text-stone-200">Title</span>
          <input
            type="text"
            value={title}
            maxLength={TITLE_MAX}
            onChange={(event) => setTitle(event.target.value)}
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
              value={description}
              maxLength={DESCRIPTION_MAX}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description of the notification goes here"
              className="min-h-28 w-full resize-y rounded-md border border-stone-700 bg-transparent px-3 py-3 pr-12 text-xs text-stone-300 outline-none transition-colors placeholder:text-stone-500 focus:border-rose-500"
            />

            <button
              type="button"
              aria-label="Copy description"
              className="absolute bottom-5 right-2 text-stone-400 transition-colors hover:text-white"
              onClick={() => {
                if (!description) return;
                navigator.clipboard.writeText(description);
                toast.success("Copied");
              }}
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <span className="self-end text-[10px] text-stone-500">
            {description.length}/{DESCRIPTION_MAX}
          </span>
        </label>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!canSend}
            className="h-10 rounded-md bg-rose-500 px-5 text-sm font-medium text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Sending..." : "Send Notification"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationsContent;
