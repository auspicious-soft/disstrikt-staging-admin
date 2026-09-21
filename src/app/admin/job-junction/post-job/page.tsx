"use client";

import { generateSignedUrlToUploadOn } from "@/actions";
import LocationPickerModal from "@/app/components/LocationPickerModal";
import {
  CreateJobAdmin,
  useGetJobById,
  useUpdateJobAdmin,
} from "@/hooks/useAdmin";
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
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Loader from "../../components/ui/Loader";
import { CITY_MAP } from "@/config/city";

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
  min?: string; // restricts date/time/number inputs (e.g. blocks past dates)
};

type SelectOption = string | { label: string; value: string };

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
};
type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};
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

// Multi-select niche options for MODEL jobs.
const NICHE_OPTIONS = [
  "Fashion",
  "Commercial",
  "Editorial",
  "Fitness",
  "Swimwear",
  "Lingrie",
  "Runway",
  "Influencer",
  "Acting",
  "Content Creation",
  "Hostess",
  "Other",
];

type DateTimeEntry = { date: string; time: string };
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
  min,
}: TextInputProps) => (
  <Field label={label} className={className}>
    <div className="relative">
      <input
        type={type}
        required
        placeholder={placeholder}
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => {
          // Force the native date/time picker modal to open on click,
          // not just when the tiny built-in icon is clicked.
          const target = e.target as HTMLInputElement & {
            showPicker?: () => void;
          };
          if ((type === "date" || type === "time") && target.showPicker) {
            try {
              target.showPicker();
            } catch {
              // showPicker can throw if called too rapidly or is unsupported - ignore
            }
          }
        }}
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
        {options.map((option) => {
          const optionValue =
            typeof option === "string" ? option : option.value;
          const optionLabel =
            typeof option === "string" ? option : option.label;

          return (
            <option
              key={optionValue}
              value={optionValue}
              className="bg-neutral-900 text-sm font-light text-white/20"
            >
              {optionLabel}
            </option>
          );
        })}
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

const Checkbox = ({ label, checked, onChange }: CheckboxProps) => (
  <label className="flex cursor-pointer items-center gap-2 text-xs text-stone-300">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 cursor-pointer accent-rose-500"
    />
    <span>{label}</span>
  </label>
);

