"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Loader from "../../components/ui/Loader";
import { cancelBooking, getActivityById } from "@/services/admin-services";
import { ADMIN_URLS, BASE_IMG_URL } from "@/constants/apiUrls";
import { X } from "lucide-react";

interface BookingData {
  _id: string;
  attended: string | null;
  studioId: {
    _id: string;
    name: string;
    location: string;
    city: string;
    country: string;
  };
  userId?:
    | {
        _id: string;
        fullName?: string;
        email?: string;
        phone?: string;
        gender?: string;
      }
    | string;
  date: string;
  startTime: string;
  endtime: string;
  time: string;
  slot: string;
  status: string;
  activityType?: string;
  rating?: number;
  comments?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

const BookingDetail: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const bookingId = params?.id as string;
  const bookingType = searchParams.get("type");

  const isCancelled = bookingType === "Cancelled";
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelComment, setCancelComment] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const formatDate = (isoString?: string) => {
    if (!isoString) return "—";
    const date = new Date(isoString);
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "—";
    const [hours, minutes] = timeStr.split(":");
    const hourNum = parseInt(hours, 10);
    const period = hourNum >= 12 ? "PM" : "AM";
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  useEffect(() => {
    if (!bookingId) {
      toast.error("Booking ID not found");
      router.replace("/admin/bookings");
      return;
    }

    const fetchBooking = async () => {
      setLoading(true);
      try {
        const response = await getActivityById(
          `${ADMIN_URLS.GET_ACTIVITY_BY_ID}?slotId=${bookingId}&Type=${bookingType}`,
        );
        if (response?.data?.success && response?.data?.data) {
          setBooking(response.data.data);
        } else {
          throw new Error(response?.message || "Failed to load booking");
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Error loading booking details");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, router, bookingType]);

  const handleCancelBooking = async () => {
    if (!cancelComment.trim()) {
      toast.error("Please add a comment before cancelling");
      return;
    }

    setCancelling(true);
    try {
      const payload = {
        slotId: bookingId,
        comments: cancelComment.trim(),
      };
      const response = await cancelBooking(ADMIN_URLS.CANCEL_ACTIVITY, payload);

      if (response.status === 200 || response?.data?.success) {
        toast.success("Booking cancelled successfully");
        setShowCancelModal(false);
        router.push("/admin/activities");
      } else {
        toast.error(response.message || "Failed to cancel booking");
      }
    } catch (error: any) {
      console.error("Error cancelling booking:", error);
      toast.error(error?.response?.data?.message || "Error cancelling booking");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!booking) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-red-400 text-lg">Booking not found</p>
      </div>
    );
  }

  const user = typeof booking.userId === "object" ? booking.userId : null;
  const hasReviewData =
    booking.attended === "Yes" &&
    (booking.rating ||
      booking.comments ||
      (booking.images && booking.images.length > 0));

  return (
    <>
      <div className="w-full max-w-[982px] mx-auto flex flex-col justify-center items-start gap-10 px-4 py-6">
        <div className="self-stretch flex flex-col justify-start items-start gap-7">
          {/* MODEL DETAILS */}
          <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
            <h2 className="justify-start text-stone-200 text-base font-semibold ">
              Model Details
            </h2>

            <div className="self-stretch p-4 bg-zinc-800 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col justify-start items-start gap-5">
              <div className="self-stretch inline-flex justify-start items-center gap-10">
                <div className="flex-1 flex justify-start items-center gap-1.5">
                  <div className="flex-1 inline-flex flex-col justify-center items-start gap-2.5">
                    <div className="text-stone-200 text-xs font-light ">
                      Full Name
                    </div>
                    <div className="text-stone-200 text-sm font-extrabold ">
                      {user?.fullName || "—"}
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex justify-start items-center gap-1.5">
                  <div className="flex-1 inline-flex flex-col justify-center items-start gap-2.5">
                    <div className="text-stone-200 text-xs font-light ">
                      Email Address
                    </div>
                    <div className="text-stone-200 text-sm font-extrabold  break-all">
                      {user?.email || "—"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="self-stretch inline-flex justify-start items-center gap-10">
                <div className="flex-1 flex justify-start items-center gap-1.5">
                  <div className="flex-1 inline-flex flex-col justify-center items-start gap-2.5">
                    <div className="text-stone-200 text-xs font-light ">
                      Phone Number
                    </div>
                    <div className="text-stone-200 text-sm font-extrabold ">
                      {user?.phone || "—"}
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex justify-start items-center gap-1.5">
                  <div className="flex-1 inline-flex flex-col justify-center items-start gap-2.5">
                    <div className="text-stone-200 text-xs font-light ">
                      Gender
                    </div>
                    <div className="text-stone-200 text-sm font-extrabold ">
                      {user?.gender || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOOKING DETAILS */}
          <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
            <h2 className="justify-start text-stone-200 text-base font-semibold ">
              Booking Details
            </h2>

            <div className="self-stretch p-4 bg-zinc-800 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col justify-start items-start gap-5">
              <div className="self-stretch inline-flex justify-start items-center gap-10">
                <div className="flex-1 flex justify-start items-center gap-1.5">
                  <div className="flex-1 inline-flex flex-col justify-center items-start gap-2.5">
                    <div className="text-stone-200 text-xs font-light ">
                      Activity
                    </div>
                    <div className="text-stone-200 text-sm font-extrabold ">
                      {booking.activityType || "—"}
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex justify-start items-center gap-1.5">
                  <div className="flex-1 inline-flex flex-col justify-center items-start gap-2.5">
                    <div className="text-stone-200 text-xs font-light ">
                      Studio
                    </div>
                    <div className="text-stone-200 text-sm font-extrabold ">
                      {booking.studioId?.name || "—"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="self-stretch inline-flex justify-start items-center gap-10">
                <div className="flex-1 flex justify-start items-center gap-1.5">
                  <div className="flex-1 inline-flex flex-col justify-center items-start gap-2.5">
                    <div className="text-stone-200 text-xs font-light ">
                      Date
                    </div>
                    <div className="text-stone-200 text-sm font-extrabold ">
                      {formatDate(booking.date)}
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex justify-start items-center gap-1.5">
                  <div className="flex-1 inline-flex flex-col justify-center items-start gap-2.5">
                    <div className="text-stone-200 text-xs font-light ">
                      Time
                    </div>
                    <div className="text-stone-200 text-sm font-extrabold ">
                      {formatTime(booking.startTime)} -{" "}
                      {formatTime(booking.endtime)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* REVIEW DETAILS - Only show if activity was reviewed */}
          {hasReviewData && (
            <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
              <h2 className="justify-start text-stone-200 text-base font-semibold ">
                Review Details
              </h2>

              <div className="self-stretch p-4 bg-zinc-800 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col justify-start items-start gap-5">
                {/* Rating */}
                {booking.rating && (
                  <div className="w-full flex flex-col justify-start items-start gap-2.5">
                    <div className="text-stone-200 text-xs font-light ">
                      Rating
                    </div>
                    <div className="text-stone-200 text-sm font-extrabold ">
                      {booking.rating} / 5
                    </div>
                  </div>
                )}

                {/* Comments */}
                {booking.comments && (
                  <div className="w-full flex flex-col justify-start items-start gap-2.5">
                    <div className="text-stone-200 text-xs font-light ">
                      Comments
                    </div>
                    <div className="text-stone-200 text-sm font-normal  leading-relaxed">
                      {booking.comments}
                    </div>
                  </div>
                )}

                {/* Images */}
                {booking.images && booking.images.length > 0 && (
                  <div className="w-full flex flex-col justify-start items-start gap-2.5">
                    <div className="text-stone-200 text-xs font-light ">
                      Images ({booking.images.length})
                    </div>
                    <div className="inline-flex justify-start items-start gap-1.5 flex-wrap">
                      {booking.images.map((img, index) => {
                        const imageUrl =
                          img.startsWith("http://") ||
                          img.startsWith("https://")
                            ? img
                            : `${BASE_IMG_URL || ""}${img}`;

                        return (
                          <div
                            key={index}
                            className="w-32 h-32 rounded-[10px] border border-stone-700 overflow-hidden"
                          >
                            <img
                              src={imageUrl}
                              alt={`Review image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Cancel Button */}
        <div className="self-stretch inline-flex justify-start items-start gap-2.5">
          <button
            onClick={() => setShowCancelModal(true)}
            className={`flex-1 px-5 py-4 bg-rose-500 rounded-[10px] inline-flex flex-col justify-start items-center gap-2.5 hover:bg-rose-600 transition-colors disabled:opacity-50 ${
              booking.attended === "No" ||
              booking.attended === "Yes" ||
              loading ||
              isCancelled
                ? "cursor-not-allowed"
                : "cursor-pointer"
            }`}
            disabled={
              loading ||
              isCancelled ||
              booking.attended === "No" ||
              booking.attended === "Yes"
            }
          >
            <div className="text-center text-white text-sm font-semibold  capitalize">
              {isCancelled ? "Already Cancelled" : "Cancel Booking"}
            </div>
          </button>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-zinc-900 rounded-[10px] w-full max-w-md p-6 relative">
            {/* Close button */}
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
              disabled={cancelling}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <h3 className="text-stone-200 text-xl font-semibold  mb-4">
              Cancel Booking
            </h3>

            {/* Confirmation Text */}
            <p className="text-zinc-400 text-sm font-light  mb-6">
              Are you sure you want to cancel this booking? Please provide a
              reason for cancellation.
            </p>

            {/* Comment Box */}
            <div className="mb-6">
              <label className="text-stone-200 text-xs font-light  block mb-2">
                Cancellation Reason
              </label>
              <textarea
                value={cancelComment}
                onChange={(e) => setCancelComment(e.target.value)}
                placeholder="Enter reason for cancellation..."
                className="w-full px-4 pt-4 pb-14 bg-zinc-800 rounded-[10px] outline-1 outline-offset-[-1px] outline-neutral-700 text-zinc-400 text-sm font-light  resize-none focus:outline-rose-500"
                rows={4}
                disabled={cancelling}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-5 py-3 rounded-[10px] outline outline-zinc-400 text-stone-200 text-sm font-semibold  capitalize hover:bg-zinc-800 transition-colors cursor-pointer"
                disabled={cancelling}
              >
                Go Back
              </button>
              <button
                onClick={handleCancelBooking}
                className="flex-1 px-5 py-3 bg-rose-500 rounded-[10px] text-white text-sm font-semibold  capitalize hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                disabled={cancelling || !cancelComment.trim()}
              >
                {cancelling ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingDetail;
