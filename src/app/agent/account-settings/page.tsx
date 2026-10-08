"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X, Pencil, ChevronDown, Clock, Eye, EyeOff } from "lucide-react";
import { Check, LightBulbOn } from "iconoir-react";
import { toast } from "sonner";
import { generateSignedUrlForProfile } from "@/actions";
import Loader from "@/app/admin/components/ui/Loader";
import ButtonSpinner from "@/app/admin/components/ui/ButtonSpinner";
import { resolveMediaUrl } from "@/lib/media";
import {
  AVAILABILITY_DAYS,
  AgentAvailability,
  AvailabilityDay,
  apiErrorMessage,
  useAgentProfile,
  useUpdateAgentAvailability,
  useUpdateAgentProfile,
} from "@/hooks/useAgentAccount";

// Same rules as the API (agent-profile.controller)
const NAME_REGEX = /^[\p{L}][\p{L} .'-]*$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

type FieldId = "fullName" | "email" | "password" | "confirmPassword";

const fields: { id: FieldId; label: string; type: string; placeholder: string }[] = [
  { id: "fullName", label: "Name", type: "text", placeholder: "Name" },
  { id: "email", label: "Email Address", type: "email", placeholder: "Email Address" },
  { id: "password", label: "New Password", type: "password", placeholder: "********" },
  { id: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "********" },
];

// "HH:mm" every 30 minutes, 06:00 - 23:30
const BASE_TIMES = Array.from({ length: 36 }, (_, i) => {
  const minutes = 6 * 60 + i * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// "14:30" -> "02:30 PM"
const formatTime = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  const hour = h % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

const browserTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Amsterdam";
  } catch {
    return "Europe/Amsterdam";
  }
};

const allTimeZones = (): string[] => {
  try {
    return (Intl as any).supportedValuesOf("timeZone");
  } catch {
    return [];
  }
};

type DayHours = { startTime: string; endTime: string };
type Draft = {
  timeZone: string;
  slotMinutes: number;
  activeDays: AvailabilityDay[];
  hours: Record<AvailabilityDay, DayHours>;
  sameHours: boolean;
};

const draftFrom = (availability: AgentAvailability, useBrowserZone: boolean): Draft => {
  const first = availability.days[0] ?? { startTime: "10:00", endTime: "17:00" };
  const hours = Object.fromEntries(
    AVAILABILITY_DAYS.map((day) => {
      const saved = availability.days.find((d) => d.day === day);
      return [day, { startTime: saved?.startTime ?? first.startTime, endTime: saved?.endTime ?? first.endTime }];
    }),
  ) as Record<AvailabilityDay, DayHours>;
  return {
    timeZone: useBrowserZone ? browserTimeZone() : availability.timeZone,
    slotMinutes: availability.slotMinutes || 30,
    activeDays: availability.days.map((d) => d.day),
    hours,
    sameHours: availability.days.every(
      (d) => d.startTime === first.startTime && d.endTime === first.endTime,
    ),
  };
};

// The days to save; with "same hours" every day gets the first active day's hours
const draftDays = (draft: Draft) => {
  const ordered = AVAILABILITY_DAYS.filter((day) => draft.activeDays.includes(day));
  const shared = ordered.length ? draft.hours[ordered[0]] : null;
  return ordered.map((day) => ({ day, ...(draft.sameHours && shared ? shared : draft.hours[day]) }));
};

const TimeSelect = ({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label?: string;
}) => (
  <div className="relative">
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 w-full appearance-none rounded-md border border-[#333] bg-[#1f1c1c] pl-3 pr-16 text-xs text-white outline-none focus:border-rose-400"
    >
      {options.map((t) => (
        <option key={t} value={t}>
          {formatTime(t)}
        </option>
      ))}
    </select>
    <Clock className="pointer-events-none absolute right-8 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
  </div>
);

const AccountSettings = () => {
  const { data: profile, isLoading, isError } = useAgentProfile();
  const updateProfile = useUpdateAgentProfile();
  const updateAvailability = useUpdateAgentAvailability();

  const [form, setForm] = useState<Record<FieldId, string>>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<FieldId, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Set<FieldId>>(new Set());
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [imageFailed, setImageFailed] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [openAvailabilityModal, setOpenAvailabilityModal] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [availabilityError, setAvailabilityError] = useState("");

  // Prefill once the profile loads (and after each save)
  useEffect(() => {
    if (!profile) return;
    setForm({ fullName: profile.fullName ?? "", email: profile.email ?? "", password: "", confirmPassword: "" });
    setImageFailed(false);
  }, [profile]);

  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const validate = (values: Record<FieldId, string>) => {
    const next: Partial<Record<FieldId, string>> = {};
    const name = values.fullName.trim().replace(/\s+/g, " ");
    if (!name) next.fullName = "Name is required";
    else if (name.length < 2 || name.length > 50) next.fullName = "Name must be 2 to 50 characters";
    else if (!NAME_REGEX.test(name))
      next.fullName = "Use letters, spaces, dots, apostrophes and hyphens only";

    const email = values.email.trim();
    if (!email) next.email = "Email is required";
    else if (!EMAIL_REGEX.test(email)) next.email = "Enter a valid email address";

    // Both empty keeps the current password; filling either one requires both
    if (values.password || values.confirmPassword) {
      if (!values.password) next.password = "Enter a new password";
      else if (!PASSWORD_REGEX.test(values.password))
        next.password = "At least 8 characters with a letter and a number";
      if (!values.confirmPassword) next.confirmPassword = "Please confirm your new password";
      else if (values.password !== values.confirmPassword)
        next.confirmPassword = "Passwords do not match";
    }
    return next;
  };

  // Errors show once a field was left (or on submit), then update while typing
  const visibleErrors = (found: Partial<Record<FieldId, string>>, seen: Set<FieldId>) =>
    Object.fromEntries(
      Object.entries(found).filter(([id]) => submitted || seen.has(id as FieldId)),
    ) as Partial<Record<FieldId, string>>;

  const setField = (id: FieldId, value: string) => {
    const next = { ...form, [id]: value };
    setForm(next);
    setErrors(visibleErrors(validate(next), touched));
  };

  const touchField = (id: FieldId) => {
    const seen = new Set(touched).add(id);
    setTouched(seen);
    setErrors(visibleErrors(validate(form), seen));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be 10 MB or smaller");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageFailed(false);
  };

  const uploadImage = async (file: File) => {
    const { signedUrl, key } = await generateSignedUrlForProfile(
      `agent-${profile?._id}-${Date.now()}-${file.name.replace(/\s+/g, "-")}`,
      file.type,
    );
    const upload = await fetch(signedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!upload.ok) throw new Error("Image upload failed");
    return key;
  };

  const saving = uploading || updateProfile.isPending;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile || saving) return;
    setSubmitted(true);
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    // Only what changed
    const payload: Record<string, string> = {};
    const name = form.fullName.trim().replace(/\s+/g, " ");
    const email = form.email.trim().toLowerCase();
    if (name !== profile.fullName) payload.fullName = name;
    if (email !== profile.email) payload.email = email;
    if (form.password) {
      payload.password = form.password;
      payload.confirmPassword = form.confirmPassword;
    }

    try {
      if (imageFile) {
        setUploading(true);
        payload.image = await uploadImage(imageFile);
      }
    } catch {
      toast.error("Couldn't upload the image. Please try again.");
      return;
    } finally {
      setUploading(false);
    }

    if (!Object.keys(payload).length) {
      toast.info("Nothing to update");
      return;
    }

    updateProfile.mutate(payload, {
      onSuccess: () => {
        toast.success("Profile updated");
        setImageFile(null);
        setImagePreview(null);
        setSubmitted(false);
        setTouched(new Set());
        setErrors({});
      },
      onError: (error) => toast.error(apiErrorMessage(error, "Couldn't update your profile")),
    });
  };

  const openModal = () => {
    if (!profile) return;
    // Never saved: start from the defaults in the agent's own time zone
    setDraft(draftFrom(profile.availability, !profile.hasAvailability));
    setAvailabilityError("");
    setOpenAvailabilityModal(true);
  };

  const closeModal = () => {
    if (updateAvailability.isPending) return;
    setOpenAvailabilityModal(false);
  };

  const toggleDraftDay = (day: AvailabilityDay) => {
    setDraft((prev) =>
      prev && {
        ...prev,
        activeDays: prev.activeDays.includes(day)
          ? prev.activeDays.filter((d) => d !== day)
          : [...prev.activeDays, day],
      },
    );
    setAvailabilityError("");
  };

  const setDayHours = (day: AvailabilityDay | "all", key: keyof DayHours, value: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const hours = { ...prev.hours };
      const targets = day === "all" ? AVAILABILITY_DAYS : [day];
      targets.forEach((d) => (hours[d] = { ...hours[d], [key]: value }));
      return { ...prev, hours };
    });
    setAvailabilityError("");
  };

  const handleConfirmAvailability = () => {
    if (!draft) return;
    const days = draftDays(draft);
    const invalid = days.find(
      (d) => toMinutes(d.endTime) - toMinutes(d.startTime) < draft.slotMinutes,
    );
    if (invalid) {
      setAvailabilityError(
        draft.sameHours
          ? "End time must be after the start time"
          : `${invalid.day}: end time must be after the start time`,
      );
      return;
    }

    updateAvailability.mutate(
      { timeZone: draft.timeZone, slotMinutes: draft.slotMinutes, days },
      {
        onSuccess: () => {
          toast.success("Availability saved");
          setOpenAvailabilityModal(false);
        },
        onError: (error) => setAvailabilityError(apiErrorMessage(error, "Couldn't save availability")),
      },
    );
  };

  const timeZones = useMemo(() => {
    const list = allTimeZones();
    return draft && !list.includes(draft.timeZone) ? [draft.timeZone, ...list] : list;
  }, [draft]);

  // Saved values outside the 30-minute list (e.g. set through the API) stay selectable
  const timeOptions = useMemo(() => {
    const extra = draft
      ? AVAILABILITY_DAYS.flatMap((d) => [draft.hours[d].startTime, draft.hours[d].endTime])
      : [];
    return [...new Set([...BASE_TIMES, "23:59", ...extra])].sort();
  }, [draft]);

  const totalWeeklyHours = useMemo(() => {
    if (!draft) return 0;
    const minutes = draftDays(draft).reduce(
      (sum, d) => sum + Math.max(toMinutes(d.endTime) - toMinutes(d.startTime), 0),
      0,
    );
    return Math.round((minutes / 60) * 10) / 10;
  }, [draft]);

  if (isLoading) return <Loader />;
  if (isError || !profile) {
    return <p className="text-sm text-stone-400">Couldn&apos;t load your profile. Please refresh the page.</p>;
  }

  const saved = profile.availability;
  const savedSame = saved.days.every(
    (d) => d.startTime === saved.days[0]?.startTime && d.endTime === saved.days[0]?.endTime,
  );
  // No photo yet (or it fails to load): show the Disstrikt logo as a placeholder
  const photo = imagePreview || resolveMediaUrl(profile.image);
  const showLogo = !photo || imageFailed;
  const activeOrdered = draft ? AVAILABILITY_DAYS.filter((d) => draft.activeDays.includes(d)) : [];

  return (
    <main className="w-full">
      <section className="flex w-full flex-col items-start gap-4">
        <div className="flex w-[300px] max-w-full flex-col gap-3">
          {showLogo ? (
            <div className="flex aspect-[4/4.75] w-full items-center justify-center rounded-lg border border-neutral-800 bg-[#171314] p-6">
              <img src="/assets/Logo.png" alt="No profile picture" className="w-full object-contain" />
            </div>
          ) : (
            <img
              src={photo}
              alt="Profile"
              onError={() => setImageFailed(true)}
              className="aspect-[4/4.75] w-full rounded-lg border border-black/70 object-cover grayscale"
            />
          )}

          <label
            className={`flex h-8 w-full cursor-pointer items-center justify-center rounded-full border border-neutral-600 bg-transparent px-4 text-xs font-normal text-stone-200 transition-colors hover:border-rose-400 hover:text-white ${
              saving ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {imageFile ? "Change Image (save with Confirm)" : "Upload / Change Image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={saving}
              onChange={handleImageUpload}
            />
          </label>
        </div>

        <form
          noValidate
          onSubmit={handleSubmit}
          className="grid w-full grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2"
        >
          {fields.map((field) => (
            <div key={field.id} className="flex flex-col gap-1.5">
              <label htmlFor={field.id} className="text-xs font-light text-stone-200">
                {field.label}
              </label>
              <div className="relative">
                <input
                  id={field.id}
                  name={field.id}
                  type={field.type === "password" && showPassword[field.id] ? "text" : field.type}
                  placeholder={field.placeholder}
                  value={form[field.id]}
                  disabled={saving}
                  autoComplete={field.type === "password" ? "new-password" : undefined}
                  onChange={(e) => setField(field.id, e.target.value)}
                  onBlur={() => touchField(field.id)}
                  aria-invalid={Boolean(errors[field.id])}
                  className={`h-11 w-full rounded-md border bg-transparent px-3 text-xs text-stone-100 outline-none transition-colors placeholder:text-neutral-500 focus:border-rose-400 disabled:opacity-60 ${
                    field.type === "password" ? "pr-10" : ""
                  } ${errors[field.id] ? "border-[#E0414F]" : "border-neutral-700"}`}
                />
                {field.type === "password" && (
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => ({ ...prev, [field.id]: !prev[field.id] }))}
                    aria-label={showPassword[field.id] ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-stone-200"
                  >
                    {showPassword[field.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
              {errors[field.id] && (
                <p className="text-[11px] text-[#F27A8A]">{errors[field.id]}</p>
              )}
            </div>
          ))}
          <p className="text-[11px] text-neutral-500 md:col-span-2">
            Leave the password fields empty to keep your current password. A new password needs at
            least 8 characters with a letter and a number.
          </p>

          <div className="rounded-xl border border-[#2C2C2C] bg-[#171314] md:col-span-2">
            <div className="rounded-t-xl flex items-start justify-between bg-white/10 p-2">
              <h3 className="text-sm font-medium text-white">Availability</h3>

              <button
                type="button"
                onClick={openModal}
                aria-label="Edit availability"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-[#3a3a3a] text-neutral-300 transition-colors hover:border-[#EF476F] hover:text-[#EF476F]"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>

            {!profile.hasAvailability && (
              <p className="mx-4 mt-3 rounded-md border border-[#E09F1F]/40 bg-[#E09F1F]/10 px-3 py-2 text-[11px] text-[#F1C26B]">
                Not set yet. Models can&apos;t book a call with you until you save your availability.
              </p>
            )}

            <div className="p-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-white">Active Working Days</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {AVAILABILITY_DAYS.map((day) => {
                    const active = profile.hasAvailability && saved.days.some((d) => d.day === day);
                    return (
                      <span
                        key={day}
                        className={`rounded-md min-w-15 text-center px-3 py-1.5 text-sm font-medium ${
                          active ? "bg-[#EF476F] text-white" : "bg-white text-[#A93E58]"
                        }`}
                      >
                        {day}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-white">Time</p>
                {!profile.hasAvailability || !saved.days.length ? (
                  <p className="mt-2 text-sm font-medium text-stone-400">
                    {profile.hasAvailability ? "No working days selected" : "-"}
                  </p>
                ) : savedSame ? (
                  <p className="mt-2 text-sm font-medium text-white">
                    {formatTime(saved.days[0].startTime)} - {formatTime(saved.days[0].endTime)}
                  </p>
                ) : (
                  <ul className="mt-2 space-y-1 text-sm font-medium text-white">
                    {saved.days.map((d) => (
                      <li key={d.day}>
                        <span className="inline-block w-10 text-stone-400">{d.day}</span>
                        {formatTime(d.startTime)} - {formatTime(d.endTime)}
                      </li>
                    ))}
                  </ul>
                )}
                {profile.hasAvailability && (
                  <p className="mt-1 text-[11px] text-neutral-500">
                    {saved.timeZone.replace(/_/g, " ")} · {saved.slotMinutes}-minute calls
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#ff3f75] px-4 text-sm font-medium text-white transition-colors hover:bg-[#e83267] disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2"
          >
            {saving && <ButtonSpinner />}
            {uploading ? "Uploading image..." : updateProfile.isPending ? "Saving..." : "Confirm"}
          </button>
        </form>
      </section>

      {openAvailabilityModal && draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="max-h-[90vh] w-[460px] max-w-full overflow-y-auto rounded-2xl border border-[#2D2D2D] bg-[#171314] p-6">
            <div className="mb-1 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-ovo font-normal uppercase tracking-[0.15em] text-white">
                  Set Your Availability
                </h2>
                <p className="mt-1 text-[11px] text-neutral-500">
                  Select your active working days and configure your daily business hours. Models
                  can only book calls in these hours.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="text-neutral-400 transition-colors hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5">
              <p className="text-xs text-neutral-400">Active Working Days</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {AVAILABILITY_DAYS.map((day) => {
                  const active = draft.activeDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDraftDay(day)}
                      className={`rounded-md px-3.5 py-1.5 text-xs transition-colors ${
                        active
                          ? "bg-[#EF476F] text-white"
                          : "bg-white text-[#A93E58] hover:bg-[#EF476F]/20 hover:text-white"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {draft.sameHours ? (
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs text-neutral-400">Start Time</label>
                  <TimeSelect
                    label="Start time"
                    value={draft.hours[activeOrdered[0] ?? "Mon"].startTime}
                    onChange={(v) => setDayHours("all", "startTime", v)}
                    options={timeOptions}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-neutral-400">End Time</label>
                  <TimeSelect
                    label="End time"
                    value={draft.hours[activeOrdered[0] ?? "Mon"].endTime}
                    onChange={(v) => setDayHours("all", "endTime", v)}
                    options={timeOptions}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-2">
                {activeOrdered.length === 0 && (
                  <p className="text-[11px] text-neutral-500">Select at least one day to set its hours.</p>
                )}
                {activeOrdered.map((day) => (
                  <div key={day} className="grid grid-cols-[40px_1fr_1fr] items-center gap-2">
                    <span className="text-xs text-white">{day}</span>
                    <TimeSelect
                      label={`${day} start time`}
                      value={draft.hours[day].startTime}
                      onChange={(v) => setDayHours(day, "startTime", v)}
                      options={timeOptions}
                    />
                    <TimeSelect
                      label={`${day} end time`}
                      value={draft.hours[day].endTime}
                      onChange={(v) => setDayHours(day, "endTime", v)}
                      options={timeOptions}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 flex items-center justify-between py-3">
              <div>
                <p className="text-xs font-medium text-white">Apply Same Hours To All Days</p>
                <p className="mt-0.5 text-[11px] text-neutral-500">
                  Automatically copy these times to all selected days
                </p>
              </div>

              <button
                type="button"
                aria-pressed={draft.sameHours}
                aria-label="Apply same hours to all days"
                onClick={() =>
                  setDraft((prev) => {
                    if (!prev) return prev;
                    if (prev.sameHours) return { ...prev, sameHours: false };
                    // Turning it back on copies the first selected day's hours to every day
                    const first = AVAILABILITY_DAYS.find((d) => prev.activeDays.includes(d)) ?? "Mon";
                    const hours = Object.fromEntries(
                      AVAILABILITY_DAYS.map((d) => [d, { ...prev.hours[first] }]),
                    ) as Draft["hours"];
                    return { ...prev, sameHours: true, hours };
                  })
                }
                className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                  draft.sameHours ? "border-[#EF476F] bg-[#2A1A20]" : "border-[#5A5A5A]"
                }`}
              >
                {draft.sameHours && <Check className="h-3.5 w-3.5 text-[#EF476F]" strokeWidth={3} />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs text-neutral-400">Time Zone</label>
                <div className="relative">
                  <select
                    value={draft.timeZone}
                    onChange={(e) => setDraft((prev) => prev && { ...prev, timeZone: e.target.value })}
                    className="h-11 w-full appearance-none rounded-md border border-[#333] bg-[#1f1c1c] pl-3 pr-8 text-xs text-white outline-none focus:border-rose-400"
                  >
                    {(timeZones.length ? timeZones : [draft.timeZone]).map((zone) => (
                      <option key={zone} value={zone}>
                        {zone.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-neutral-400">Call Length</label>
                <div className="relative">
                  <select
                    value={draft.slotMinutes}
                    onChange={(e) =>
                      setDraft((prev) => prev && { ...prev, slotMinutes: Number(e.target.value) })
                    }
                    className="h-11 w-full appearance-none rounded-md border border-[#333] bg-[#1f1c1c] pl-3 pr-8 text-xs text-white outline-none focus:border-rose-400"
                  >
                    {[15, 30, 45, 60].map((m) => (
                      <option key={m} value={m}>
                        {m} minutes
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg flex items-center gap-2 border border-[#EF476F]/30 bg-pink-50 px-3.5 py-2.5">
              <LightBulbOn className="h-4 w-4 shrink-0 text-[#EF476F]" fill="yellow" />
              <p className="text-[11px] leading-relaxed text-[#A93E58]">
                Your schedule will be set to {totalWeeklyHours} hours per week across{" "}
                {draft.activeDays.length} active working {draft.activeDays.length === 1 ? "day" : "days"}.
                {draft.activeDays.length === 0 && " Models won't be able to book calls."}
              </p>
            </div>

            {availabilityError && (
              <p className="mt-3 text-[11px] text-[#F27A8A]">{availabilityError}</p>
            )}

            <div className="w-full grid grid-cols-3 gap-3 mt-6 justify-end">
              <button
                type="button"
                onClick={closeModal}
                disabled={updateAvailability.isPending}
                className="rounded-lg border col-span-1 border-[#444] px-5 py-2 text-sm text-white transition-colors hover:border-neutral-300 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmAvailability}
                disabled={updateAvailability.isPending}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#EF476F] col-span-2 px-5 py-2 text-sm text-white transition-colors hover:bg-[#e13a63] disabled:opacity-70"
              >
                {updateAvailability.isPending && <ButtonSpinner />}
                {updateAvailability.isPending ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AccountSettings;
