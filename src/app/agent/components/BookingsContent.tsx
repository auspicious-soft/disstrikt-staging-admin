"use client";

import { CalendarDays, Clock3, MapPin, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Check } from "iconoir-react";
import BookingDetailsModal from "../assigned-models/[id]/BookingDetailsModal";

type Booking = {
  id: number;
  agency: string;
  price: string;
  location: string;
  date: string;
  time: string;
  travelCovered: string;
  creativeTeam: string;
  status?: "Applied" | "Confirmed";
};

const bookings: Booking[] = [
  {
    id: 1,
    agency: "Agency Name",
    price: "£500",
    location: "Paris, France",
    date: "12 Jun - 14 Jun",
    time: "10:00 AM",
    travelCovered: "Yes",
    creativeTeam: "Photographer, Makeup Artist, Stylist",
    status: "Applied",
  },
  {
    id: 2,
    agency: "Agency Name",
    price: "£500",
    location: "Paris, France",
    date: "12 Jun - 14 Jun",
    time: "10:00 AM",
    travelCovered: "Yes",
    creativeTeam: "Photographer, Makeup Artist, Stylist",
    status: "Confirmed",
  },
  {
    id: 3,
    agency: "Agency Name",
    price: "£500",
    location: "Paris, France",
    date: "12 Jun - 14 Jun",
    time: "10:00 AM",
    travelCovered: "Yes",
    creativeTeam: "Photographer, Makeup Artist, Stylist",
  },
  {
    id: 4,
    agency: "Agency Name",
    price: "£500",
    location: "Paris, France",
    date: "12 Jun - 14 Jun",
    time: "10:00 AM",
    travelCovered: "Yes",
    creativeTeam: "Photographer, Makeup Artist, Stylist",
  },
];

export default function BookingsContent() {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [showApplied, setShowApplied] = useState(false);

  const handleOpen = (booking: Booking) => {
    setSelectedBooking(booking);
    setOpenModal(true);
  };
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

  <span className="text-xs text-[#BDBDBD]">
    Show Applied
  </span>
</label>
    <div className="rounded-xl border border-[#2b2b2b] overflow-hidden bg-transparent">
      {bookings.map((booking, index) => (
        <div
          key={booking.id}
          className={`flex flex-col lg:flex-row lg:items-center gap-4 p-4 ${
            index !== bookings.length - 1 ? "border-b border-[#2b2b2b]" : ""
          }`}
        >
          {/* Left */}
          <div className="w-full lg:w-[210px] lg:shrink-0">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <h3 className="text-sm font-medium text-pink-500">
                {booking.agency}
              </h3>

              <span className="text-sm font-semibold text-pink-500">
                {booking.price}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-1 text-xs font-normal text-gray-400">
              <MapPin size={12} />
              {booking.location}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1 border-0 border-r border-gray-600 pr-3">
                <CalendarDays size={12} />
                {booking.date}
              </span>

              <span className="flex items-center font-normal text-xs gap-1">
                <Clock3 size={12} />
                {booking.time}
              </span>
            </div>
          </div>

          {/* Middle */}
          <div className="w-full flex-1 rounded-md bg-white/10 p-4">
            <div className="flex justify-between">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-10">
                <div>
                  <p className="text-[10px] font-normal text-gray-400">Travel Covered</p>

                  <p className="mt-1 text-xs text-white font-medium">
                    {booking.travelCovered}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-normal text-gray-400">Creative Team</p>

                  <p className="mt-1 text-xs text-white font-medium">
                    {booking.creativeTeam}
                  </p>
                </div>
              </div>

              {booking.status && (
                <span
                  className={`h-fit rounded-full flex justify-start lg:justify-end px-3 py-1 text-[10px] font-semibold ${
                    booking.status === "Applied"
                      ? "bg-yellow-500 text-white"
                      : "bg-green-500 text-white"
                  }`}
                >
                  {booking.status}
                </span>
              )}
            </div>
          </div>

          {/* Arrow */}
          <button
  onClick={() => handleOpen(booking)}
  className="self-end lg:self-center text-white hover:text-pink-500 transition"
>
            <ChevronRight size={18} />
          </button>
        </div>
      ))}
    </div>
    <BookingDetailsModal
  open={openModal}
  booking={selectedBooking}
  onClose={() => setOpenModal(false)}
/>
</>
  );
}
