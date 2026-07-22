"use client";

import { NavArrowDownSolid } from "iconoir-react";
import { Calendar, ChevronDown, Clock3, Paperclip, Plus } from "lucide-react";
import React from "react";

type FieldProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
};

type TextInputProps = {
  label: string;
  placeholder: string;
  type?: React.HTMLInputTypeAttribute;
  icon?: React.ReactNode;
  className?: string;
};

type SelectFieldProps = {
  label: string;
  defaultValue: string;
  options: string[];
  className?: string;
};

const sectionClass =
  "rounded-md border border-stone-700 bg-black/10 px-2.5 py-2.5 text-sm font-medium";
const labelClass =
  "mb-1.5 block text-sm font-medium leading-none text-stone-200";
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
  type = "text",
  icon,
  className = "",
}: TextInputProps) => (
  <Field label={label} className={className}>
    <div className="relative">
      <input
        type={type}
        placeholder={placeholder}
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
  defaultValue,
  options,
  className = "",
}: SelectFieldProps) => (
  <Field label={label} className={className}>
    <div className="relative">
      <select
        defaultValue={defaultValue}
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
    <h2 className="mb-2 text-sm font-medium leading-4 text-stone-100">
      {title}
    </h2>
    {children}
  </section>
);

const PostJobPage = () => {
  return (
    <form
      className="w-full max-w-none space-y-3 text-stone-100"
      onSubmit={(event) => event.preventDefault()}
    >
      <section className={sectionClass}>
        <SelectField
          label="What Are You Looking For ?"
          defaultValue="Model"
          options={["Model", "Photographer", "Stylist", "Makeup Artist"]}
        />
      </section>

      <Section title="Job Details">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-[2fr_1.1fr]">
          <TextInput label="Title" placeholder="Title" />

          <Field label="Upload Image">
            <label
              className={`${controlClass} flex cursor-pointer items-center justify-between`}
            >
              <span className="text-stone-500">Browse</span>
              <Paperclip className="h-3.5 w-3.5 text-stone-500" />
              <input type="file" accept="image/*" className="hidden" />
            </label>
          </Field>
        </div>

        <Field label="Description" className="mt-2">
          <textarea
            placeholder="Model"
            rows={5}
            className="min-h-24 w-full resize-none rounded border border-stone-700 bg-transparent px-3 py-3 text-[10px] font-normal text-stone-200 outline-none transition-colors placeholder:text-stone-500 focus:border-rose-500"
          />
        </Field>

        <TextInput
          label="Name of Company"
          placeholder="Company Name"
          className="mt-2"
        />
      </Section>

      <Section title="Schedule & Location">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto] md:items-center">
          <TextInput
            label="Date"
            placeholder="Enter Date"
            icon={<Calendar className="h-3.5 w-3.5" />}
          />
          <TextInput
            label="Time"
            placeholder="Select"
            icon={<Clock3 className="h-3.5 w-3.5" />}
          />
          <button
            type="button"
            className="inline-flex md:mt-4 h-5 items-center gap-1 text-[10px] font-medium text-stone-300 hover:text-white md:mb-0"
          >
            <Plus className="h-3 w-3" />
            Add another day
          </button>
        </div>

        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
          <SelectField
            label="Country"
            defaultValue="Select"
            options={["Select", "Netherlands", "Belgium", "France", "Spain"]}
          />
          <SelectField
            label="City"
            defaultValue="Select"
            options={["Select", "Amsterdam", "Brussels", "Paris", "Madrid"]}
          />
        </div>
      </Section>

      <Section title="Compensation">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <SelectField
            label="Type"
            defaultValue="Paid"
            options={["Paid", "Unpaid", "Barter"]}
          />
          <SelectField
            label="Currency"
            defaultValue="GBP"
            options={["GBP", "EUR", "USD"]}
          />
          <TextInput label="Amount" placeholder="350" />
        </div>
      </Section>

      <Section title="Preferences">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <SelectField
            label="Experience"
            defaultValue="1-2 Years"
            options={["1-2 Years", "3-5 Years", "5+ Years"]}
          />
          <SelectField
            label="Gender"
            defaultValue="Male"
            options={["Male", "Female", "Any"]}
          />
        </div>

        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <TextInput label="Min age" placeholder="24" />
          <TextInput label="Max Age" placeholder="45" />
          <TextInput label="Min Height" placeholder="160cm" />
          <TextInput label="Max height" placeholder="172 cm" />
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
          className="h-11 rounded-md bg-rose-500 text-sm font-medium text-white transition-colors hover:bg-rose-600"
        >
          Post Job
        </button>
      </div>
    </form>
  );
};

export default PostJobPage;
