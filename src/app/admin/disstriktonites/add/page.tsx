"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { NavArrowDownSolid } from "iconoir-react";

const inputClass =
  "h-12 w-full rounded-md border border-stone-700 bg-transparent px-4 text-xs font-normal text-stone-200 outline-none transition-colors placeholder:text-stone-500 focus:border-rose-400";

const selectClass =
  inputClass + " appearance-none pr-9";

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="mb-1.5 block text-xs font-normal leading-none text-stone-200">
    {children}
  </span>
);

const SelectField = ({
  label,
  placeholder,
  options,
}: {
  label: string;
  placeholder: string;
  options: string[];
}) => (
  <label className="block">
    <FieldLabel>{label}</FieldLabel>
    <div className="relative">
      <select className={selectClass} defaultValue="">
        <option value="" disabled className="bg-stone-900">
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} className="bg-stone-900">
            {option}
          </option>
        ))}
      </select>
      <NavArrowDownSolid className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
    </div>
  </label>
);

const AddDisstriktonitePage = () => {
  const router = useRouter();

  return (
    <main className="w-full text-stone-200">
      <form className="flex flex-col gap-5">
        <section className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <FieldLabel>Name</FieldLabel>
            <input className={inputClass} placeholder="Name" type="text" />
          </label>

          <SelectField
            label="Languages"
            placeholder="Language"
            options={["English", "Spanish", "German", "French", "Dutch"]}
          />

          <SelectField
            label="Select Country Code"
            placeholder="Select"
            options={["+1", "+31", "+33", "+34", "+49", "+91"]}
          />

          <label className="block">
            <FieldLabel>Phone Number</FieldLabel>
            <input
              className={inputClass}
              placeholder="4578965422"
              type="tel"
            />
          </label>

          <label className="block">
            <FieldLabel>Email address</FieldLabel>
            <input
              className={inputClass}
              placeholder="loremdsummy@mail.com"
              type="email"
            />
          </label>

          <label className="block">
            <FieldLabel>Password</FieldLabel>
            <input
              className={inputClass}
              placeholder="**********"
              type="password"
            />
          </label>
        </section>

        <SelectField
          label="Select Role"
          placeholder="Name"
          options={["Agent", "Manager", "Admin"]}
        />

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
            className="h-11 rounded-md bg-[#EF476F] text-sm font-medium text-white transition-colors hover:bg-rose-600"
          >
            Confirm
          </button>
        </div>
      </form>
    </main>
  );
};

export default AddDisstriktonitePage;
