"use client";

import { generateSignedUrlToUploadOn } from "@/actions";
import LocationPickerModal from "@/app/components/LocationPickerModal";
import { CreateJobAdmin } from "@/hooks/useAdmin";
import axios from "axios";
import { NavArrowDownSolid } from "iconoir-react";
import {
  Calendar,
  ChevronDown,
  Clock3,
  Paperclip,
  Plus,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Loader from "../../components/ui/Loader";

type FieldProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
};

type TextInputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
  icon?: React.ReactNode;
  className?: string;
};

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  className?: string;
};

const sectionClass =
  "rounded-md border border-stone-700 px-2.5 py-2.5 text-sm font-medium";
const labelClass =
  "mb-2 block text-sm  font-medium leading-none text-stone-200";
const controlClass =
  "h-9 w-full rounded border border-stone-700 bg-transparent px-3 text-[10px] font-normal text-stone-200 outline-none transition-colors placeholder:text-stone-500 focus:border-rose-500";

const Field = ({ label, children, className = "" }: FieldProps) => (
  <label className={`block min-w-0 ${className}`}>
    <span className={labelClass}>{label}</span>
    {children}
  </label>
);

const TextInput = ({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  icon,
  className = "",
}: TextInputProps) => (
  <Field label={label} className={className}>
    <div className="relative">
      <input
        type={type}
        required
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${controlClass} ${icon ? "pr-9" : ""}`}
      />
      {icon && (
        <span className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 text-stone-500">
          {icon}
        </span>
      )}
    </div>
  </Field>
);

const SelectField = ({
  label,
  value,
  onChange,
  options,
  className = "",
}: SelectFieldProps) => (
  <Field label={label} className={className}>
    <div className="relative">
      <select
        value={value}
        required
        onChange={(e) => onChange(e.target.value)}
        className={`${controlClass} appearance-none pr-9`}
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
            className="bg-neutral-900 text-sm font-light text-white/20"
          >
            {option}
          </option>
        ))}
      </select>
      <NavArrowDownSolid className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
    </div>
  </Field>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className={sectionClass}>
    <h2 className="mb-4 text-sm font-medium leading-4 text-stone-100">
      {title}
    </h2>
    {children}
  </section>
);

// Lookup maps to translate form-friendly labels into the API's expected enum values.
// Adjust these if the actual backend contract differs.
const COMPENSATION_TYPE_MAP: Record<string, string> = {
  Paid: "PAID",
  Unpaid: "TFP",
  Barter: "FREE_PRODUCT",
};

const COUNTRY_CODE_MAP: Record<string, string> = {
  Netherlands: "NL",
  Belgium: "BE",
  France: "FR",
  Spain: "ES",
  "United Kingdom": "GB",
  UK: "GB",
};

const parseExperienceYears = (label: string): number => {
  const match = label.match(/\d+/);
  return match ? Number(match[0]) : 0;
};

const parseNumericValue = (value: string): number => {
  const match = value.match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

const PostJobPage = () => {
  const { mutate, isPending } = CreateJobAdmin();
  const router = useRouter();
  const [userMode, setUserMode] = useState("MODEL");
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [dates, setDates] = useState<string[]>([""]);
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("Select");
  const [city, setCity] = useState("Select");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedCountry = window.localStorage.getItem("job-post-country");
    if (storedCountry) {
      setCountry(storedCountry);
    }
  }, []);
  const [cityOptions, setCityOptions] = useState<string[]>([
    "Select",
    "Amsterdam",
    "Brussels",
    "Paris",
    "Madrid",
    "London",
  ]);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [compensationType, setCompensationType] = useState("Paid");
  const [currency, setCurrency] = useState("GBP");
  const [amount, setAmount] = useState("");
  const [experience, setExperience] = useState("1-2 Years");
  const [gender, setGender] = useState("Male");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [minHeight, setMinHeight] = useState("");
  const [maxHeight, setMaxHeight] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleCountryChange = (value: string) => {
    setCountry(value);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("job-post-country", value);
    }
  };

  const updateDate = (index: number, value: string) => {
    setDates((prev) => prev.map((d, i) => (i === index ? value : d)));
  };

  const addDateRow = () => setDates((prev) => [...prev, ""]);

  const removeDateRow = (index: number) => {
    setDates((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );
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
      return "France";
    }
    if (
      ["GB", "UK", "GBR", "UNITED KINGDOM"].includes(normalizedCode) ||
      normalizedName.includes("united kingdom")
    ) {
      return "United Kingdom";
    }
    if (
      ["ES", "ESP", "SPAIN"].includes(normalizedCode) ||
      normalizedName.includes("spain")
    ) {
      return "Spain";
    }
    if (
      ["NL", "NLD", "NETHERLANDS", "THE NETHERLANDS"].includes(
        normalizedCode,
      ) ||
      normalizedName.includes("netherlands")
    ) {
      return "Netherlands";
    }
    if (
      ["BE", "BEL", "BELGIUM"].includes(normalizedCode) ||
      normalizedName.includes("belgium")
    ) {
      return "Belgium";
    }

    return "";
  };

  const applyGeocodedLocation = (
    nextAddress: string,
    position?: { lat: number; lng: number },
  ) => {
    if (typeof window === "undefined" || !window.google?.maps?.Geocoder) {
      toast.error(
        "Google Maps is not available yet. Please try again shortly.",
      );
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    const request = position
      ? { location: position }
      : { address: nextAddress };

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
      const resolvedCountry = normalizeCountryValue(
        countryComponent?.short_name,
        countryComponent?.long_name,
      );
      const resolvedCity = cityComponent?.long_name || "";

      if (resolvedCountry) {
        setCountry(resolvedCountry);
      }

      if (resolvedCity) {
        setCityOptions((prev) =>
          prev.includes(resolvedCity) ? prev : [...prev, resolvedCity],
        );
        setCity(resolvedCity);
      }

      setAddress(results[0].formatted_address || nextAddress);
      setLat(position?.lat ?? results[0].geometry.location.lat());
      setLng(position?.lng ?? results[0].geometry.location.lng());
    });
  };

  const handleAddressBlur = () => {
    if (!address.trim()) {
      return;
    }

    applyGeocodedLocation(address);
  };

  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddressBlur();
    }
  };

  const handleLocationSelect = (
    nextAddress: string,
    position: { lat: number; lng: number },
  ) => {
    applyGeocodedLocation(nextAddress, position);
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let imageKey: string | null = null;

    if (imageFile) {
      try {
        setIsUploading(true);
        imageKey = await uploadImage(imageFile);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Image upload failed",
        );
        return;
      } finally {
        setIsUploading(false);
      }
    }

    const schedule = dates.filter(Boolean).map((date) => ({ date }));

    // Plain JSON object — sent as application/json, never FormData.
    const payload = {
      en: {
        title,
        description,
        companyName,
        location: address,
        city,
        country,
        gender: gender.toUpperCase(),
      },
      minAge: parseNumericValue(minAge),
      maxAge: parseNumericValue(maxAge),
      minHeightInCm: parseNumericValue(minHeight),
      maxHeightInCm: parseNumericValue(maxHeight),
      image: imageKey,
      pay: parseNumericValue(amount),
      currency: currency.toLowerCase(),
      countryCode: COUNTRY_CODE_MAP[country],
      userMode,
      compensationType: COMPENSATION_TYPE_MAP[compensationType],
      city,
      lat,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      lng,
      time,
      schedule,
      experience: parseExperienceYears(experience),
    };

    mutate(payload, {
      onSuccess: () => {
        toast.success("Job Created Successfully");
        router.push("/admin/job-junction");
      },
      onError: (err) => {
        if (axios.isAxiosError(err)) {
          toast.error(err.response?.data?.message);
        }
      },
    });
  };

  const isBusy = isPending || isUploading;

  return (
    <>
      {isPending ? (
        <Loader />
      ) : (
        <>
          <form
            className="w-full max-w-none space-y-3 text-stone-100"
            onSubmit={handleSubmit}
          >
            <section className={sectionClass}>
              <SelectField
                label="What Are You Looking For ?"
                value={userMode}
                onChange={setUserMode}
                options={["MODEL", "PHOTOGRAPHER", "DESIGNER", "MUA_STYLIST"]}
              />
            </section>

            <Section title="Job Details">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-[2fr_1.1fr]">
                <TextInput
                  label="Title"
                  placeholder="Title"
                  value={title}
                  onChange={setTitle}
                />

                <Field label="Upload Image">
                  <label
                    className={`${controlClass} flex cursor-pointer items-center justify-between`}
                  >
                    <span className="text-stone-500">
                      {imageFile ? imageFile.name : "Browse"}
                    </span>
                    <Paperclip className="h-3.5 w-3.5 text-stone-500" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        setImageFile(e.target.files?.[0] ?? null)
                      }
                    />
                  </label>
                </Field>
              </div>

              <Field label="Description" className="mt-2">
                <textarea
                  placeholder="Model"
                  rows={5}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-24 w-full resize-none rounded border border-stone-700 bg-transparent px-3 py-3 text-[10px] font-normal text-stone-200 outline-none transition-colors placeholder:text-stone-500 focus:border-rose-500"
                />
              </Field>

              <TextInput
                label="Name of Company"
                placeholder="Company Name"
                value={companyName}
                onChange={setCompanyName}
                className="mt-2"
              />
            </Section>

            <Section title="Schedule & Location">
              <div className="space-y-2">
                {dates.map((date, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto] md:items-end"
                  >
                    <TextInput
                      label={i === 0 ? "Date" : `Date ${i + 1}`}
                      placeholder="Enter Date"
                      type="date"
                      value={date}
                      onChange={(value) => updateDate(i, value)}
                      icon={<Calendar className="h-3.5 w-3.5" />}
                    />
                    {i > 0 && (
                      <button
                        type="button"
                        onClick={() => removeDateRow(i)}
                        className="mb-[2px] inline-flex h-9 items-center justify-center rounded border border-stone-700 px-2 text-stone-400 hover:border-rose-500 hover:text-white"
                        aria-label={`Remove Date ${i + 1}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto] md:items-end">
                <TextInput
                  label="Time"
                  placeholder="Select"
                  type="time"
                  value={time}
                  onChange={setTime}
                  icon={<Clock3 className="h-3.5 w-3.5" />}
                />
                <button
                  type="button"
                  onClick={addDateRow}
                  className="mb-[2px] inline-flex h-9 items-center gap-1 rounded border border-stone-700 px-3 text-[10px] font-medium text-stone-300 hover:border-rose-500 hover:text-white"
                >
                  <Plus className="h-3 w-3" />
                  Add another day
                </button>
              </div>

              <div className="mt-2">
                <label className="mb-2 block text-sm font-medium leading-none text-stone-200">
                  Address
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="w-full">
                    <input
                      type="text"
                      placeholder="Enter Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      onBlur={handleAddressBlur}
                      onKeyDown={handleAddressKeyDown}
                      className={`${controlClass} w-full`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLocationPickerOpen(true)}
                    className="h-9 rounded border border-stone-700 px-3 text-[10px] font-medium text-stone-300 transition-colors hover:border-rose-500 hover:text-white"
                  >
                    Use map
                  </button>
                </div>
                {lat !== null && lng !== null && (
                  <p className="mt-2 text-[11px] text-stone-400">
                    Coordinates captured: {lat.toFixed(4)}, {lng.toFixed(4)}
                  </p>
                )}
              </div>

              <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                <SelectField
                  label="Country"
                  value={country}
                  onChange={setCountry}
                  options={[
                    "Select",
                    "Netherlands",
                    "Belgium",
                    "France",
                    "Spain",
                  ]}
                />
                <SelectField
                  label="City"
                  value={city}
                  onChange={setCity}
                  options={cityOptions}
                />
              </div>
            </Section>

            <Section title="Compensation">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <SelectField
                  label="Type"
                  value={compensationType}
                  onChange={setCompensationType}
                  options={["Paid", "Unpaid", "Barter"]}
                />
                <SelectField
                  label="Currency"
                  value={currency}
                  onChange={setCurrency}
                  options={["GBP", "EUR"]}
                />
                <TextInput
                  label="Amount"
                  placeholder="350"
                  value={amount}
                  onChange={setAmount}
                />
              </div>
            </Section>

            <Section title="Preferences">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <SelectField
                  label="Experience"
                  value={experience}
                  onChange={setExperience}
                  options={[
                    "1 Years",
                    "2 Years",
                    "3 Years",
                    "4 Years",
                    "5 Years",
                    "6 Years",
                  ]}
                />
                <SelectField
                  label="Gender"
                  value={gender}
                  onChange={setGender}
                  options={["Male", "Female", "Any"]}
                />
              </div>

              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <TextInput
                  label="Min age"
                  placeholder="24"
                  value={minAge}
                  onChange={setMinAge}
                />
                <TextInput
                  label="Max Age"
                  placeholder="45"
                  value={maxAge}
                  onChange={setMaxAge}
                />
                <TextInput
                  label="Min Height"
                  placeholder="160cm"
                  value={minHeight}
                  onChange={setMinHeight}
                />
                <TextInput
                  label="Max height"
                  placeholder="172 cm"
                  value={maxHeight}
                  onChange={setMaxHeight}
                />
              </div>
            </Section>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[260px_1fr]">
              <button
                type="button"
                className="h-11 rounded-md border border-stone-500 text-xs font-medium text-stone-200 transition-colors hover:border-stone-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isBusy}
                className="h-11 rounded-md bg-rose-500 text-sm font-medium text-white transition-colors hover:bg-rose-600 disabled:opacity-60"
              >
                {isUploading
                  ? "Uploading..."
                  : isPending
                    ? "Posting..."
                    : "Post Job"}
              </button>
            </div>
          </form>

          <LocationPickerModal
            isOpen={isLocationPickerOpen}
            onClose={() => setIsLocationPickerOpen(false)}
            onSelectLocation={handleLocationSelect}
            initialCenter={
              lat !== null && lng !== null ? { lat, lng } : undefined
            }
          />
        </>
      )}
    </>
  );
};

export default PostJobPage;
