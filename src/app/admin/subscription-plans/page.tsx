"use client";

import React, { useState } from "react";
import { InfoCircle } from "iconoir-react";

type LocaleKey = "en" | "fr" | "es" | "nl";
type BillingMode = "flex" | "commitment";

type Plan = {
  key: string;
  name: Record<LocaleKey, string>;
  price: {
    eur: string;
    gbp: string;
  };
  description: Record<LocaleKey, string>;
};

type ModuleRow =
  | {
      label: string;
      type: "toggle";
      enabled?: boolean;
    }
  | {
      label: string;
      type: "options";
      options: string[];
      active: string;
    };

type ModuleSection = {
  title: string;
  enabled?: boolean;
  rows: ModuleRow[];
};

const locales: Array<{ label: string; key: LocaleKey }> = [
  { label: "English", key: "en" },
  { label: "French", key: "fr" },
  { label: "Spanish", key: "es" },
  { label: "Dutch", key: "nl" },
];

const staticPlans: Plan[] = [
  {
    key: "Rising Star Plan",
    name: {
      en: "Rising Star Plan",
      fr: "Rising Star Plan",
      es: "Rising Star Plan",
      nl: "Rising Star Plan",
    },
    price: {
      eur: "299.99",
      gbp: "259.99",
    },
    description: {
      en: "Rising Star Plan",
      fr: "Rising Star Plan",
      es: "Rising Star Plan",
      nl: "Rising Star Plan",
    },
  },
  {
    key: "New Face Plan",
    name: {
      en: "New Face Plan",
      fr: "New Face Plan",
      es: "New Face Plan",
      nl: "New Face Plan",
    },
    price: {
      eur: "399.99",
      gbp: "349.99",
    },
    description: {
      en: "New Face Plan",
      fr: "New Face Plan",
      es: "New Face Plan",
      nl: "New Face Plan",
    },
  },
  {
    key: "Aspire Model Plan",
    name: {
      en: "Aspire Model Plan",
      fr: "Aspire Model Plan",
      es: "Aspire Model Plan",
      nl: "Aspire Model Plan",
    },
    price: {
      eur: "599.99",
      gbp: "529.99",
    },
    description: {
      en: "Aspire Model Plan",
      fr: "Aspire Model Plan",
      es: "Aspire Model Plan",
      nl: "Aspire Model Plan",
    },
  },
];

const moduleSections: ModuleSection[] = [
  {
    title: "Shoot Studio",
    enabled: true,
    rows: [
      { label: "Portfolio Shoot", type: "toggle", enabled: true },
      { label: "Custom Shoot", type: "toggle", enabled: true },
    ],
  },
  {
    title: "Model Market",
    enabled: true,
    rows: [
      { label: "Basic Scroll Mode", type: "toggle", enabled: true },
      { label: "Swipe Mode", type: "toggle", enabled: true },
    ],
  },
  {
    title: "Job Junction",
    enabled: true,
    rows: [
      {
        label: "Job application per day",
        type: "options",
        options: ["01", "05", "Unlimited"],
        active: "01",
      },
      {
        label: "Job Applications per month",
        type: "options",
        options: ["10", "30", "Unlimited"],
        active: "10",
      },
      { label: "Basic Scroll Mode", type: "toggle", enabled: true },
      { label: "Swipe Mode", type: "toggle", enabled: true },
    ],
  },
  {
    title: "University Union",
    enabled: true,
    rows: [
      { label: "Personal Model Agent", type: "toggle", enabled: true },
      { label: "Agent Calls", type: "toggle", enabled: true },
      {
        label: "Modules Unlocked",
        type: "options",
        options: ["01", "02", "03", "04", "05"],
        active: "01",
      },
    ],
  },
  {
    title: "Model Mansion",
    enabled: true,
    rows: [
      { label: "Achievement Cabinet", type: "toggle", enabled: true },
      { label: "Professional Model Contract", type: "toggle", enabled: true },
      {
        label: "Portfolio Book Tier",
        type: "options",
        options: ["01", "02", "03", "04", "05"],
        active: "01",
      },
      { label: "Model Fee Calculator", type: "toggle", enabled: true },
    ],
  },
];

