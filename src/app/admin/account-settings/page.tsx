"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import Loader from "../components/ui/Loader";
import ButtonSpinner from "../components/ui/ButtonSpinner";
import { axiosInstance } from "@/lib/axios";
import { generateSignedUrlForProfile } from "@/actions";
import { resolveMediaUrl } from "@/lib/media";

// GET/PUT /admin/admin-data (admin-profile.controller)
const ADMIN_DATA_URL = "/admin/admin-data";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const COUNTRY_CODES = ["+1", "+31", "+32", "+33", "+34", "+44", "+49", "+91"];

type AdminData = {
  _id: string;
  fullName?: string;
  email?: string;
  image?: string | null;
  countryCode?: string | null;
  phone?: string | null;
};

type Form = {
  fullName: string;
  email: string;
  countryCode: string;
  phone: string;
  oldPassword: string;
  password: string;
  confirmPassword: string;
};
type FieldId = keyof Form;

const emptyForm: Form = {
  fullName: "",
  email: "",
  countryCode: "",
  phone: "",
  oldPassword: "",
  password: "",
  confirmPassword: "",
};

const formFrom = (admin: AdminData): Form => ({
  ...emptyForm,
  fullName: admin.fullName ?? "",
  email: admin.email ?? "",
  countryCode: admin.countryCode ?? "",
  phone: admin.phone ?? "",
});

const apiErrorMessage = (error: unknown, fallback: string) =>
  (error as any)?.response?.data?.message || fallback;

// Keeps the stored session (header name / photo) in step with the saved profile
const syncSession = (admin: Partial<AdminData>) => {
  try {
    const stored = JSON.parse(localStorage.getItem("admin") || "null");
    if (stored) localStorage.setItem("admin", JSON.stringify({ ...stored, ...admin }));
  } catch {
    // the session is only a cache
  }
};

const validate = (values: Form) => {
  const errors: Partial<Record<FieldId, string>> = {};
  if (!values.fullName.trim()) errors.fullName = "Name is required";
  if (!values.email.trim()) errors.email = "Email is required";
  else if (!EMAIL_REGEX.test(values.email.trim())) errors.email = "Enter a valid email address";
  if (values.phone && !/^\d{6,15}$/.test(values.phone)) errors.phone = "Enter 6 to 15 digits";
  if (values.phone && !values.countryCode) errors.countryCode = "Select a country code";

  // All three empty keeps the current password
  if (values.oldPassword || values.password || values.confirmPassword) {
    if (!values.oldPassword) errors.oldPassword = "Enter your current password";
    if (!values.password) errors.password = "Enter a new password";
    else if (!PASSWORD_REGEX.test(values.password))
      errors.password = "At least 8 characters with a letter and a number";
    if (values.password !== values.confirmPassword)
      errors.confirmPassword = "Passwords do not match";
  }
  return errors;
};

const inputClass = (error?: string) =>
  `self-stretch w-full p-4 bg-zinc-900/80 rounded-[10px] outline text-zinc-200 text-sm disabled:opacity-60 ${
    error ? "outline-[#E0414F]" : "outline-neutral-700"
  }`;

