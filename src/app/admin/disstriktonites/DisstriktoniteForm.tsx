"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { NavArrowDownSolid } from "iconoir-react";
import { Country } from "country-state-city";
import { useGetEmployeesRoles } from "@/hooks/useAdmin";

/**
 * Add / Edit Disstriktonite form. The backend checks the same rules
 * (src/modules/employee/employee.controller.ts, validateEmployee).
 */

export type DisstriktoniteFormValues = {
  fullName: string;
  email: string;
  password: string;
  language: string[];
  countryCode: string;
  phone: string;
  roleId: string;
};

type Errors = Partial<Record<keyof DisstriktoniteFormValues, string>>;

export const EMPTY_DISSTRIKTONITE: DisstriktoniteFormValues = {
  fullName: "",
  email: "",
  password: "",
  language: [],
  countryCode: "+91",
  phone: "",
  roleId: "",
};

const languageOptions = [
  { label: "English", value: "en" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "Dutch", value: "nl" },
];

const countryCodeOptions = Country.getAllCountries()
  .filter((country) => country.phonecode)
  .map((country) => ({
    value: `+${country.phonecode.replace(/^\+/, "")}`,
    label: `${country.name} (+${country.phonecode.replace(/^\+/, "")})`,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const NAME_REGEX = /^[\p{L}][\p{L} .'-]*$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

// Password is required when adding; when editing, empty means unchanged
const validate = (form: DisstriktoniteFormValues, isEdit: boolean): Errors => {
  const errors: Errors = {};
  const name = form.fullName.trim();
  if (!name) errors.fullName = "Name is required";
  else if (name.length < 2 || name.length > 50)
    errors.fullName = "Name must be 2 to 50 characters";
  else if (!NAME_REGEX.test(name))
    errors.fullName = "Only letters, spaces, dots, apostrophes and hyphens";

  if (!form.language.length) errors.language = "Select at least one language";

  if (!form.countryCode) errors.countryCode = "Select a country code";

  if (!form.phone) errors.phone = "Phone number is required";
  else if (!/^\d{6,15}$/.test(form.phone))
    errors.phone = "Phone number must be 6 to 15 digits";

  const email = form.email.trim();
  if (!email) errors.email = "Email is required";
  else if (!EMAIL_REGEX.test(email)) errors.email = "Enter a valid email address";

  if (!isEdit && !form.password) errors.password = "Password is required";
  else if (form.password && !PASSWORD_REGEX.test(form.password))
    errors.password = "At least 8 characters, with a letter and a number";

  if (!form.roleId) errors.roleId = "Select a role";

  return errors;
};

const inputBase =
  "h-12 w-full rounded-md border bg-transparent px-4 text-xs font-normal text-stone-200 outline-none transition-colors placeholder:text-stone-500 focus:border-rose-400 disabled:opacity-60";

const inputClass = (error?: string) =>
  `${inputBase} ${error ? "border-rose-500" : "border-stone-700"}`;

const selectClass = (error?: string) => `${inputClass(error)} appearance-none pr-9`;

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="mb-1.5 block text-xs font-normal leading-none text-stone-200">
    {children}
  </span>
);

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="mt-1 text-[11px] text-rose-400">{message}</p> : null;

const LanguageSelect = ({
  selected,
  onChange,
  error,
  disabled,
}: {
  selected: string[];
  onChange: (selected: string[]) => void;
  error?: string;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on an outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggleOption = (value: string) =>
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    );

  return (
    <div ref={rootRef}>
      <FieldLabel>Language</FieldLabel>
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          className={`flex min-h-12 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-4 text-left text-xs text-stone-200 outline-none transition-colors focus:border-rose-400 disabled:opacity-60 ${
            error ? "border-rose-500" : "border-stone-700"
          }`}
        >
          <span className="flex min-w-0 flex-1 flex-wrap gap-1 py-2">
            {selected.length > 0 ? (
              selected.map((item) => (
                <span
                  key={item}
                  className="inline-flex max-w-full items-center gap-1 rounded bg-stone-800 px-2 py-1 text-[11px] leading-none text-stone-100"
                >
                  {languageOptions.find((option) => option.value === item)?.label ?? item}
                </span>
              ))
            ) : (
              <span className="text-stone-500">Select languages</span>
            )}
          </span>
          <NavArrowDownSolid className="pointer-events-none h-3.5 w-3.5 text-stone-500" />
        </button>

        {open && (
          <div className="absolute left-0 right-0 z-10 mt-1 max-h-52 overflow-y-auto rounded-md border border-stone-700 bg-stone-900 py-1 shadow-lg">
            {languageOptions.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleOption(option.value)}
                  className="flex w-full items-center justify-between px-4 py-2 text-left text-xs text-stone-200 transition-colors hover:bg-white/10"
                >
                  <span>{option.label}</span>
                  <span className="text-rose-400">{isSelected ? "✓" : ""}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <FieldError message={error} />
    </div>
  );
};

const DisstriktoniteForm = ({
  initialValues = EMPTY_DISSTRIKTONITE,
  isEdit = false,
  isPending,
  onSubmit,
}: {
  initialValues?: DisstriktoniteFormValues;
  isEdit?: boolean;
  isPending: boolean;
  onSubmit: (values: DisstriktoniteFormValues) => Promise<unknown>;
}) => {
  const router = useRouter();
  const { data: rolesData, isLoading: rolesLoading } = useGetEmployeesRoles();

  const roleOptions: any[] = Array.isArray(rolesData)
    ? rolesData
    : Array.isArray((rolesData as any)?.data)
      ? (rolesData as any).data
      : [];

  const [form, setForm] = useState<DisstriktoniteFormValues>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  // After the first submit, re-check as the user types
  const update = <K extends keyof DisstriktoniteFormValues>(
    key: K,
    value: DisstriktoniteFormValues[K],
  ) => {
    const next = { ...form, [key]: value };
    setForm(next);
    if (submitted) setErrors(validate(next, isEdit));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;
    setSubmitted(true);
    const found = validate(form, isEdit);
    setErrors(found);
    if (Object.keys(found).length) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    try {
      await onSubmit({
        ...form,
        fullName: form.fullName.trim().replace(/\s+/g, " "),
        email: form.email.trim().toLowerCase(),
      });
      toast.success(isEdit ? "Disstriktonite updated" : "Disstriktonite added");
      router.push("/admin/disstriktonites");
    } catch (error) {
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Something went wrong"
          : "Something went wrong",
      );
    }
  };

  return (
    <main className="w-full text-stone-200">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <fieldset disabled={isPending} className="contents">
          <section className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <FieldLabel>Name</FieldLabel>
              <input
                className={inputClass(errors.fullName)}
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                placeholder="Name"
                type="text"
                maxLength={50}
                autoComplete="off"
              />
              <FieldError message={errors.fullName} />
            </label>

            <LanguageSelect
              selected={form.language}
              onChange={(selected) => update("language", selected)}
              error={errors.language}
              disabled={isPending}
            />

            <label className="block">
              <FieldLabel>Select Country Code</FieldLabel>
              <div className="relative">
                <select
                  className={selectClass(errors.countryCode)}
                  value={form.countryCode}
                  onChange={(e) => update("countryCode", e.target.value)}
                >
                  <option value="" className="bg-stone-800">
                    Select country code
                  </option>
                  {countryCodeOptions.map((country) => (
                    <option
                      key={`${country.value}-${country.label}`}
                      value={country.value}
                      className="bg-stone-800"
                    >
                      {country.label}
                    </option>
                  ))}
                </select>
                <NavArrowDownSolid className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
              </div>
              <FieldError message={errors.countryCode} />
            </label>

            <label className="block">
              <FieldLabel>Phone Number</FieldLabel>
              <input
                className={inputClass(errors.phone)}
                value={form.phone}
                // Digits only
                onChange={(e) => update("phone", e.target.value.replace(/\D/g, ""))}
                placeholder="Phone Number"
                type="tel"
                inputMode="numeric"
                maxLength={15}
              />
              <FieldError message={errors.phone} />
            </label>

            <label className="block">
              <FieldLabel>Email address</FieldLabel>
              <input
                className={inputClass(errors.email)}
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="Email"
                type="email"
                autoComplete="off"
              />
              <FieldError message={errors.email} />
            </label>

            <label className="block">
              <FieldLabel>Password</FieldLabel>
              <input
                className={inputClass(errors.password)}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder={isEdit ? "Leave empty to keep the current password" : "Password"}
                type="password"
                autoComplete="new-password"
              />
              <FieldError message={errors.password} />
            </label>
          </section>

          <label className="block">
            <FieldLabel>Select Role</FieldLabel>
            <div className="relative">
              <select
                className={selectClass(errors.roleId)}
                value={form.roleId}
                onChange={(e) => update("roleId", e.target.value)}
                disabled={rolesLoading}
              >
                <option value="" className="bg-stone-800">
                  {rolesLoading ? "Loading roles..." : "Select Role"}
                </option>
                {roleOptions.map((role: any, index: number) => {
                  const roleValue = role?._id ?? role?.id ?? role?.roleId ?? "";
                  const roleLabel =
                    role?.role ?? role?.name ?? role?.title ?? `Role ${index + 1}`;
                  return (
                    <option key={roleValue || index} value={roleValue} className="bg-stone-800">
                      {roleLabel}
                    </option>
                  );
                })}
              </select>
              <NavArrowDownSolid className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
            </div>
            <FieldError message={errors.roleId} />
          </label>
        </fieldset>

        <div className="grid gap-3 pt-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => router.push("/admin/disstriktonites")}
            disabled={isPending}
            className="h-11 rounded-md border border-stone-500 text-sm font-medium text-stone-200 transition-colors hover:border-stone-300 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex h-11 items-center justify-center gap-2 rounded-md bg-[#EF476F] text-sm font-medium text-white transition-colors hover:bg-rose-600 disabled:opacity-60"
          >
            {isPending && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {isPending ? (isEdit ? "Updating..." : "Creating...") : "Confirm"}
          </button>
        </div>
      </form>
    </main>
  );
};

export default DisstriktoniteForm;
