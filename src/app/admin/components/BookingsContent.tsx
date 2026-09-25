"use client";

import { CalendarDays, Clock3, MapPin, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import BookingDetailsModal, {
  type MansionBooking,
} from "../model-mansion/[id]/BookingDetailsModal";
import { Check } from "iconoir-react";
import { useGetModelMansionBookings } from "@/hooks/useModelMansion";
import {
  formatDate,
  formatMoney,
  formatTime,
} from "../model-mansion/[id]/format";
import Pagination from "@/app/components/Pagination";
import { formatName } from "@/lib/media";
import Loader from "./ui/Loader";

// Model's answer to the booking request -> badge
const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending: { label: "Applied", className: "bg-yellow-500 text-white" },
  accepted: { label: "Confirmed", className: "bg-green-500 text-white" },
  rejected: { label: "Rejected", className: "bg-rose-500 text-white" },
};

const bookingDates = (booking: MansionBooking) => {
  const times = (booking.slot || [])
    .map((slot) => slot.dateTime)
    .filter(Boolean)
    .sort();
  if (!times.length) return { date: "-", time: "-" };
  const first = times[0];
  const last = times[times.length - 1];
  return {
    date:
      times.length > 1 && formatDate(first) !== formatDate(last)
        ? `${formatDate(first)} - ${formatDate(last)}`
        : formatDate(first),
    time: formatTime(first),
  };
};

export default function BookingsContent({ modelId }: { modelId: string }) {
  const [selectedBooking, setSelectedBooking] = useState<MansionBooking | null>(null);
  const [showApplied, setShowApplied] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isPending, isError } = useGetModelMansionBookings({
    id: modelId,
    page,
    limit: 10,
    modelStatus: showApplied ? "pending" : "",
  });

  const bookings: MansionBooking[] = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  useEffect(() => {
    setPage(1);
  }, [showApplied]);

  return (
    <>
      <label className="mb-3 flex items-center justify-end gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={showApplied}
          onChange={(e) => setShowApplied(e.target.checked)}
          className="peer sr-only"
        />

        <div className="flex h-4 w-4 items-center justify-center rounded-[2px] border border-[#8A8A8A]">
          <Check
            className={`transition-all ${
              showApplied ? "opacity-100 text-white" : "opacity-0"
            }`}
            strokeWidth={3}
          />
        </div>

        <span className="text-xs text-[#BDBDBD]">Show Applied</span>
      </label>

      {isPending ? (
        <Loader />
      ) : isError ? (
        <p className="py-8 text-center text-xs text-stone-500">
          Couldn&apos;t load bookings.
        </p>
      ) : !bookings.length ? (
        <p className="py-8 text-center text-xs text-stone-500">
          {showApplied ? "No bookings awaiting the model's answer." : "No bookings yet."}
        </p>
      ) : (
        <div className="rounded-xl border border-[#2b2b2b] overflow-hidden bg-transparent">
          {bookings.map((booking, index) => {
            const { date, time } = bookingDates(booking);
            const badge = STATUS_BADGE[booking.modelStatus];

            return (
              <div
                key={booking._id}
                className={`flex flex-col lg:flex-row lg:items-center gap-4 p-4 ${
                  index !== bookings.length - 1 ? "border-b border-[#2b2b2b]" : ""
                }`}
              >
                {/* Left */}
                <div className="w-full lg:w-[210px] lg:shrink-0">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-pink-500 truncate">
                        {formatName(booking.client?.fullName) || "Unknown client"}
                      </h3>
                      <p className="mt-0.5 text-[10px] text-gray-500 truncate">
                        {booking.projectName}
                      </p>
                    </div>

                    <span className="text-sm font-semibold text-pink-500">
                      {formatMoney(booking.budget, booking.currency)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-1 text-xs font-normal text-gray-400">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{booking.location || "-"}</span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1 border-0 border-r border-gray-600 pr-3">
                      <CalendarDays size={12} />
                      {date}
                    </span>

                    <span className="flex items-center font-normal text-xs gap-1">
                      <Clock3 size={12} />
                      {time}
                    </span>
                  </div>
                </div>

                {/* Middle */}
                <div
                  className="w-full flex-1 rounded-md bg-white/10 p-4 cursor-pointer"
                  onClick={() => setSelectedBooking(booking)}
                >
                  <div className="flex justify-between gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-10">
                      <div>
                        <p className="text-[10px] font-normal text-gray-400">
                          Travel Covered
                        </p>

                        <p className="mt-1 text-xs text-white font-medium">
                          {booking.travelCover ? "Yes" : "No"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-normal text-gray-400">
                          Creative Team
                        </p>

                        <p className="mt-1 text-xs text-white font-medium">
                          {booking.creativeTeam?.length
                            ? booking.creativeTeam.join(", ")
                            : "-"}
                        </p>
                      </div>
                    </div>

                    {badge && (
                      <span
                        className={`h-fit rounded-full flex justify-start lg:justify-end px-3 py-1 text-[10px] font-semibold ${badge.className}`}
                      >
                        {badge.label}
                        {booking.isRefunded ? " · Refunded" : ""}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <button
                  onClick={() => setSelectedBooking(booking)}
                  className="self-end lg:self-center text-white hover:text-pink-500 transition"
                  aria-label="Open booking details"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      <BookingDetailsModal
        key={selectedBooking?._id}
        open={!!selectedBooking}
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </>
  );
}