const AccountSettings = () => {
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<FieldId, string>>>({});
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [showPassword, setShowPassword] = useState<Partial<Record<FieldId, boolean>>>({});

  const load = async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const { data } = await axiosInstance.get(ADMIN_DATA_URL);
      const loaded = data.data as AdminData;
      setAdmin(loaded);
      setForm(formFrom(loaded));
      setImageFailed(false);
    } catch (error) {
      setLoadFailed(true);
      toast.error(apiErrorMessage(error, "Couldn't load your account"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const setField = (id: FieldId, value: string) => {
    const next = { ...form, [id]: id === "phone" ? value.replace(/\D/g, "") : value };
    setForm(next);
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: validate(next)[id] }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return void toast.error("Please choose an image file");
    if (file.size > 10 * 1024 * 1024) return void toast.error("Image must be 10 MB or smaller");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageFailed(false);
  };

  const uploadImage = async (file: File) => {
    const { signedUrl, key } = await generateSignedUrlForProfile(
      `admin-${admin?._id}-${Date.now()}-${file.name.replace(/\s+/g, "-")}`,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin || saving) return;
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      // The API needs fullName and email on every update
      const payload: Record<string, string | null> = {
        fullName: form.fullName.trim().replace(/\s+/g, " "),
        email: form.email.trim().toLowerCase(),
        countryCode: form.phone ? form.countryCode : null,
        phone: form.phone || null,
      };
      if (form.password) {
        payload.oldPassword = form.oldPassword;
        payload.password = form.password;
      }
      if (imageFile) {
        try {
          payload.image = await uploadImage(imageFile);
        } catch {
          toast.error("Couldn't upload the image. Please try again.");
          return;
        }
      }

      await axiosInstance.put(ADMIN_DATA_URL, payload);
      syncSession({
        fullName: payload.fullName!,
        email: payload.email!,
        ...(payload.image ? { image: payload.image } : {}),
      });
      toast.success("Account updated");
      setImageFile(null);
      setImagePreview(null);
      setErrors({});
      await load();
    } catch (error) {
      toast.error(apiErrorMessage(error, "Couldn't update your account"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (loadFailed || !admin) {
    return (
      <div className="p-5 flex flex-col items-start gap-3">
        <p className="text-sm text-stone-400">Couldn&apos;t load your account.</p>
        <button
          type="button"
          onClick={load}
          className="px-4 py-2 rounded-[10px] bg-rose-500 hover:bg-rose-800 text-white text-sm cursor-pointer"
        >
          Try again
        </button>
      </div>
    );
  }

  const photo = imagePreview || resolveMediaUrl(admin.image);
  const showPlaceholder = !photo || imageFailed;

  const textField = (id: FieldId, label: string, type: string, placeholder: string) => (
    <div className="self-stretch flex flex-col gap-1.5">
      <label htmlFor={id} className="text-stone-200 text-xs font-light">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        inputMode={id === "phone" ? "numeric" : undefined}
        value={form[id]}
        disabled={saving}
        onChange={(e) => setField(id, e.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(errors[id])}
        className={inputClass(errors[id])}
      />
      {errors[id] && <p className="text-[11px] text-[#F27A8A]">{errors[id]}</p>}
    </div>
  );

  const passwordField = (id: FieldId, label: string) => (
    <div className="self-stretch flex flex-col gap-1.5">
      <label htmlFor={id} className="text-stone-200 text-xs font-light">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={showPassword[id] ? "text" : "password"}
          value={form[id]}
          disabled={saving}
          autoComplete={id === "oldPassword" ? "current-password" : "new-password"}
          onChange={(e) => setField(id, e.target.value)}
          placeholder="*************"
          aria-invalid={Boolean(errors[id])}
          className={`${inputClass(errors[id])} pr-10`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => ({ ...prev, [id]: !prev[id] }))}
          aria-label={showPassword[id] ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 cursor-pointer"
        >
          {showPassword[id] ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {errors[id] && <p className="text-[11px] text-[#F27A8A]">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="w-full inline-flex flex-col justify-center items-start gap-10 p-5">
      <div className="self-stretch inline-flex flex-col justify-start items-start gap-5">
        {/* Image */}
        <div className="flex flex-col justify-start items-start gap-5">
          {showPlaceholder ? (
            <div className="w-80 h-96 max-w-full rounded-[20px] border border-neutral-800 bg-[#171314] p-6 flex items-center justify-center">
              <img src="/assets/Logo.png" alt="No profile picture" className="w-full object-contain" />
            </div>
          ) : (
            <img
              className="w-80 h-96 max-w-full rounded-[20px] object-cover"
              src={photo}
              alt="Profile"
              onError={() => setImageFailed(true)}
            />
          )}

          <label
            className={`w-80 max-w-full p-2.5 rounded-[50px] outline outline-offset-[-1px] outline-zinc-400 flex justify-center items-center cursor-pointer ${
              saving ? "pointer-events-none opacity-60" : ""
            }`}
          >
            <span className="text-center text-stone-200 text-xs font-normal">
              {imageFile ? "Change Image (save with Confirm)" : "Upload / Change Image"}
            </span>
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
          className="w-full grid grid-cols-1 md:grid-cols-2 justify-center items-start gap-5"
        >
          {textField("fullName", "Name", "text", "Name")}
          {textField("email", "Email Address", "email", "Email")}

          {/* Country code */}
          <div className="self-stretch flex flex-col gap-1.5">
            <label htmlFor="countryCode" className="text-stone-200 text-xs font-light">
              Select Country Code
            </label>
            <div className="relative">
              <select
                id="countryCode"
                name="countryCode"
                value={form.countryCode}
                disabled={saving}
                onChange={(e) => setField("countryCode", e.target.value)}
                className={`${inputClass(errors.countryCode)} pr-10 appearance-none`}
              >
                <option value="" className="bg-zinc-900">
                  Select
                </option>
                {/* A saved code outside the list stays selectable */}
                {[...new Set([...COUNTRY_CODES, ...(form.countryCode ? [form.countryCode] : [])])].map(
                  (code) => (
                    <option key={code} value={code} className="bg-zinc-900">
                      {code}
                    </option>
                  ),
                )}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            </div>
            {errors.countryCode && <p className="text-[11px] text-[#F27A8A]">{errors.countryCode}</p>}
          </div>

          {textField("phone", "Phone Number", "tel", "4578965422")}

          {passwordField("oldPassword", "Current Password")}
          <div className="hidden md:block" />
          {passwordField("password", "New Password")}
          {passwordField("confirmPassword", "Confirm New Password")}

          <p className="text-[11px] text-neutral-500 md:col-span-2">
            Leave the password fields empty to keep your current password.
          </p>

          <div className="self-stretch md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full px-5 py-4 bg-rose-500 hover:bg-rose-800 rounded-[10px] text-white text-sm font-medium cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving && <ButtonSpinner />}
              {saving ? "Saving..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountSettings;
