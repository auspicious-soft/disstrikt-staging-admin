"use client";

import React from "react";
import { Check, ChevronDown, CircleHelp, X } from "lucide-react";
import { InfoCircle } from "iconoir-react";

const plans = ["Rising Star Plan", "Hot Fame Plan", "Aspire Model Plan"];

const locales = ["English", "French", "Spanish", "Dutch"];
const regionalOptions = [
  "Europe",
  "Asia",
  "North America",
  "South America",
  "Africa",
  "Australia",
];

const permissionRows = [
  [
    { label: "Website Publication", value: "Yes" },
    { label: "Profile Promotion", value: "Yes" },
    { label: "Model Coach", value: "Yes" },
  ],
  [
    { label: "Unlimited Shoots", value: "Yes" },
    { label: "Regional Access", value: "Yes",multiple: true },
    { label: "Model Route Program", value: "Yes" },
  ],
];

const inputClass =
  "h-10 w-full rounded-md border border-stone-700 bg-transparent px-3 text-xs text-stone-200 outline-none placeholder:text-stone-500 focus:border-rose-400";

const selectClass =
  "h-10 w-full appearance-none rounded-md border border-stone-700 bg-stone-900 px-3 pr-8 text-xs text-stone-200 outline-none focus:border-rose-400";

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="mb-1 block text-xs font-medium text-stone-200">
    {children}
  </span>
);

const SelectField = ({
  label,
}: {
  label: string;
  value?: string;
}) => (
  <label className="block">
    <FieldLabel>{label}</FieldLabel>

    <div className="relative">
      <select className={selectClass}>
        <option className="bg-stone-800">Europe</option>
        <option className="bg-stone-800">Asia</option>
        <option className="bg-stone-800">North America</option>
        <option className="bg-stone-800">South America</option>
        <option className="bg-stone-800">Africa</option>
        <option className="bg-stone-800">Australia</option>
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
    </div>
  </label>
);

const MultiSelectField = ({ label }: { label: string }) => {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>(["Europe"]);

  const toggleOption = (option: string) => {
    setSelected((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option],
    );
  };

  return (
    <div className="relative">
      <FieldLabel>{label}</FieldLabel>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-10 w-full items-center justify-between gap-2 rounded-md border border-stone-700 bg-stone-900 px-3 py-1.5 text-left text-xs text-stone-200 outline-none transition-colors hover:border-stone-500 focus:border-rose-400"
      >
        <span className="flex min-w-0 flex-1 flex-wrap gap-1">
          {selected.length ? (
            selected.map((option) => (
              <span
                key={option}
                className="inline-flex max-w-full items-center gap-1 rounded bg-neutral-800 px-2 py-1 text-[11px] leading-none text-stone-100"
              >
                <span className="truncate">{option}</span>
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove ${option}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleOption(option);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      event.stopPropagation();
                      toggleOption(option);
                    }
                  }}
                  className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded text-stone-400 hover:bg-stone-700 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </span>
              </span>
            ))
          ) : (
            <span className="py-1 text-stone-400">Select</span>
          )}
        </span>
        <ChevronDown className="ml-3 h-3.5 w-3.5 shrink-0 text-stone-400" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-1 max-h-44 overflow-y-auto rounded-md border border-stone-700 bg-stone-900 py-1 shadow-xl">
          {regionalOptions.map((option) => {
            const isSelected = selected.includes(option);

            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleOption(option)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-xs text-stone-200 transition-colors hover:bg-white/10"
              >
                <span>{option}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-rose-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const LabelWithInfo = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-between">
    <FieldLabel>{children}</FieldLabel>

    <InfoCircle className="h-4 w-4 cursor-pointer text-stone-400 hover:text-white" />
  </div>
);

const SubscriptionPlans = () => {
  return (
    <main className="w-full text-stone-200">
      <div className="mb-4 flex flex-wrap gap-2 w-fit rounded-2xl bg-[#141615]">
        {plans.map((plan, index) => (
          <button
            key={plan}
            type="button"
            className={`h-8 rounded-full px-5 text-xs font-medium transition-colors ${
              index === 0
                ? "bg-rose-500 text-white"
                : "text-stone-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {plan}
          </button>
        ))}
      </div>

      <form className="space-y-3">
        <label className="block">
          <div className="mb-1.5 flex items-center justify-between">
            <FieldLabel>Key</FieldLabel>

            <InfoCircle className="h-4 w-4 text-stone-400" />
          </div>

          <input className={inputClass} placeholder="Rising Star Plan" />
        </label>

        <section className="space-y-2">
          <h2 className="text-xs font-medium text-stone-100">Plan Details</h2>
          <section className="space-y-2 border border-stone-700 p-2 rounded-md">
            <h2 className="text-xs font-medium text-stone-100">Name Of Plan</h2>
            <div className="grid gap-2 md:grid-cols-4">
              {locales.map((locale) => (
                <label key={locale} className="block">
                  <FieldLabel>{locale}</FieldLabel>
                  <input
                    className={inputClass}
                    placeholder="Rising Star Plan"
                    aria-label={`Name of plan ${locale}`}
                  />
                </label>
              ))}
            </div>
          </section>
        </section>

        <section className="space-y-2 border border-stone-700 p-2 rounded-md">
          <h2 className="text-xs font-medium text-stone-100">Price</h2>
          <div className="grid gap-2 md:grid-cols-2">
            <label>
              <LabelWithInfo>In Euros</LabelWithInfo>

              <input className={inputClass} placeholder="4299" />
            </label>
            <label>
              <LabelWithInfo>In GBP</LabelWithInfo>

              <input className={inputClass} placeholder="129.99" />
            </label>
          </div>
        </section>

        <section className="space-y-2 border border-stone-700 p-2 rounded-md">
          <h2 className="text-xs font-medium text-stone-100">Description</h2>
          <div className="space-y-2">
            {locales.map((locale) => (
              <label key={locale} className="block">
                <FieldLabel>{locale}</FieldLabel>
                <textarea
                  className="h-20 w-full resize-none rounded-md border border-stone-700 bg-transparent px-3 py-3 text-xs text-stone-200 outline-none placeholder:text-stone-500 focus:border-rose-400"
                  placeholder="Rising Star Plan"
                />
              </label>
            ))}
          </div>
        </section>

        <div className="grid gap-2 md:grid-cols-2">
          <SelectField label="Tasks Permitted" value="300" />
          <SelectField label="Picture Upload Limit" value="2000" />
        </div>

        <SelectField label="General Support" />

        <section className="grid gap-2 md:grid-cols-3">
          {permissionRows.flat().map((field) => (
            field.multiple ? (
              <MultiSelectField key={field.label} label={field.label} />
            ) : (
              <SelectField
                key={field.label}
                label={field.label}
                value={field.value}
              />
            )
          ))}
        </section>

        <section className="space-y-2 border border-stone-700 p-2 rounded-md">
           <h2 className="text-xs font-medium text-stone-100">Free Trial Details</h2>
           <div className="grid gap-2 md:grid-cols-2">
          <label className="block">
            <FieldLabel>Tasks Per Criteria</FieldLabel>
            <input className={inputClass} placeholder="Task Per Model" />
          </label>
          <label className="block">
            <FieldLabel>Picture Upload Limit</FieldLabel>
            <input className={inputClass} placeholder="12" />
          </label>
          </div>
        </section>

        <button
          type="submit"
          className="mt-6 h-10 w-full rounded-md bg-rose-500 text-xs font-medium text-white transition-colors hover:bg-rose-400"
        >
          SAVE
        </button>
      </form>
    </main>
  );
};

export default SubscriptionPlans;
