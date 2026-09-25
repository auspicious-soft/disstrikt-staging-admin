"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock3, MapPin, X, ChevronDown } from "lucide-react";
import SafeImage from "@/app/components/SafeImage";
import { formatName } from "@/lib/media";
import { usePanel } from "@/app/components/PanelContext";
import { formatDate, formatMoney, formatTime, titleCase } from "./format";

export type MansionBooking = {
  _id: string;
  projectName: string;
  client: { _id: string; fullName: string; image?: string; userMode?: string } | null;
  budget: number;
  currency: string | null;
  location: string | null;
  slot: { dateTime: string }[];
  creativeTeam: string[];
  tfp: boolean;
  travelCover: boolean;
  modelStatus: "pending" | "accepted" | "rejected";
  isRefunded: boolean;
  refundStatus: string | null;
  createdAt: string;
  project: {
    models: {
      _id: string;
      fullName: string;
      image: string | null;
      budget: number;
      modelStatus: string;
    }[];
    modelCount: number;
    total: number;
  };
};

type Props = {
  booking: MansionBooking | null;
  open: boolean;
  onClose: () => void;
};

export default function BookingDetailsModal({ booking, open, onClose }: Props) {
  const { marketPath } = usePanel();
  const [showModels, setShowModels] = useState(false);

  if (!open || !booking) return null;

  const models = booking.project?.models ?? [];
  const times = (booking.slot || []).map((slot) => slot.dateTime).filter(Boolean).sort();
  const budgets = new Set(models.map((model) => model.budget));

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border border-[#383838] bg-[#161212]"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5">
          <h2 className="text-base tracking-widest font-ovo text-white font-normal uppercase">
            Booking Details
          </h2>

          <button onClick={onClose} aria-label="Close">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="px-5 pb-5 space-y-4">
          {/* Models in this project */}
          <div className="rounded-lg border border-[#444] bg-[#2a2626]">
            <button
              type="button"
              onClick={() => setShowModels((value) => !value)}
              className="w-full px-4 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex -space-x-2 shrink-0">
                  {models.slice(0, 3).map((model) => (
                    <SafeImage
                      key={model._id}
                      src={model.image}
                      alt={formatName(model.fullName)}
                      className="w-8 h-8 rounded-full border border-[#222] object-cover bg-stone-700"
                    />
                  ))}
                </div>

                <span className="text-pink-500 text-sm truncate">
                  {models.map((model) => formatName(model.fullName)).join(", ") || "-"}
                </span>
              </div>

              <ChevronDown
                size={16}
                className={`text-gray-400 shrink-0 transition-transform ${showModels ? "rotate-180" : ""}`}
              />
            </button>

            {showModels && (
              <div className="border-t border-[#444] px-4 py-2 space-y-2">
                {models.map((model) => (
                  <div key={model._id} className="flex items-center justify-between text-xs">
                    <span className="text-white">{formatName(model.fullName)}</span>
                    <span className="text-gray-400">
                      {formatMoney(model.budget, booking.currency)} · {titleCase(model.modelStatus)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Client / project */}
          <div>
            <p className="text-pink-500 text-sm font-medium">
              {formatName(booking.client?.fullName) || "Unknown client"}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {booking.projectName}
              {booking.client?.userMode ? ` · ${titleCase(booking.client.userMode)}` : ""}
            </p>

            <div className="mt-3 space-y-2 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin size={13} />
                {booking.location || "-"}
              </div>

              <div className="flex gap-5">
                <span className="flex items-center gap-2 border-0 border-r border-gray-600 pr-3">
                  <CalendarDays size={13} />
                  {times.length
                    ? times.map((time) => formatDate(time)).filter((d, i, all) => all.indexOf(d) === i).join(", ")
                    : "-"}
                </span>

                <span className="flex items-center gap-2">
                  <Clock3 size={13} />
                  {times.length ? times.map((time) => formatTime(time)).join(", ") : "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Travel */}
          <div className="rounded-lg bg-[#2d2929] p-4">
            <div>
              <p className="text-[11px] text-gray-400">Travel Covered</p>
              <p className="text-white text-sm mt-1">{booking.travelCover ? "Yes" : "No"}</p>
            </div>

            <div className="mt-4">
              <p className="text-[11px] text-gray-400">Creative Team</p>
              <p className="text-white text-sm mt-1">
                {booking.creativeTeam?.length ? booking.creativeTeam.join(", ") : "-"}
              </p>
            </div>

            {booking.isRefunded && (
              <div className="mt-4">
                <p className="text-[11px] text-gray-400">Refund</p>
                <p className="text-white text-sm mt-1">
                  {titleCase(booking.refundStatus) || "Refunded"}
                </p>
              </div>
            )}
          </div>

          {/* Investment */}
          <div className="rounded-lg bg-[#2d2929] overflow-hidden">
            <div className="grid grid-cols-2">
              <div className=" p-3">
                <p className="text-[10px] text-gray-400">Investment Per Model</p>
                <p className="text-white mt-1">
                  {budgets.size > 1 ? "Varies" : formatMoney(booking.budget, booking.currency)}
                </p>
              </div>

              <div className="p-3">
                <p className="text-[10px] text-gray-400">Number Of Models</p>
                <p className="text-white mt-1">{booking.project?.modelCount ?? 1}</p>
              </div>
            </div>

            <div className="p-3">
              <div className="flex justify-between rounded-2xl bg-white/10 px-3 py-3">
                <span className="text-gray-400 text-xs">Total</span>
                <span className="text-white font-medium">
                  {formatMoney(booking.project?.total ?? booking.budget, booking.currency)}
                </span>
              </div>
            </div>
          </div>

          <Link
            href={`${marketPath}/${booking._id}`}
            className="block text-center text-xs text-pink-500 underline"
          >
            Open in Model Market
          </Link>
        </div>
      </div>
    </div>
  );
}
