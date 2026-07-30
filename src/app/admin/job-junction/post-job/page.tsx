"use client";

import React, { useState } from "react";
import { Calendar, ChevronDown, Clock3, MapPin, Search } from "lucide-react";

type Tab = "job" | "disstriktonite";

type FieldProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
};

type InputProps = {
  label: string;
  placeholder: string;
  type?: React.HTMLInputTypeAttribute;
  icon?: React.ReactNode;
  className?: string;
};

type SectionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

const inputClass =
  "h-9 w-full rounded border border-[#2C2526] bg-transparent px-3 text-[10px] font-normal text-stone-200 outline-none transition-colors placeholder:text-stone-500 focus:border-[#EF476F]";

const labelClass = "mb-1.5 block text-[10px] font-medium text-stone-200";

const Field = ({ label, children, className = "" }: FieldProps) => (
  <label className={`block min-w-0 ${className}`}>
    <span className={labelClass}>{label}</span>
    {children}
  </label>
);

const TextInput = ({
  label,
  placeholder,
  type = "text",
  icon,
  className = "",
}: InputProps) => (
  <Field label={label} className={className}>
    <div className="relative">
      <input
        type={type}
        placeholder={placeholder}
        className={`${inputClass} ${icon ? "pr-8" : ""}`}
      />
      {icon && (
        <span className="pointer-events-none absolute right-2.5 top-1/2 flex -translate-y-1/2 text-stone-500">
          {icon}
        </span>
      )}
    </div>
  </Field>
);

const TextArea = ({ label, placeholder }: { label: string; placeholder: string }) => (
  <Field label={label}>
    <textarea
      placeholder={placeholder}
      className="min-h-20 w-full resize-none rounded border border-[#2C2526] bg-transparent px-3 py-2 text-[10px] font-normal text-stone-200 outline-none transition-colors placeholder:text-stone-500 focus:border-[#EF476F]"
    />
  </Field>
);

const SelectField = ({ label, placeholder }: { label: string; placeholder: string }) => (
  <Field label={label}>
    <div className="relative">
      <select defaultValue="" className={`${inputClass} appearance-none pr-8`}>
        <option value="" disabled className="bg-[#120F10]">
          {placeholder}
        </option>
        <option className="bg-[#120F10]">Option 1</option>
        <option className="bg-[#120F10]">Option 2</option>
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
    </div>
  </Field>
);

const Toggle = ({ checked = false }: { checked?: boolean }) => (
  <span
    className={`relative inline-flex h-3.5 w-6 items-center rounded-full transition-colors ${
      checked ? "bg-[#EF476F]" : "bg-stone-700"
    }`}
  >
    <span
      className={`h-2.5 w-2.5 rounded-full bg-white transition-transform ${
        checked ? "translate-x-3" : "translate-x-0.5"
      }`}
    />
  </span>
);

const Section = ({ title, children, defaultOpen = false }: SectionProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded border border-[#2C2526] bg-black/20">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 w-full items-center justify-between bg-[#211C1D] px-3 text-left"
      >
        <span className="text-[10px] font-semibold text-stone-100">{title}</span>
        <span className="flex items-center gap-2 text-[9px] font-medium text-stone-300">
          Available Online
          <Toggle checked />
          <ChevronDown
            className={`h-3.5 w-3.5 text-stone-400 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>
      {open && <div className="space-y-2.5 p-3">{children}</div>}
    </section>
  );
};

const chipItems = ["Bikini", "Lingerie", "Nude", "Beauty", "Fashion"];

const PostJobPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>("job");

  return (
    <form
      className="w-full max-w-none space-y-3 bg-[#120F10] text-stone-100"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="flex h-9 items-end gap-5 border-b border-[#2A2425] bg-[#211C1D] px-3">
        <button
          type="button"
          onClick={() => setActiveTab("job")}
          className={`h-full border-b text-[11px] font-medium transition-colors ${
            activeTab === "job"
              ? "border-[#EF476F] text-[#EF476F]"
              : "border-transparent text-stone-400 hover:text-stone-200"
          }`}
        >
          Job
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("disstriktonite")}
          className={`h-full border-b text-[11px] font-medium transition-colors ${
            activeTab === "disstriktonite"
              ? "border-[#EF476F] text-[#EF476F]"
              : "border-transparent text-stone-400 hover:text-stone-200"
          }`}
        >
          Disstriktonite
        </button>
      </div>

      <div className="space-y-3 px-2 pb-2">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-[1.2fr_1fr_1fr]">
          <TextInput label="Setup Job Title" placeholder="Setup Job Title" />
          <TextInput
            label="Select Date"
            placeholder="Enter Date"
            icon={<Calendar className="h-3.5 w-3.5" />}
          />
          <TextInput
            label="Begin & End Time"
            placeholder="Begin & End Time"
            icon={<Clock3 className="h-3.5 w-3.5" />}
          />
        </div>

        <div className="rounded border border-[#2C2526] bg-black/20 p-3">
          <h2 className="mb-3 text-[11px] font-semibold text-stone-100">
            Place Details
          </h2>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
            <TextInput label="Name Of Place" placeholder="Location" />
            <TextInput label="Street" placeholder="Street" />
            <TextInput label="Zip Code" placeholder="Zip Code" />
            <TextInput label="Place" placeholder="Place" />
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-[1fr_1.8fr]">
            <TextInput label="Phone" placeholder="Phone" />
            <TextInput
              label="Website"
              placeholder="Website"
              icon={<Search className="h-3.5 w-3.5" />}
            />
          </div>
        </div>

        <TextArea label="Description" placeholder="Setup Job Here" />
        <TextArea label="Terms" placeholder="Setup Job Here" />
        <TextArea label="Payment" placeholder="Setup Job Here" />

        <Section title="Shoot Details" defaultOpen>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <SelectField label="Style" placeholder="Select Style" />
            <SelectField label="Duration" placeholder="Select Duration" />
            <SelectField label="Compensation" placeholder="Select Compensation" />
          </div>
        </Section>

        <Section title="Model Select" defaultOpen>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <SelectField label="Select Model" placeholder="Search model" />
            <SelectField label="Agency" placeholder="Select Agency" />
          </div>
        </Section>

        <Section title="Job Location" defaultOpen>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1.4fr_1fr_1fr]">
            <TextInput
              label="Location"
              placeholder="Add job location"
              icon={<MapPin className="h-3.5 w-3.5" />}
            />
            <SelectField label="Country" placeholder="Select Country" />
            <SelectField label="City" placeholder="Select City" />
          </div>
        </Section>

        <Section title="Bonus / Cycles" defaultOpen>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <TextInput label="Payment Cycle" placeholder="Payment Cycle" />
            <TextInput label="Amount" placeholder="Amount" />
            <SelectField label="Currency" placeholder="Select Currency" />
          </div>
        </Section>

        <Section title="Model Services" defaultOpen>
          <div className="flex flex-wrap gap-2">
            {chipItems.map((item) => (
              <button
                key={item}
                type="button"
                className="rounded border border-[#2C2526] bg-black/30 px-3 py-1.5 text-[10px] text-stone-300 transition-colors hover:border-[#EF476F] hover:text-white"
              >
                {item}
              </button>
            ))}
          </div>
        </Section>

        <button
          type="submit"
          className="h-9 w-full rounded bg-[#EF476F] text-[11px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-rose-600"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default PostJobPage;