const inputClass =
  "h-[54px] w-full rounded-[4px] border border-[#332C2D] bg-transparent px-3 text-[12px] font-light text-stone-300 outline-none transition-colors placeholder:text-stone-500 focus:border-[#EF476F]";

const textareaClass =
  "min-h-[136px] w-full resize-none rounded-[4px] border border-[#332C2D] bg-transparent px-3 py-3 text-[12px] font-light text-stone-300 outline-none transition-colors placeholder:text-stone-500 focus:border-[#EF476F]";

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="mb-1 block text-xs font-normal text-stone-100">
    {children}
  </span>
);

const Toggle = ({ checked = true }: { checked?: boolean }) => (
  <span
    className={`relative inline-flex h-[14px] w-[28px] shrink-0 items-center rounded-full transition-colors ${
      checked ? "bg-[#F3A0B7]" : "bg-stone-700"
    }`}
  >
    <span
      className={`h-[10px] w-[10px] rounded-full bg-white transition-transform ${
        checked ? "translate-x-[15px]" : "translate-x-[3px]"
      }`}
    />
  </span>
);

const SectionShell = ({
  title,
  children,
  border = "true",
}: {
  title: string;
  children: React.ReactNode;
  border?: string;
}) => (
  <section
    className={`rounded-[6px] bg-none ${
      border === "true" ? "border border-stone-700 p-2" : ""
    }`}
  >
    <h2 className="mb-2 text-base font-medium text-stone-100">{title}</h2>
    {children}
  </section>
);

const OptionGroup = ({
  options,
  active,
}: {
  options: string[];
  active: string;
}) => (
  <div className="flex items-center gap-6 text-[10px] text-stone-500">
    {options.map((option) => (
      <button
        key={option}
        type="button"
        className={`pb-1 transition-colors ${
          option === active
            ? "border-b border-[#EF476F] text-[#EF476F]"
            : "border-b border-transparent hover:text-stone-200"
        }`}
      >
        {option}
      </button>
    ))}
  </div>
);

const ModuleSection = ({ title, enabled = true, rows }: ModuleSection) => (
  <section className="overflow-hidden rounded-[6px] border border-[#292324] bg-black/30">
    <div className="flex h-[34px] items-center justify-between bg-white/10 px-3">
      <h2 className="text-sm font-medium text-stone-100">{title}</h2>
      <div className="flex items-center gap-3 text-xs font-normal text-stone-100">
        <span>Module Enabled</span>
        <Toggle checked={enabled} />
      </div>
    </div>

    <div className="space-y-3 px-3 py-4">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex min-h-[18px] items-center justify-between gap-6"
        >
          <span className="text-xs font-normal text-stone-400">
            {row.label}
          </span>
          {row.type === "toggle" ? (
            <div className="flex items-center gap-3 text-xs font-normal text-stone-100">
              <span>On</span>
              <Toggle checked={row.enabled} />
            </div>
          ) : (
            <OptionGroup options={row.options} active={row.active} />
          )}
        </div>
      ))}
    </div>
  </section>
);