const parseNumericValue = (value: string): number => {
  const match = value.match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

const formatEnumValue = (value?: string | null): string => {
  if (!value) return "";
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Returns today's date as YYYY-MM-DD, matching the format <input type="date"> expects.
const getTodayISO = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Returns the current time as HH:MM, matching the format <input type="time"> expects.
const getCurrentTimeHHMM = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const formatDateInputValue = (value?: string | null): string => {
  if (!value) return "";
  const dateOnly = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (dateOnly) return dateOnly;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const PostJobPage = () => {
  const params = useParams<{ id?: string }>();
  const editId = params?.id;
  const isEditMode = Boolean(editId);
  const { mutate: createJob, isPending: isCreating } = CreateJobAdmin();
  const { mutateAsync: updateJob, isPending: isUpdating } = useUpdateJobAdmin();
  const { data: existingJobData, isPending: isLoadingJob } = useGetJobById({
    id: editId,
    status: "ALL",
    page: 1,
    limit: 10,
  });
  const router = useRouter();
  const [userMode, setUserMode] = useState("MODEL");
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [dates, setDates] = useState<DateTimeEntry[]>([{ date: "", time: "" }]);
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("Select");
  const [city, setCity] = useState("Select");
  const [cityOptions, setCityOptions] = useState<string[]>(["Select"]);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [compensationType, setCompensationType] = useState("Paid");
  const [currency, setCurrency] = useState("GBP");
  const [amount, setAmount] = useState("");
  const [minExperience, setMinExperience] = useState("");
  const [maxExperience, setMaxExperience] = useState("");
  const [gender, setGender] = useState("Male");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [minHeight, setMinHeight] = useState("");
  const [maxHeight, setMaxHeight] = useState("");
  const [niches, setNiches] = useState<string[]>([]);
  const [numberOfModels, setNumberOfModels] = useState("");
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [existingReferences, setExistingReferences] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [travelCovered, setTravelCovered] = useState(false);
  const [style, setStyle] = useState({
    fashion: false,
    beauty: false,
    commercial: false,
    editorial: false,
    product: false,
    other: false,
  });
  const [equipmentRequired, setEquipmentRequired] = useState({
    studio: false,
    lighting: false,
    drone: false,
    video: false,
    salon: false,
    makeUpMirror: false,
    highChair: false,
    makeUpProducts: false,
  });
  const [deliverables, setDeliverables] = useState({
    rawImages: false,
    editedImages: false,
    btsContent: false,
    modelsAmount: false,
  });
  const [wardrobeRequired, setWardrobeRequired] = useState(false);
  const [accessoriesRequired, setAccessoriesRequired] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Computed once per render; used as the `min` bound for date/time pickers.
  const todayISO = getTodayISO();

  useEffect(() => {
    const job = existingJobData?.data?.revisedData;
    if (!isEditMode || !job) return;

    const compensationType = Object.entries(COMPENSATION_TYPE_MAP).find(
      ([, value]) => value === job.compensationType,
    )?.[0];
    const startDate = job.startDateTime ? new Date(job.startDateTime) : null;
    const schedule = job.schedule?.length
      ? job.schedule.map((entry: { date?: string; time?: string }) => ({
          date: formatDateInputValue(entry.date),
          time: entry.time || "",
        }))
      : [
          {
            date: startDate ? startDate.toISOString().slice(0, 10) : "",
            time: startDate ? startDate.toTimeString().slice(0, 5) : "",
          },
        ];

    setUserMode(job.userMode || "MODEL");
    setTitle(job.title || job.en?.title || "");
    setDescription(job.description || job.en?.description || "");
    setCompanyName(job.companyName || job.en?.companyName || "");
    setDates(schedule);
    setAddress(job.location || job.en?.location || "");
    setCountry(job.country || "Select");
    setCity(job.city || "Select");
    setCompensationType(compensationType || "Paid");
    setCurrency(String(job.currency || "GBP").toUpperCase());
    setAmount(job.pay == null ? "" : String(job.pay));

    // Experience (falls back to the old "1-2" style string for legacy jobs)
    const legacyExp = String(job.experience ?? "").match(
      /(\d+)\s*(?:-\s*(\d+))?/,
    );
    setMinExperience(
      job.minExperience != null
        ? String(job.minExperience)
        : (legacyExp?.[1] ?? ""),
    );
    setMaxExperience(
      job.maxExperience != null
        ? String(job.maxExperience)
        : (legacyExp?.[2] ?? ""),
    );

    setGender(formatEnumValue(job.gender || job.en?.gender));
    setMinAge(job.minAge == null ? "" : String(job.minAge));
    setMaxAge(job.maxAge == null ? "" : String(job.maxAge));
    setMinHeight(job.minHeightInCm == null ? "" : String(job.minHeightInCm));
    setMaxHeight(job.maxHeightInCm == null ? "" : String(job.maxHeightInCm));

    // Niche (handles both array and legacy single string)
    setNiches(
      Array.isArray(job.niche) ? job.niche : job.niche ? [job.niche] : [],
    );

    // Stylist: number of models
    setNumberOfModels(
      job.numberOfModels == null ? "" : String(job.numberOfModels),
    );
    setDeliverables((prev) => ({
      ...prev,
      modelsAmount: Boolean(job.numberOfModels),
    }));

    setTravelCovered(Boolean(job.travelCovered));
    setAdditionalNotes(job.additionalNotes || "");
    setLat(job.lat ?? null);
    setLng(job.lng ?? null);
    setExistingImage(job.image || null);
    setExistingReferences(job.uploadReference || []);
  }, [existingJobData, isEditMode]);

  const updateDate = (index: number, value: string) => {
    setDates((prev) =>
      prev.map((d, i) => (i === index ? { ...d, date: value } : d)),
    );
  };

  const updateTime = (index: number, value: string) => {
    setDates((prev) =>
      prev.map((d, i) => (i === index ? { ...d, time: value } : d)),
    );
  };

  const addDateRow = () =>
    setDates((prev) => [...prev, { date: "", time: "" }]);

  const removeDateRow = (index: number) => {
    setDates((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );
  };

  const toggleNiche = (value: string, checked: boolean) => {
    setNiches((prev) =>
      checked
        ? [...prev.filter((n) => n !== value), value]
        : prev.filter((n) => n !== value),
    );
  };

  useEffect(() => {
    const cities = CITY_MAP[country] || [];
    const nextOptions = ["Select", ...cities];

    setCityOptions(nextOptions);
    setCity((prevCity) =>
      prevCity && prevCity !== "Select" && cities.includes(prevCity)
        ? prevCity
        : "Select",
    );
  }, [country]);

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
      const resolvedCountryCities = CITY_MAP[resolvedCountry] || [];
      const nextCityOptions = ["Select", ...resolvedCountryCities].concat(
        resolvedCity && !resolvedCountryCities.includes(resolvedCity)
          ? [resolvedCity]
          : [],
      );

      if (resolvedCountry) {
        setCountry(resolvedCountry);
      }

      if (resolvedCity) {
        setCityOptions(nextCityOptions);
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
  const handleReferenceUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length !== files.length) {
      toast.error("Only image files are allowed.");
    }

    const availableSlots =
      10 - existingReferences.length - referenceFiles.length;

    if (availableSlots <= 0) {
      toast.error("You can upload a maximum of 10 reference images.");
      return;
    }

    const filesToAdd = imageFiles.slice(0, availableSlots);

    if (imageFiles.length > availableSlots) {
      toast.error(
        `You can upload only ${availableSlots} more reference image${
          availableSlots > 1 ? "s" : ""
        }.`,
      );
    }

    setReferenceFiles((prev) => [...prev, ...filesToAdd]);

    // Allows selecting the same file again after removing it.
    event.target.value = "";
  };
  const removeReferenceFile = (index: number) => {
    setReferenceFiles((prev) =>
      prev.filter((_, fileIndex) => fileIndex !== index),
    );
  };
  const removeExistingReference = (index: number) => {
    setExistingReferences((prev) =>
      prev.filter((_, referenceIndex) => referenceIndex !== index),
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // Stop the browser's native form submit (full page reload).
    event.preventDefault();

    // Fallback guard: reject any date/time entries that are in the past,
    // in case the browser's native `min` restriction was bypassed or unsupported.
    const now = new Date();
    const hasPastEntry = dates.some((entry) => {
      if (!entry.date) return false;
      const candidate = new Date(`${entry.date}T${entry.time || "00:00"}`);
      return candidate.getTime() < now.getTime();
    });

    if (hasPastEntry) {
      toast.error("Please select a date and time that is not in the past.");
      return;
    }
    if (country === "Select" || city === "Select") {
      toast.error("Please select a country and city.");
      return;
    }

    const minExp = parseNumericValue(minExperience);
    const maxExp = parseNumericValue(maxExperience);

    if (minExp > maxExp) {
      toast.error("Min experience cannot be greater than max experience.");
      return;
    }

    if (userMode === "MODEL" && niches.length === 0) {
      toast.error("Please select at least one niche.");
      return;
    }

    if (
      userMode === "STYLIST" &&
      deliverables.modelsAmount &&
      parseNumericValue(numberOfModels) <= 0
    ) {
      toast.error("Please enter the number of models.");
      return;
    }

    if (existingReferences.length + referenceFiles.length === 0) {
      toast.error("Please keep at least one reference image.");
      return;
    }

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
    let uploadReference: string[] = existingReferences;

    if (referenceFiles.length > 0) {
      try {
        setIsUploading(true);

        uploadReference = [
          ...existingReferences,
          ...(await Promise.all(
            referenceFiles.map((file) => uploadImage(file)),
          )),
        ];
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Reference image upload failed",
        );
        return;
      } finally {
        setIsUploading(false);
      }
    }

    const schedule = dates
      .filter((entry) => entry.date) // drop empty rows
      .map((entry) => ({
        date: entry.date,
        time: entry.time,
      }));

    // Plain JSON object — sent as application/json, never FormData.
    const payload = {
      ...(isEditMode && { id: editId }),
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
      travelCovered,
      city,
      lat,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      lng,
      time: dates[0]?.time || "",
      schedule,
      uploadReference,
      additionalNotes,
      minExperience: minExp,
      maxExperience: maxExp,
      ...(userMode === "MODEL" && {
        niche: niches, // string[]
      }),
      ...(userMode === "PHOTOGRAPHER" && {
        style,
        equipmentRequired: {
          studio: equipmentRequired.studio,
          lighting: equipmentRequired.lighting,
          drone: equipmentRequired.drone,
          video: equipmentRequired.video,
        },
        deliverables: {
          rawImages: deliverables.rawImages,
          editedImages: deliverables.editedImages,
          btsContent: deliverables.btsContent,
        },
      }),

      // STYLIST
      ...(userMode === "STYLIST" && {
        style,
        equipmentRequired: {
          salon: equipmentRequired.salon,
          makeUpMirror: equipmentRequired.makeUpMirror,
          highChair: equipmentRequired.highChair,
          makeUpProducts: equipmentRequired.makeUpProducts,
        },
        deliverables: {
          btsContent: deliverables.btsContent,
          modelsAmount: deliverables.modelsAmount,
        },
        numberOfModels: deliverables.modelsAmount
          ? parseNumericValue(numberOfModels)
          : 0,
        wardrobeRequired,
        accessoriesRequired,
      }),
    };

    const requestOptions = {
      onSuccess: () => {
        toast.success("Job Created Successfully");
        router.replace("/admin/job-junction");
      },
      onError: (err) => {
        if (axios.isAxiosError(err)) {
          toast.error(err.response?.data?.message);
        }
      },
    };

    if (isEditMode) {
      try {
        await updateJob(payload);
        toast.success("Job Updated Successfully");
        router.replace("/admin/job-junction");
      } catch (err) {
        if (axios.isAxiosError(err)) {
          toast.error(err.response?.data?.message);
        }
      }
    } else {
      createJob(payload, requestOptions);
    }
  };

  const isBusy = isCreating || isUpdating || isUploading;

  return (
    <>
      {isEditMode && isLoadingJob ? (
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
                options={[
                  "MODEL",
                  "PHOTOGRAPHER",
                  { label: "BEAUTY PROFESSIONAL", value: "STYLIST" },
                ]}
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
              <div className="mt-3">
                <Checkbox
                  label="Travel Covered"
                  checked={travelCovered}
                  onChange={setTravelCovered}
                />
              </div>
            </Section>

            <Section title="Schedule & Location">
              <div className="space-y-2">
                {dates.map((entry, i) => {
                  const isToday = entry.date === todayISO;
                  const timeMin = isToday ? getCurrentTimeHHMM() : undefined;

                  return (
                    <div
                      key={i}
                      className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto] md:items-end"
                    >
                      <TextInput
                        label={i === 0 ? "Date" : `Date ${i + 1}`}
                        placeholder="Enter Date"
                        type="date"
                        value={entry.date}
                        onChange={(value) => updateDate(i, value)}
                        icon={<Calendar className="h-3.5 w-3.5" />}
                        min={todayISO}
                      />
                      <TextInput
                        label={i === 0 ? "Time" : `Time ${i + 1}`}
                        placeholder="Select"
                        type="time"
                        value={entry.time}
                        onChange={(value) => updateTime(i, value)}
                        icon={<Clock3 className="h-3.5 w-3.5" />}
                        min={timeMin}
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
                  );
                })}

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
                    "United Kingdom",
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
                  options={[
                    "Paid",
                    "Barter",
                    { label: "TFP (Time for Print)", value: "Unpaid" },
                  ]}
                />
                <SelectField
                  label="Currency"
                  value={currency}
                  onChange={setCurrency}
                  options={["GBP", "EUR", "USD"]}
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
              <div
                className={`grid grid-cols-1 gap-2 sm:grid-cols-2 ${
                  userMode === "MODEL" ? "lg:grid-cols-3" : ""
                }`}
              >
                <TextInput
                  label="Min Experience (years)"
                  placeholder="1"
                  type="number"
                  min="0"
                  value={minExperience}
                  onChange={setMinExperience}
                />
                <TextInput
                  label="Max Experience (years)"
                  placeholder="5"
                  type="number"
                  min="0"
                  value={maxExperience}
                  onChange={setMaxExperience}
                />
                {userMode === "MODEL" && (
                  <SelectField
                    label="Gender"
                    value={gender}
                    onChange={setGender}
                    options={["Male", "Female", "Any"]}
                  />
                )}
              </div>
              {userMode === "MODEL" && (
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
                    label="Min Height (cm)"
                    placeholder="160"
                    value={minHeight}
                    onChange={setMinHeight}
                  />
                  <TextInput
                    label="Max height (cm)"
                    placeholder="172"
                    value={maxHeight}
                    onChange={setMaxHeight}
                  />
                </div>
              )}

              {/* MODEL - Niche (multi-select) */}
              {userMode === "MODEL" && (
                <div className="mt-3">
                  <span className={labelClass}>Niche</span>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {NICHE_OPTIONS.map((option) => (
                      <Checkbox
                        key={option}
                        label={option}
                        checked={niches.includes(option)}
                        onChange={(checked) => toggleNiche(option, checked)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* PHOTOGRAPHER - Style */}
              {(userMode === "PHOTOGRAPHER" || userMode === "STYLIST") && (
                <div className="mt-3">
                  <span className={labelClass}>Style</span>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <Checkbox
                      label="Fashion"
                      checked={style.fashion}
                      onChange={(checked) =>
                        setStyle((prev) => ({ ...prev, fashion: checked }))
                      }
                    />

                    <Checkbox
                      label="Beauty"
                      checked={style.beauty}
                      onChange={(checked) =>
                        setStyle((prev) => ({ ...prev, beauty: checked }))
                      }
                    />

                    <Checkbox
                      label="Commercial"
                      checked={style.commercial}
                      onChange={(checked) =>
                        setStyle((prev) => ({ ...prev, commercial: checked }))
                      }
                    />

                    <Checkbox
                      label="Editorial"
                      checked={style.editorial}
                      onChange={(checked) =>
                        setStyle((prev) => ({ ...prev, editorial: checked }))
                      }
                    />

                    <Checkbox
                      label="Product"
                      checked={style.product}
                      onChange={(checked) =>
                        setStyle((prev) => ({ ...prev, product: checked }))
                      }
                    />

                    <Checkbox
                      label="Other"
                      checked={style.other}
                      onChange={(checked) =>
                        setStyle((prev) => ({ ...prev, other: checked }))
                      }
                    />
                  </div>
                </div>
              )}

              {/* PHOTOGRAPHER / STYLIST - Equipment */}
              {(userMode === "PHOTOGRAPHER" || userMode === "STYLIST") && (
                <div className="mt-3">
                  <span className={labelClass}>Equipment Required</span>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {/* Photographer equipment */}
                    {userMode === "PHOTOGRAPHER" && (
                      <>
                        <Checkbox
                          label="Studio"
                          checked={equipmentRequired.studio}
                          onChange={(checked) =>
                            setEquipmentRequired((prev) => ({
                              ...prev,
                              studio: checked,
                            }))
                          }
                        />

                        <Checkbox
                          label="Lighting"
                          checked={equipmentRequired.lighting}
                          onChange={(checked) =>
                            setEquipmentRequired((prev) => ({
                              ...prev,
                              lighting: checked,
                            }))
                          }
                        />

                        <Checkbox
                          label="Drone"
                          checked={equipmentRequired.drone}
                          onChange={(checked) =>
                            setEquipmentRequired((prev) => ({
                              ...prev,
                              drone: checked,
                            }))
                          }
                        />

                        <Checkbox
                          label="Video"
                          checked={equipmentRequired.video}
                          onChange={(checked) =>
                            setEquipmentRequired((prev) => ({
                              ...prev,
                              video: checked,
                            }))
                          }
                        />
                      </>
                    )}

                    {/* Stylist equipment */}
                    {userMode === "STYLIST" && (
                      <>
                        <Checkbox
                          label="Salon"
                          checked={equipmentRequired.salon}
                          onChange={(checked) =>
                            setEquipmentRequired((prev) => ({
                              ...prev,
                              salon: checked,
                            }))
                          }
                        />

                        <Checkbox
                          label="Make Up Mirror"
                          checked={equipmentRequired.makeUpMirror}
                          onChange={(checked) =>
                            setEquipmentRequired((prev) => ({
                              ...prev,
                              makeUpMirror: checked,
                            }))
                          }
                        />

                        <Checkbox
                          label="High Chair"
                          checked={equipmentRequired.highChair}
                          onChange={(checked) =>
                            setEquipmentRequired((prev) => ({
                              ...prev,
                              highChair: checked,
                            }))
                          }
                        />

                        <Checkbox
                          label="Make Up Products"
                          checked={equipmentRequired.makeUpProducts}
                          onChange={(checked) =>
                            setEquipmentRequired((prev) => ({
                              ...prev,
                              makeUpProducts: checked,
                            }))
                          }
                        />
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* PHOTOGRAPHER / STYLIST - Deliverables */}
              {(userMode === "PHOTOGRAPHER" || userMode === "STYLIST") && (
                <div className="mt-3">
                  <span className={labelClass}>Deliverables</span>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {/* Photographer deliverables */}
                    {userMode === "PHOTOGRAPHER" && (
                      <>
                        <Checkbox
                          label="Raw Images"
                          checked={deliverables.rawImages}
                          onChange={(checked) =>
                            setDeliverables((prev) => ({
                              ...prev,
                              rawImages: checked,
                            }))
                          }
                        />

                        <Checkbox
                          label="Edited Images"
                          checked={deliverables.editedImages}
                          onChange={(checked) =>
                            setDeliverables((prev) => ({
                              ...prev,
                              editedImages: checked,
                            }))
                          }
                        />

                        <Checkbox
                          label="BTS Content"
                          checked={deliverables.btsContent}
                          onChange={(checked) =>
                            setDeliverables((prev) => ({
                              ...prev,
                              btsContent: checked,
                            }))
                          }
                        />
                      </>
                    )}

                    {/* Stylist deliverables */}
                    {userMode === "STYLIST" && (
                      <>
                        <Checkbox
                          label="BTS Content"
                          checked={deliverables.btsContent}
                          onChange={(checked) =>
                            setDeliverables((prev) => ({
                              ...prev,
                              btsContent: checked,
                            }))
                          }
                        />

                        <div className="col-span-2 space-y-2 md:col-span-4">
                          <Checkbox
                            label="How many models (amount)"
                            checked={deliverables.modelsAmount}
                            onChange={(checked) => {
                              setDeliverables((prev) => ({
                                ...prev,
                                modelsAmount: checked,
                              }));
                              if (!checked) setNumberOfModels("");
                            }}
                          />

                          {deliverables.modelsAmount && (
                            <div className="max-w-xs">
                              <TextInput
                                label="Number of Models"
                                placeholder="e.g. 5"
                                type="number"
                                min="1"
                                value={numberOfModels}
                                onChange={setNumberOfModels}
                              />
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* STYLIST - Wardrobe / Accessories */}
              {userMode === "STYLIST" && (
                <div className="mt-3">
                  <span className={labelClass}>Requirements</span>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <Checkbox
                      label="Wardrobe Required"
                      checked={wardrobeRequired}
                      onChange={setWardrobeRequired}
                    />

                    <Checkbox
                      label="Accessories Required"
                      checked={accessoriesRequired}
                      onChange={setAccessoriesRequired}
                    />
                  </div>
                </div>
              )}
            </Section>
            <Section title="Upload References">
              <div className="space-y-3">
                <label
                  className={`${controlClass} flex cursor-pointer items-center justify-between`}
                >
                  <span className="text-stone-500">
                    {existingReferences.length + referenceFiles.length > 0
                      ? `${existingReferences.length + referenceFiles.length}/10 images selected`
                      : "Upload reference images"}
                  </span>

                  <Paperclip className="h-3.5 w-3.5 text-stone-500" />

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleReferenceUpload}
                    disabled={
                      existingReferences.length + referenceFiles.length >= 10
                    }
                  />
                </label>

                {existingReferences.length + referenceFiles.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                    {existingReferences.map((reference, index) => (
                      <div
                        key={`existing-reference-${reference}-${index}`}
                        className="group relative overflow-hidden rounded border border-stone-700"
                      >
                        <img
                          src={
                            reference.startsWith("http")
                              ? reference
                              : `${process.env.NEXT_AWS_S3_BASE_URL}${reference}`
                          }
                          alt={`Existing reference ${index + 1}`}
                          className="h-24 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingReference(index)}
                          className="absolute right-1 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/80 bg-rose-500 text-white shadow-md transition-colors hover:bg-rose-600"
                          aria-label={`Remove existing reference ${index + 1}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-1.5 py-1 text-[9px] text-white">
                          Existing image
                        </div>
                      </div>
                    ))}

                    {referenceFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="group relative overflow-hidden rounded border border-stone-700"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Reference ${index + 1}`}
                          className="h-24 w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => removeReferenceFile(index)}
                          className="absolute right-1 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/80 bg-rose-500 text-white shadow-md transition-colors hover:bg-rose-600"
                          aria-label={`Remove reference ${index + 1}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>

                        <div className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-1.5 py-1 text-[9px] text-white">
                          {file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-[10px] text-stone-500">
                  You can upload up to 10 reference images.
                </p>
              </div>
            </Section>
            <Section title="Additional Notes">
              {/* <Field label="Additional Notes"> */}
                <textarea
                  placeholder="Bring your own makeup kit and two casual outfits."
                  rows={5}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="min-h-24 w-full resize-none rounded border border-stone-700 bg-transparent px-3 py-3 text-[10px] font-normal text-stone-200 outline-none transition-colors placeholder:text-stone-500 focus:border-rose-500"
                />
              {/* </Field> */}
            </Section>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[260px_1fr]">
              <button
                type="button"
                onClick={() => router.back()}
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
                  : isCreating || isUpdating
                    ? isEditMode
                      ? "Updating..."
                      : "Posting..."
                    : isEditMode
                      ? "Update Job"
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