"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { NavArrowDownSolid } from "iconoir-react";
import {
  useGetEmployeesById,
  useGetEmployeesRoles,
  useUpdateEmployeeById,
} from "@/hooks/useAdmin";
import Loader from "../../components/ui/Loader";

const inputClass =
  "h-12 w-full rounded-md border border-stone-700 bg-transparent px-4 text-xs font-normal text-stone-200 outline-none transition-colors placeholder:text-stone-500 focus:border-rose-400";

const selectClass = inputClass + " appearance-none pr-9";

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="mb-1.5 block text-xs font-normal leading-none text-stone-200">
    {children}
  </span>
);

const MultiSelectField = ({
  label,
  selected,
  options,
  onChange,
}: {
  label: string;
  selected: string[];
  options: { label: string; value: string }[];
  onChange: (selected: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);

  const toggleOption = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    );
  };

  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="flex min-h-12 w-full items-center justify-between gap-2 rounded-md border border-stone-700 bg-transparent px-4 text-left text-xs text-stone-200 outline-none transition-colors placeholder:text-stone-500 focus:border-rose-400"
        >
          <span className="flex min-w-0 flex-1 flex-wrap gap-1">
            {selected.length > 0 ? (
              selected.map((item) => {
                const option = options.find((option) => option.value === item);
                return (
                  <span
                    key={item}
                    className="inline-flex max-w-full items-center gap-1 rounded bg-stone-800 px-2 py-1 text-[11px] leading-none text-stone-100"
                  >
                    {option?.label ?? item}
                  </span>
                );
              })
            ) : (
              <span className="text-stone-500">Select languages</span>
            )}
          </span>
          <NavArrowDownSolid className="pointer-events-none h-3.5 w-3.5 text-stone-500" />
        </button>

        {open && (
          <div className="absolute left-0 right-0 z-10 mt-1 max-h-52 overflow-y-auto rounded-md border border-stone-700 bg-stone-900 py-1 shadow-lg">
            {options.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleOption(option.value)}
                  className="flex w-full items-center justify-between px-4 py-2 text-left text-xs text-stone-200 transition-colors hover:bg-white/10"
                >
                  <span>{option.label}</span>
                  <span className="text-stone-400">
                    {isSelected ? "✓" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </label>
  );
};

const languageOptions = [
  { label: "English", value: "en" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "Dutch", value: "nl" },
];

const EditDisstriktonitePage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const { data: rolesData, isLoading } = useGetEmployeesRoles();
  const { data, isLoading: loading } = useGetEmployeesById(id);
  const { mutate, isPending } = useUpdateEmployeeById(id);
  useEffect(() => {
    if (!data) return;

    setForm({
      fullName: data.fullName ?? "",
      email: data.email ?? "",
      password: "",
      language: data.language ?? [],
      countryCode: data.countryCode,
      phone: data.phone ?? "",
      roleId: data.roleId ?? "",
    });
  }, [data]);
  const roleOptions = Array.isArray(rolesData)
    ? rolesData
    : Array.isArray((rolesData as any)?.data)
      ? (rolesData as any).data
      : [];

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    language: [],
    countryCode: "+91",
    phone: "",
    roleId: "",
  });
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name } = e.target;

    if (e.target instanceof HTMLSelectElement && e.target.multiple) {
      const selectedValues = Array.from(
        e.target.selectedOptions,
        (option) => option.value,
      );

      setForm((prev) => ({
        ...prev,
        [name]: selectedValues,
      }));
      return;
    }

    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      fullName: form.fullName,
      email: form.email,
      language: form.language,
      countryCode: form.countryCode,
      phone: form.phone,
      roleId: form.roleId,
      ...(form.password.trim() && { password: form.password }),
    };

    mutate(payload, {
      onSuccess: () => {
        router.push("/admin/disstriktonites");
      },
      onError: (error) => {
        console.error(error);
      },
    });
  };

  return (
    <>
      {isLoading || loading || isPending ? (
        <Loader />
      ) : (
        <main className="w-full text-stone-200">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <section className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <FieldLabel>Name</FieldLabel>
                <input
                  className={inputClass}
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Name"
                  type="text"
                />
              </label>

              <label className="block">
                <MultiSelectField
                  label="Language"
                  selected={form.language}
                  options={languageOptions}
                  onChange={(selected) =>
                    setForm((prev) => ({
                      ...prev,
                      language: selected,
                    }))
                  }
                />
              </label>

              <label className="block">
                <FieldLabel>Select Country Code</FieldLabel>

                <div className="relative">
                  <select
                    className={selectClass}
                    name="countryCode"
                    value={form.countryCode}
                    onChange={handleChange}
                  >
                    <option value="+91">+91</option>
                    <option value="+1">+1</option>
                    <option value="+31">+31</option>
                    <option value="+33">+33</option>
                    <option value="+34">+34</option>
                  </select>

                  <NavArrowDownSolid className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
                </div>
              </label>

              <label className="block">
                <FieldLabel>Phone Number</FieldLabel>
                <input
                  className={inputClass}
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  type="tel"
                />
              </label>

              <label className="block">
                <FieldLabel>Email address</FieldLabel>
                <input
                  className={inputClass}
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  type="email"
                />
              </label>

              <label className="block">
                <FieldLabel>Password</FieldLabel>
                <input
                  className={inputClass}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  type="password"
                />
              </label>
            </section>

            <label className="block">
              <FieldLabel>Select Role</FieldLabel>

              <div className="relative">
                <select
                  className={selectClass}
                  name="roleId"
                  value={form.roleId}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="">Select Role</option>

                  {roleOptions.map((role: any, index: number) => {
                    const roleValue =
                      role?._id ?? role?.id ?? role?.roleId ?? "";
                    const roleLabel =
                      role?.role ??
                      role?.name ??
                      role?.title ??
                      `Role ${index + 1}`;

                    return (
                      <option key={roleValue || index} value={roleValue}>
                        {roleLabel}
                      </option>
                    );
                  })}
                </select>

                <NavArrowDownSolid className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
              </div>
            </label>

            <div className="grid gap-3 pt-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => router.push("/admin/disstriktonites")}
                className="h-11 rounded-md border border-stone-500 text-sm font-medium text-stone-200 transition-colors hover:border-stone-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="h-11 rounded-md bg-[#EF476F] text-sm font-medium text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
              >
                {isPending ? "Updating..." : "Confirm"}
              </button>
            </div>
          </form>
        </main>
      )}
    </>
  );
};

export default EditDisstriktonitePage;
