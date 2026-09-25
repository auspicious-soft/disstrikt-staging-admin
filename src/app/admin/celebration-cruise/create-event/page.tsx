"use client";

import React, { Suspense, useEffect, useState } from "react";
import { MapPin, Plus, X } from "lucide-react";
import { Attachment, NavArrowDownSolid } from "iconoir-react";
import {
  CreateEvent,
  useGetCelebrationCruiseById,
  useUpdateCelebrationCruise,
} from "@/hooks/useAdmin";
import { generateSignedUrlToUploadOn } from "@/actions";
import LocationPickerModal from "@/app/components/LocationPickerModal";
import { toast } from "sonner";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "../../components/ui/Loader";

const fieldBase =
  "h-12 w-full rounded-md border border-stone-700 bg-transparent px-4 text-sm text-stone-200 outline-none transition-colors placeholder:text-stone-500 focus:border-rose-400";

const selectBase =
  "h-12 w-full appearance-none rounded-md border border-stone-700 bg-transparent px-4 pr-11 text-sm text-stone-400 outline-none transition-colors focus:border-rose-400";
// Countries the backend accepts (same codes as the header's country filter)
const countryOptions = [
  { label: "Netherlands", value: "NL" },
  { label: "Belgium", value: "BE" },
  { label: "Spain", value: "ES" },
  { label: "France", value: "FR" },
  { label: "United Kingdom", value: "UK" },
];
const cityMap: Record<string, string[]> = {
  FR: ["Paris", "Lyon", "Marseille", "Nice", "Toulouse"],
  UK: ["London", "Manchester", "Liverpool", "Birmingham", "Leeds"],
  ES: ["Madrid", "Barcelona", "Valencia", "Seville", "Malaga"],
  NL: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven"],
  BE: ["Brussels", "Antwerp", "Ghent", "Bruges", "Liège"],
};
interface EventFormState {
  title: string;
  description: string;
  totalTickets: string;
  currency: string;
  price: string;
  serviceFee: string;
  termsAndConditions: string;
  includedItems: string[];
  address: string;
  country: string;
  city: string;
  lat: number | null;
  lng: number | null;
}

// Keys the backend and the app use for "What's Included"
const includedOptions = [
  { key: "WELCOME_DRINK", label: "Welcome Drink" },
  { key: "PROFESSIONAL_PICTURES", label: "Professional Pictures" },
  { key: "LIVE_ENTERTAINMENT", label: "Live Entertainment" },
  { key: "EXCLUSIVE_GIVEAWAYS", label: "Exclusive Giveaways" },
  { key: "NETWORKING", label: "Networking" },
  { key: "GAMES_ACTIVITIES", label: "Games & Activities" },
];

