"use client";

import {
  CalendarDays,
  Clock3,
  MapPin,
  X,
  ChevronDown,
} from "lucide-react";

type Booking = {
  agency: string;
  price: string;
  location: string;
  date: string;
  time: string;
  travelCovered: string;
  creativeTeam: string;
};

type Props = {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
};

export default function BookingDetailsModal({
  booking,
  open,
  onClose,
}: Props) {
  if (!open || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-[#383838] bg-[#161212]">
        {/* Header */}
        <div className="flex items-center justify-between p-5">
          <h2 className="text-base tracking-widest font-ovo text-white font-normal uppercase">
            Booking Details
          </h2>

          <button onClick={onClose}>
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="px-5 pb-5 space-y-4">
          {/* Models */}
          <button className="w-full rounded-lg border border-[#444] bg-[#2a2626] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <img
                  src="https://i.pravatar.cc/40?img=11"
                  className="w-8 h-8 rounded-full border border-[#222]"
                />
                <img
                  src="https://i.pravatar.cc/40?img=12"
                  className="w-8 h-8 rounded-full border border-[#222]"
                />
                <img
                  src="https://i.pravatar.cc/40?img=13"
                  className="w-8 h-8 rounded-full border border-[#222]"
                />
              </div>

              <span className="text-pink-500 text-sm">
                Naomi, Aaliyah, Fatima
              </span>
            </div>

            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {/* Agency */}
          <div>
            <p className="text-pink-500 text-sm font-medium">
              {booking.agency}
            </p>

            <div className="mt-3 space-y-2 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin size={13} />
                {booking.location}
              </div>

              <div className="flex gap-5">
                <span className="flex items-center gap-2 border-0 border-r border-gray-600 pr-3">
                  <CalendarDays size={13} />
                  {booking.date}
                </span>

                <span className="flex items-center gap-2">
                  <Clock3 size={13} />
                  {booking.time}
                </span>
              </div>
            </div>
          </div>

          {/* Travel */}
          <div className="rounded-lg bg-[#2d2929] p-4">
            <div>
              <p className="text-[11px] text-gray-400">
                Travel Covered
              </p>

              <p className="text-white text-sm mt-1">
                {booking.travelCovered}
              </p>
            </div>

            <div className="mt-4">
              <p className="text-[11px] text-gray-400">
                Creative Team
              </p>

              <p className="text-white text-sm mt-1">
                {booking.creativeTeam}
              </p>
            </div>
          </div>

          {/* Investment */}
          <div className="rounded-lg bg-[#2d2929] overflow-hidden">
            <div className="grid grid-cols-2">
              <div className=" p-3">
                <p className="text-[10px] text-gray-400">
                  Investment Per Model
                </p>

                <p className="text-white mt-1">{booking.price}</p>
              </div>

              <div className="p-3">
                <p className="text-[10px] text-gray-400">
                  Number Of Models
                </p>

                <p className="text-white mt-1">3</p>
              </div>
            </div>

            <div className="p-3">
            <div className="flex justify-between rounded-2xl bg-white/10 px-3 py-3">
              <span className="text-gray-400 text-xs">Total</span>

              <span className="text-white font-medium">£1500</span>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}