"use client";

import { NavArrowDownSolid } from "iconoir-react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useGetActivityById } from "@/hooks/useAdmin";
import { useCancelActivity } from "@/hooks/useAdmin";
import Loader from "@/app/admin/components/ui/Loader";

const detailClass = "space-y-2";
const labelClass = "text-xs font-normal text-stone-400";
const valueClass = "text-sm font-medium text-stone-100";

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className={detailClass}>
    <p className={labelClass}>{label}</p>
    <p className={valueClass}>{value}</p>
  </div>
);

const Panel = ({
  title,
  children,
  columns = 2,
}: {
  title: string;
  children: ReactNode;
  columns?: 2 | 3;
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="mb-4 overflow-hidden rounded-md border border-stone-700 bg-black/10">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between bg-white/10 px-4"
      >
        <h2 className="text-sm font-medium text-stone-100">{title}</h2>

        <NavArrowDownSolid
          className={`h-5 w-5 transition-transform duration-300 ${
            isOpen ? "rotate-0" : "-rotate-180"
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`grid grid-cols-1 gap-x-20 gap-y-6 px-4 py-5 ${
            columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2"
          }`}
        >
          {children}
        </div>
      )}
    </section>
  );
};

const EditBookingPage = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data, isPending } = useGetActivityById({
    slotId: params.id,
    type: "Upcoming",
  });
  const activity = Array.isArray(data) ? (data[0] ?? {}) : (data ?? {});
  const user = activity.userId ?? activity.user ?? {};
  const { mutateAsync: cancelActivity, isPending: isCancelling } =
    useCancelActivity();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const shootDetails = activity.shootDetails ?? activity.details ?? {};
  const formatValue = (value: unknown, fallback = "-") =>
    value === undefined || value === null || value === ""
      ? fallback
      : String(value);
  const formatPhoneNumber = () => {
    const phone = user.phoneNumber ?? user.phone;
    if (phone === undefined || phone === null || phone === "") return "-";

    const countryCode = user.countryCode ? String(user.countryCode) : "";
    const normalizedCountryCode = countryCode
      ? countryCode.startsWith("+")
        ? countryCode
        : `+${countryCode}`
      : "";

    return normalizedCountryCode
      ? `${normalizedCountryCode} ${String(phone)}`
      : String(phone);
  };
  const formatDate = (value: unknown) => {
    if (!value) return "-";
    const date = new Date(String(value));
    return Number.isNaN(date.getTime())
      ? formatValue(value)
      : date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
  };
  const addons = activity.addOnFeatures ?? shootDetails.addOnFeatures ?? [];
  const currencySymbols: Record<string, string> = {
    usd: "$",
    eur: "€",
    gbp: "£",
  };
  const formatAddon = (addon: unknown) => {
    if (typeof addon === "string") return addon;
    if (!addon || typeof addon !== "object") return "-";

    const addonData = addon as {
      featureName?: unknown;
      key?: unknown;
      price?: unknown;
      value?: unknown;
      currency?: unknown;
      prices?: Record<string, unknown>;
    };
    const name = addonData.featureName ?? addonData.key ?? "-";
    const currency = String(addonData.currency ?? "").toLowerCase();
    const price = addonData.price ?? addonData.value;
    const fallbackPrice = currency ? addonData.prices?.[currency] : undefined;
    const selectedPrice = price ?? fallbackPrice;
    const symbol =
      currencySymbols[currency] ??
      (currency ? `${currency.toUpperCase()} ` : "");

    return selectedPrice !== undefined && selectedPrice !== null
      ? `${String(name)} (${symbol}${String(selectedPrice)})`
      : String(name);
  };

  const handleCancelBooking = async () => {
    await cancelActivity({
      slotId: params.id,
      comments: cancelReason.trim(),
    });
    router.push("/admin/shoot-studio");
  };

  if (isPending) return <Loader />;

  return (
    <div className="w-full text-stone-100">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-64"></div>
      </div>

      <Panel title="Model Details">
        <DetailItem label="Model Name" value={formatValue(user.fullName)} />
        <DetailItem label="Gender" value={formatValue(user.gender)} />
        <DetailItem label="Phone Number" value={formatPhoneNumber()} />
        <DetailItem label="Email Address" value={formatValue(user.email)} />
      </Panel>

      <Panel title="Booking Details" columns={3}>
        <DetailItem
          label="Studio"
          value={formatValue(activity.studioId?.name)}
        />
        <DetailItem label="Date" value={formatDate(activity.date)} />
        <DetailItem
          label="Time"
          value={`${formatValue(activity.startTime)} - ${formatValue(activity.endtime)}`}
        />
      </Panel>
      {activity.activityType === "Create a Shoot" ? (
        <Panel title="Shoot Details">
          <DetailItem
            label="Shoot Goal"
            value={formatValue(activity.shootGoals ?? shootDetails.shootGoals)}
          />
          <DetailItem
            label="Shoot Format"
            value={formatValue(
              shootDetails.shootFormat ?? activity.shootFormat,
            )}
          />

          <DetailItem
            label="Shoot Vibes"
            value={formatValue(activity.vibes ?? shootDetails.vibes)}
          />
          <DetailItem
            label="Outfit"
            value={formatValue(
              activity.canBringOutfits ?? shootDetails.canBringOutfits,
            )}
          />

          <div className="md:col-span-2 space-y-2">
            <p className={labelClass}>Requested addons</p>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-stone-100">
              {Array.isArray(addons) && addons.length > 0 ? (
                addons.map((addon: unknown, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-stone-400">•</span>
                    <span>{formatAddon(addon)}</span>
                  </div>
                ))
              ) : (
                <span className="text-stone-400">-</span>
              )}
            </div>
          </div>
        </Panel>
      ) : null}

      <button
        type="button"
        onClick={() => setShowCancelModal(true)}
        disabled={isCancelling}
        className="h-12 w-full rounded-md bg-[#EA3838] text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isCancelling ? "Cancelling..." : "Cancel Booking"}
      </button>

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-lg border border-stone-700 bg-stone-900 p-6">
            <button
              type="button"
              onClick={() => setShowCancelModal(false)}
              disabled={isCancelling}
              aria-label="Close cancellation dialog"
              className="absolute right-4 top-4 text-stone-400 transition-colors hover:text-white disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-4 text-lg font-medium text-stone-100">
              Cancel Booking
            </h2>
            <label className="block">
              <span className="mb-2 block text-sm text-stone-300">
                Cancellation reason
              </span>
              <textarea
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                placeholder="Enter cancellation reason"
                rows={4}
                className="w-full resize-none rounded-md border border-stone-700 bg-transparent px-3 py-3 text-sm text-stone-200 outline-none focus:border-rose-500"
              />
            </label>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="h-11 flex-1 rounded-md border border-stone-700 text-sm font-medium text-stone-200 transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={isCancelling || !cancelReason.trim()}
                className="h-11 flex-1 rounded-md bg-[#EA3838] text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditBookingPage;