const SubscriptionPlans = () => {
  const [billingMode, setBillingMode] = useState<BillingMode>("flex");
  const [plans, setPlans] = useState(staticPlans);
  const [activeIndex, setActiveIndex] = useState(0);
  const activePlan = plans[activeIndex];

  const updateActivePlan = (updater: (plan: Plan) => Plan) => {
    setPlans((current) =>
      current.map((plan, index) =>
        index === activeIndex ? updater(plan) : plan,
      ),
    );
  };

  return (
    <main className="w-full text-stone-200">
      <div className="mb-7 flex h-[34px] w-[270px] overflow-hidden rounded-full bg-[#111111]">
        {(["flex", "commitment"] as BillingMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setBillingMode(mode)}
            className={`h-full flex-1 rounded-full text-xs font-normal capitalize transition-colors ${
              billingMode === mode
                ? "bg-[#EF476F] text-white"
                : "text-stone-400 hover:text-white"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      <div className="mb-8 flex flex-wrap gap-8">
        {plans.map((plan, index) => (
          <button
            key={plan.key}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`border-b pb-2 text-[12px] transition-colors ${
              index === activeIndex
                ? "border-[#EF476F] text-[#EF476F]"
                : "border-transparent text-stone-400 hover:text-white"
            }`}
          >
            {plan.key}
          </button>
        ))}
      </div>

      <form className="space-y-3" onSubmit={(event) => event.preventDefault()}>
        <label className="block">
          <div className="mb-2 flex items-center justify-between">
            <FieldLabel>Key</FieldLabel>
            <InfoCircle className="h-4 w-4 text-stone-300" />
          </div>
          <input
            className={inputClass}
            value={activePlan.key}
            onChange={(event) =>
              updateActivePlan((plan) => ({ ...plan, key: event.target.value }))
            }
            placeholder="Rising Star Plan"
          />
        </label>

        <SectionShell title="Plan Details" border="false">
          <section className="rounded-[6px] border border-[#332C2D] p-2">
            <h3 className="mb-2 text-sm font-medium text-stone-100">
              Name Of Plan
            </h3>
            <div className="grid gap-3 md:grid-cols-4">
              {locales.map((locale) => (
                <label key={locale.key} className="block">
                  <FieldLabel>{locale.label}</FieldLabel>
                  <input
                    className={inputClass}
                    value={activePlan.name[locale.key]}
                    onChange={(event) =>
                      updateActivePlan((plan) => ({
                        ...plan,
                        name: {
                          ...plan.name,
                          [locale.key]: event.target.value,
                        },
                      }))
                    }
                    placeholder="Rising Star Plan"
                  />
                </label>
              ))}
            </div>
          </section>
        </SectionShell>

        <SectionShell title="Price">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <div className="mb-2 flex items-center justify-between">
                <FieldLabel>In Euros</FieldLabel>
                <InfoCircle className="h-4 w-4 text-stone-300" />
              </div>
              <input
                className={inputClass}
                value={activePlan.price.eur}
                onChange={(event) =>
                  updateActivePlan((plan) => ({
                    ...plan,
                    price: { ...plan.price, eur: event.target.value },
                  }))
                }
                placeholder="299.99"
              />
            </label>
            <label className="block">
              <div className="mb-2 flex items-center justify-between">
                <FieldLabel>In GBP</FieldLabel>
                <InfoCircle className="h-4 w-4 text-stone-300" />
              </div>
              <input
                className={inputClass}
                value={activePlan.price.gbp}
                onChange={(event) =>
                  updateActivePlan((plan) => ({
                    ...plan,
                    price: { ...plan.price, gbp: event.target.value },
                  }))
                }
                placeholder="259.99"
              />
            </label>
          </div>
        </SectionShell>

        <SectionShell title="Description">
          <div className="space-y-4">
            {locales.map((locale) => (
              <label key={locale.key} className="block">
                <FieldLabel>{locale.label}</FieldLabel>
                <textarea
                  className={textareaClass}
                  value={activePlan.description[locale.key]}
                  onChange={(event) =>
                    updateActivePlan((plan) => ({
                      ...plan,
                      description: {
                        ...plan.description,
                        [locale.key]: event.target.value,
                      },
                    }))
                  }
                  placeholder="Rising Star Plan"
                />
              </label>
            ))}
          </div>
        </SectionShell>

        <div className="space-y-3">
          {moduleSections.map((section) => (
            <ModuleSection key={section.title} {...section} />
          ))}
        </div>

        <button
          type="submit"
          className="mt-10 h-[42px] w-full rounded-[6px] bg-[#EF476F] text-[12px] font-medium uppercase text-white transition-colors hover:bg-rose-400"
        >
          SAVE
        </button>
      </form>
    </main>
  );
};

export default SubscriptionPlans;