const CreateCelebrationCruiseEvent = () => {
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEdit = Boolean(editId);
  const { mutate: createEvent, isPending: isCreating } = CreateEvent();
  const { mutate: updateEvent, isPending: isUpdating } =
    useUpdateCelebrationCruise(editId);
  const { data: existing, isPending: isLoadingExisting } =
    useGetCelebrationCruiseById(editId);
  const isPending = isCreating || isUpdating || (isEdit && isLoadingExisting);
  const router = useRouter();
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [existingBanner, setExistingBanner] = useState<string | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [form, setForm] = useState<EventFormState>({
    title: "",
    description: "",
    totalTickets: "",
    currency: "",
    price: "",
    serviceFee: "",
    termsAndConditions: "",
    includedItems: includedOptions.map((option) => option.key),
    address: "",
    country: "",
    city: "",
    lat: null,
    lng: null,
  });
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  const [image, setImage] = useState<File | null>(null);

  const [schedule, setSchedule] = useState([
    {
      date: "",
      startTime: "",
      endTime: "",
    },
  ]);

  useEffect(() => {
    if (!isEdit || !existing) return;
    const country = normalizeCountryValue(existing.country, existing.country);
    setForm({
      title: existing.title ?? "",
      description: existing.description ?? "",
      totalTickets: String(existing.totalTickets ?? ""),
      currency: existing.currency ?? "",
      price: String(existing.price ?? ""),
      serviceFee: String(existing.serviceFee ?? 0),
      termsAndConditions: existing.termsAndConditions ?? "",
      includedItems: existing.includedItems ?? [],
      address: existing.address ?? "",
      country,
      city: existing.city ?? "",
      lat: existing.lat ?? null,
      lng: existing.lng ?? null,
    });
    const knownCities = cityMap[country] || [];
    setCities(
      existing.city && !knownCities.includes(existing.city)
        ? [...knownCities, existing.city]
        : knownCities,
    );
    setExistingImage(existing.image ?? null);
    setExistingBanner(existing.bannerImage ?? null);
    if (existing.slots?.length) {
      setSchedule(
        existing.slots.map((slot: any) => ({
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      );
    }
  }, [isEdit, existing]);

  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getCurrentTime = () => {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
  };

  const isToday = (date: string) => {
    return date === getTodayDate();
  };

  const normalizeCountryValue = (
    countryCode?: string,
    countryName?: string,
  ) => {
    const normalizedCode = countryCode?.toUpperCase() || "";
    const normalizedName = countryName?.toLowerCase() || "";

    if (
      ["FR", "FRA", "FRANCE"].includes(normalizedCode) ||
      normalizedName.includes("france")
    ) {
      return "FR";
    }
    if (
      ["GB", "UK", "GBR", "UNITED KINGDOM"].includes(normalizedCode) ||
      normalizedName.includes("united kingdom")
    ) {
      return "UK";
    }
    if (
      ["ES", "ESP", "SPAIN"].includes(normalizedCode) ||
      normalizedName.includes("spain")
    ) {
      return "ES";
    }
    if (
      ["NL", "NLD", "NETHERLANDS", "THE NETHERLANDS"].includes(
        normalizedCode,
      ) ||
      normalizedName.includes("netherlands")
    ) {
      return "NL";
    }
    if (
      ["BE", "BEL", "BELGIUM"].includes(normalizedCode) ||
      normalizedName.includes("belgium")
    ) {
      return "BE";
    }

    return "";
  };

  const applyGeocodedLocation = (
    address: string,
    position?: { lat: number; lng: number },
  ) => {
    if (typeof window === "undefined" || !window.google?.maps?.Geocoder) {
      toast.error(
        "Google Maps is not available yet. Please try again shortly.",
      );
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    const request = position ? { location: position } : { address };

    geocoder.geocode(request, (results, status) => {
      if (status !== window.google.maps.GeocoderStatus.OK || !results?.[0]) {
        toast.error(
          "We could not find that address. Please enter it manually or pick a location on the map.",
        );
        return;
      }

      const addressComponents = results[0].address_components || [];
      const countryComponent = addressComponents.find((component) =>
        component.types.includes("country"),
      );
      const localityComponent = addressComponents.find((component) =>
        component.types.includes("locality"),
      );
      const adminAreaComponent = addressComponents.find((component) =>
        component.types.includes("administrative_area_level_1"),
      );
      const cityComponent = localityComponent || adminAreaComponent;
      const countryValue = normalizeCountryValue(
        countryComponent?.short_name,
        countryComponent?.long_name,
      );
      const cityValue = cityComponent?.long_name || "";
      const nextCities = countryValue ? cityMap[countryValue] || [] : [];

      setCities((prevCities) => {
        if (!cityValue) {
          return nextCities;
        }

        return nextCities.includes(cityValue)
          ? nextCities
          : [...nextCities, cityValue];
      });

      setForm((prev) => ({
        ...prev,
        address: results[0].formatted_address || address,
        country: countryValue || prev.country,
        city: cityValue || prev.city,
        lat: position?.lat ?? results[0].geometry.location.lat(),
        lng: position?.lng ?? results[0].geometry.location.lng(),
      }));
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressBlur = () => {
    if (!form.address.trim()) {
      return;
    }

    applyGeocodedLocation(form.address);
  };

  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddressBlur();
    }
  };
  const handleScheduleChange = (
    index: number,
    field: "date" | "startTime" | "endTime",
    value: string,
  ) => {
    const temp = [...schedule];

    if (field === "date") {
      temp[index].date = value;

      // Reset times whenever date changes
      temp[index].startTime = "";
      temp[index].endTime = "";
    }

    if (field === "startTime") {
      temp[index].startTime = value;
    }

    // An end time at or before the start time means the slot ends the next day
    if (field === "endTime") {
      temp[index].endTime = value;
    }

    setSchedule(temp);
  };
  const addDay = () => {
    setSchedule((prev) => [
      ...prev,
      {
        date: "",
        startTime: "",
        endTime: "",
      },
    ]);
  };

  // The first day can never be removed, so at least one slot always remains.
  const removeDay = (index: number) => {
    setSchedule((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );
  };

  const handleLocationSelect = (
    address: string,
    position: { lat: number; lng: number },
  ) => {
    applyGeocodedLocation(address, position);
    setIsLocationPickerOpen(false);
  };

  const uploadImage = async (file: File) => {
    const { signedUrl, key } = await generateSignedUrlToUploadOn(
      file.name,
      file.type,
    );

    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(
        `Image upload failed: ${uploadResponse.status} ${errorText}`,
      );
    }

    return key;
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Checked here, not with `required`: the file input is visually hidden, so
    // the browser would block the submit without showing any message
    if (!image && !existingImage) {
      toast.error("Please upload an event image.");
      return;
    }

    if (!form.includedItems.length) {
      toast.error("Select at least one item under What's Included.");
      return;
    }

    let imageKey: string | null = null;
    let bannerKey: string | null = null;

    try {
      if (image) {
        imageKey = await uploadImage(image);
      }
      if (banner) {
        bannerKey = await uploadImage(banner);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Image upload failed",
      );
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      totalTickets: Number(form.totalTickets),
      currency: form.currency,
      price: Number(form.price),
      serviceFee: Number(form.serviceFee || 0),
      includedItems: form.includedItems,
      termsAndConditions: form.termsAndConditions,
      image: image ? imageKey : existingImage,
      bannerImage: banner ? bannerKey : existingBanner,
      address: form.address,
      country: form.country,
      city: form.city,
      lat: form.lat,
      lng: form.lng,
      schedule: schedule.map((item) => ({
        date: item.date,
        startTime: item.startTime,
        endTime: item.endTime,
      })),
    };

    const onError = (error: unknown) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message);
      }
    };

    if (isEdit) {
      updateEvent(payload, {
        onSuccess: () => {
          toast.success("Event updated successfully");
          router.push(`/admin/celebration-cruise/${editId}`);
        },
        onError,
      });
      return;
    }

    createEvent(payload, {
      onSuccess: () => {
        toast.success("Event created successfully");
        router.push("/admin/celebration-cruise");
        setForm({
          title: "",
          description: "",
          totalTickets: "",
          currency: "",
          price: "",
          serviceFee: "",
          termsAndConditions: "",
          includedItems: includedOptions.map((option) => option.key),
          address: "",
          country: "",
          city: "",
          lat: null,
          lng: null,
        });
      },
      onError,
    });
  };
  const openPicker = (e: React.MouseEvent<HTMLInputElement>) => {
    try {
      e.currentTarget.showPicker();
    } catch {
      // Browser does not support showPicker
    }
  };
  return (
    <>
      {isPending ? (
        <Loader />
      ) : (
        <main className="w-full text-stone-200">
          <form onSubmit={handleSubmit} className="space-y-2">
            <section className="rounded-xl border border-stone-700 p-2 sm:p-2">
              <h2 className="mb-2 text-sm font-medium text-stone-100">
                Event Details
              </h2>

              <div className="grid gap-4 lg:grid-cols-2 mb-3">
                <label className="space-y-1">
                  <span className="block text-xs font-normal text-stone-100">
                    Name of Event
                  </span>
                  <input
                    className={fieldBase}
                    name="title"
                    required
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Title"
                    type="text"
                  />
                </label>

                <label className="space-y-1">
                  <span className="block text-xs font-medium text-stone-100">
                    Number Of Tickets
                  </span>
                  <input
                    className={fieldBase}
                    placeholder="500"
                    required
                    min={0}
                    name="totalTickets"
                    type="number"
                    value={form.totalTickets}
                    onChange={handleChange}
                  />
                </label>
              </div>
              <div className="grid gap-4 lg:grid-cols-3 mb-3">
                <label className="space-y-1">
                  <span className="block text-xs font-normal text-stone-100">
                    Select Currency
                  </span>
                  <div className="relative">
                    <select
                      className={selectBase}
                      required
                      name="currency"
                      value={form.currency}
                      onChange={handleChange}
                    >
                      <option value="" className="bg-stone-700" disabled>
                        Select
                      </option>
                      <option value="eur" className="bg-stone-700">
                        EUR
                      </option>
                      <option value="gbp" className="bg-stone-700">
                        GBP
                      </option>
                    </select>
                    <NavArrowDownSolid className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                  </div>
                </label>

                <label className="space-y-1">
                  <span className="block text-xs font-medium text-stone-100">
                    Ticket Price
                  </span>
                  <input
                    className={fieldBase}
                    placeholder="500"
                    name="price"
                    required
                    min={0}
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                  />
                </label>

                <label className="space-y-1">
                  <span className="block text-xs font-medium text-stone-100">
                    Service Fee (per ticket)
                  </span>
                  <input
                    className={fieldBase}
                    placeholder="0"
                    name="serviceFee"
                    min={0}
                    step="0.01"
                    type="number"
                    value={form.serviceFee}
                    onChange={handleChange}
                  />
                </label>
              </div>
              <div className="grid gap-4 lg:grid-cols-2 mb-3">
                <label className="space-y-1">
                  <span className="block text-xs font-medium text-stone-100">
                    Event Image (list thumbnail)
                  </span>
                  <div className="relative">
                    <input
                      id="event-image"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setImage(e.target.files[0]);
                        }
                      }}
                    />

                    <label
                      htmlFor="event-image"
                      className={`${fieldBase} flex cursor-pointer items-center justify-between`}
                    >
                      <span>
                        {image
                          ? image.name
                          : existingImage
                            ? "Current image (browse to replace)"
                            : "Browse"}
                      </span>
                      <Attachment className="h-4 w-4" />
                    </label>
                  </div>
                </label>

                <label className="space-y-1">
                  <span className="block text-xs font-medium text-stone-100">
                    Banner Image (carousel &amp; event page, optional)
                  </span>
                  <div className="relative">
                    <input
                      id="event-banner"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setBanner(e.target.files[0]);
                        }
                      }}
                    />

                    <label
                      htmlFor="event-banner"
                      className={`${fieldBase} flex cursor-pointer items-center justify-between`}
                    >
                      <span>
                        {banner
                          ? banner.name
                          : existingBanner
                            ? "Current banner (browse to replace)"
                            : "Browse (uses event image if empty)"}
                      </span>
                      <Attachment className="h-4 w-4" />
                    </label>
                  </div>
                </label>
              </div>
              <label className="space-y-1 lg:col-span-2">
                <span className="block text-xs font-normal text-stone-100">
                  Description
                </span>
                <textarea
                  name="description"
                  value={form.description}
                  required
                  onChange={handleChange}
                  className="min-h-36 w-full resize-none rounded-md border border-stone-700 bg-transparent px-4 py-4 text-sm text-stone-200 outline-none transition-colors placeholder:text-stone-500 focus:border-rose-400"
                  placeholder="Model"
                />
              </label>

              <div className="mt-3 space-y-1">
                <span className="block text-xs font-normal text-stone-100">
                  What&apos;s Included
                </span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {includedOptions.map((option) => {
                    const checked = form.includedItems.includes(option.key);
                    return (
                      <label
                        key={option.key}
                        className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-xs transition-colors ${
                          checked
                            ? "border-rose-400 text-stone-100"
                            : "border-stone-700 text-stone-400"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="accent-rose-500"
                          checked={checked}
                          onChange={() =>
                            setForm((prev) => ({
                              ...prev,
                              includedItems: checked
                                ? prev.includedItems.filter((key) => key !== option.key)
                                : [...prev.includedItems, option.key],
                            }))
                          }
                        />
                        {option.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              <label className="mt-3 block space-y-1">
                <span className="block text-xs font-normal text-stone-100">
                  Terms &amp; Conditions (shown to users before payment)
                </span>
                <textarea
                  name="termsAndConditions"
                  value={form.termsAndConditions}
                  required
                  onChange={handleChange}
                  className="min-h-28 w-full resize-y rounded-md border border-stone-700 bg-transparent px-4 py-4 text-sm text-stone-200 outline-none transition-colors placeholder:text-stone-500 focus:border-rose-400"
                  placeholder="Tickets are non-refundable. Please ensure you can attend the event before confirming your booking."
                />
              </label>
            </section>

            <section className="rounded-xl border border-stone-700 p-2 sm:p-2 mb-5">
              <h2 className="mb-2 text-sm font-medium text-stone-100">
                Schedule &amp; Location
              </h2>
              <p className="mb-3 text-[11px] text-stone-400">
                Times are the venue&apos;s local time. An end time before the
                start time ends the next day (e.g. 20:00 - 01:00).
              </p>

              {schedule.map((item, index) => (
                <div
                  key={index}
                  className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr_0.65fr_12rem] mb-4"
                >
                  {/* Date */}
                  <label className="space-y-1">
                    <span className="block text-xs font-normal text-stone-100">
                      {index === 0 ? "Date" : `Date ${index + 1}`}
                    </span>

                    {/* Date */}
                    <input
                      type="date"
                      value={item.date}
                      min={isEdit ? undefined : getTodayDate()}
                      required
                      onClick={openPicker}
                      onChange={(e) =>
                        handleScheduleChange(index, "date", e.target.value)
                      }
                      className={fieldBase}
                    />
                  </label>

                  {/* Start Time */}
                  <label className="space-y-1">
                    <span className="block text-xs font-normal text-stone-100">
                      Start Time
                    </span>

                    {/* Start Time */}
                    <input
                      type="time"
                      value={item.startTime}
                      min={isToday(item.date) ? getCurrentTime() : undefined}
                      required
                      onClick={openPicker}
                      onChange={(e) =>
                        handleScheduleChange(index, "startTime", e.target.value)
                      }
                      className={fieldBase}
                    />
                  </label>

                  {/* End Time */}
                  <label className="space-y-1">
                    <span className="block text-xs font-normal text-stone-100">
                      End Time
                      {item.startTime &&
                        item.endTime &&
                        item.endTime <= item.startTime && (
                          <span className="ml-1 text-rose-400">(next day)</span>
                        )}
                    </span>

                    {/* End Time */}
                    <input
                      type="time"
                      value={item.endTime}
                      required
                      onClick={openPicker}
                      onChange={(e) =>
                        handleScheduleChange(index, "endTime", e.target.value)
                      }
                      className={fieldBase}
                    />
                  </label>

                  {/* Row actions: remove (extra days only) + add another day (last row only) */}
                  <div className="flex items-end gap-2">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeDay(index)}
                        className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-stone-700 text-stone-400 transition-colors hover:border-rose-400 hover:text-white"
                        aria-label={`Remove day ${index + 1}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}

                    {index === schedule.length - 1 && (
                      <button
                        type="button"
                        onClick={addDay}
                        className="mb-3 inline-flex items-center gap-2 whitespace-nowrap text-xs text-stone-300"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add another day
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className="mb-4">
                <label
                  htmlFor="event-address"
                  className="mb-1 block text-xs font-normal text-stone-100"
                >
                  Address
                </label>

                <div className="flex gap-2">
                  <input
                    id="event-address"
                    className={fieldBase}
                    name="address"
                    type="text"
                    value={form.address}
                    onChange={handleChange}
                    onBlur={handleAddressBlur}
                    onKeyDown={handleAddressKeyDown}
                    placeholder="Enter event address"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setIsLocationPickerOpen(true)}
                    className="inline-flex h-12 shrink-0 items-center gap-2 rounded-md border border-stone-700 px-4 text-xs font-medium text-stone-300 transition-colors hover:border-rose-400 hover:text-white"
                  >
                    <MapPin className="h-4 w-4" />
                    Use map
                  </button>
                </div>

                {form.lat !== null && form.lng !== null && (
                  <p className="mt-2 text-[11px] text-stone-400">
                    Coordinates captured: {form.lat.toFixed(4)},{" "}
                    {form.lng.toFixed(4)}
                  </p>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="block text-xs font-normal text-stone-100">
                    Country
                  </span>
                  <div className="relative">
                    <select
                      className={selectBase}
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      required
                    >
                      <option value="" className="bg-stone-700" disabled>
                        Select
                      </option>
                      {countryOptions.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                          className="bg-stone-700"
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <NavArrowDownSolid className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                  </div>
                </label>

                <label className="space-y-1">
                  <span className="block text-xs font-normal text-stone-100">
                    City
                  </span>
                  <input
                    className={fieldBase}
                    name="city"
                    type="text"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    required
                  />
                </label>
              </div>
            </section>

            <div className="grid gap-6 sm:grid-cols-[minmax(180px,310px)_1fr]">
              <button
                type="button"
                onClick={() => router.back()}
                className="h-12 rounded-md border border-stone-200/70 text-sm font-medium text-stone-200 transition-colors hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-12 rounded-md bg-rose-500 text-sm font-medium text-white transition-colors hover:bg-rose-400"
              >
                {isEdit ? "Save Changes" : "Add Event"}
              </button>
            </div>
          </form>

          <LocationPickerModal
            isOpen={isLocationPickerOpen}
            onClose={() => setIsLocationPickerOpen(false)}
            onSelectLocation={handleLocationSelect}
            initialCenter={
              form.lat !== null && form.lng !== null
                ? { lat: form.lat, lng: form.lng }
                : undefined
            }
          />
        </main>
      )}
    </>
  );
};

// useSearchParams needs a Suspense boundary on this static route
const CreateCelebrationCruiseEventPage = () => (
  <Suspense fallback={<Loader />}>
    <CreateCelebrationCruiseEvent />
  </Suspense>
);

export default CreateCelebrationCruiseEventPage;