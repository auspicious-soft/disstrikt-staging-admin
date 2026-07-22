"use client";

import React, { useMemo, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { InfoCircle } from "iconoir-react";

const locales = [
  { label: "English", key: "en" },
  { label: "French", key: "fr" },
  { label: "Spanish", key: "es" },
  { label: "Dutch", key: "nl" },
] as const;

const regionalOptions = [
  "Europe",
  "Asia",
  "North America",
  "South America",
  "Africa",
  "Australia",
];

const yesNoOptions = ["Yes", "No"];
const taskOptions = ["10", "25", "50", "100", "Unlimited"];

const permissionFields: Array<{
  label: string;
  key:
    | "websitePublication"
    | "profilePromotion"
    | "modelCoach"
    | "unlimitedShoots"
    | "regionalAccess"
    | "modelRouteProgram";
  multiple?: boolean;
}> = [
  { label: "Website Publication", key: "websitePublication" },
  { label: "Profile Promotion", key: "profilePromotion" },
  { label: "Model Coach", key: "modelCoach" },
  { label: "Unlimited Shoots", key: "unlimitedShoots" },
  { label: "Regional Access", key: "regionalAccess", multiple: true },
  { label: "Model Route Program", key: "modelRouteProgram" },
];

const inputClass =
  "h-10 w-full rounded-md border border-stone-700 bg-transparent px-3 text-xs text-stone-200 outline-none placeholder:text-stone-500 focus:border-rose-400";

const selectClass =
  "h-10 w-full appearance-none rounded-md border border-stone-700 bg-stone-900 px-3 pr-8 text-xs text-stone-200 outline-none focus:border-rose-400";

type LocaleMap = Record<"en" | "fr" | "es" | "nl", string>;

type PlanForm = {
  _id?: string;
  id?: string;
  key: string;
  name: LocaleMap;
  price: {
    eur: string;
    gbp: string;
  };
  description: LocaleMap;
  tasksPermitted: string;
  pictureUploadLimit: string;
  generalSupport: string;
  websitePublication: string;
  profilePromotion: string;
  modelCoach: string;
  unlimitedShoots: string;
  regionalAccess: string[];
  modelRouteProgram: string;
  freeTrial: {
    tasksPerCriteria: string;
    pictureUploadLimit: string;
  };
};

const staticPlans: PlanForm[] = [
  {
    key: "Rising Star Plan",
    name: {
      en: "Rising Star Plan",
      fr: "Plan Etoile Montante",
      es: "Plan Estrella Emergente",
      nl: "Rijzende Ster Plan",
    },
    price: { eur: "49.99", gbp: "42.99" },
    description: {
      en: "A starter plan for models building their first professional profile.",
      fr: "Un plan de depart pour les modeles qui creent leur premier profil professionnel.",
      es: "Un plan inicial para modelos que crean su primer perfil profesional.",
      nl: "Een startplan voor modellen die hun eerste professionele profiel opbouwen.",
    },
    tasksPermitted: "10",
    pictureUploadLimit: "500",
    generalSupport: "Yes",
    websitePublication: "Yes",
    profilePromotion: "No",
    modelCoach: "No",
    unlimitedShoots: "No",
    regionalAccess: ["Europe"],
    modelRouteProgram: "No",
    freeTrial: {
      tasksPerCriteria: "2",
      pictureUploadLimit: "50",
    },
  },
  {
    key: "Hot Fame Plan",
    name: {
      en: "Hot Fame Plan",
      fr: "Plan Hot Fame",
      es: "Plan Hot Fame",
      nl: "Hot Fame Plan",
    },
    price: { eur: "129.99", gbp: "109.99" },
    description: {
      en: "Expanded visibility, support, and uploads for growing model careers.",
      fr: "Plus de visibilite, de support et d'envois pour les carrieres en croissance.",
      es: "Mayor visibilidad, soporte y cargas para carreras de modelaje en crecimiento.",
      nl: "Meer zichtbaarheid, ondersteuning en uploads voor groeiende modelcarrieres.",
    },
    tasksPermitted: "50",
    pictureUploadLimit: "2000",
    generalSupport: "Yes",
    websitePublication: "Yes",
    profilePromotion: "Yes",
    modelCoach: "Yes",
    unlimitedShoots: "No",
    regionalAccess: ["Europe", "Asia"],
    modelRouteProgram: "Yes",
    freeTrial: {
      tasksPerCriteria: "5",
      pictureUploadLimit: "100",
    },
  },
  {
    key: "Aspire Model Plan",
    name: {
      en: "Aspire Model Plan",
      fr: "Plan Aspire Model",
      es: "Plan Aspire Model",
      nl: "Aspire Model Plan",
    },
    price: { eur: "249.99", gbp: "219.99" },
    description: {
      en: "Full access for established models who need premium placement and support.",
      fr: "Acces complet pour les modeles etablis ayant besoin d'un placement premium.",
      es: "Acceso completo para modelos establecidos que necesitan presencia premium.",
      nl: "Volledige toegang voor gevestigde modellen die premium plaatsing nodig hebben.",
    },
    tasksPermitted: "Unlimited",
    pictureUploadLimit: "5000",
    generalSupport: "Yes",
    websitePublication: "Yes",
    profilePromotion: "Yes",
    modelCoach: "Yes",
    unlimitedShoots: "Yes",
    regionalAccess: ["Europe", "Asia", "North America"],
    modelRouteProgram: "Yes",
    freeTrial: {
      tasksPerCriteria: "10",
      pictureUploadLimit: "250",
    },
  },
];


const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="mb-1 block text-xs font-medium text-stone-200">
    {children}
  </span>
);

const SelectField = ({
  label,
  value,
  options = yesNoOptions,
  onChange,
}: {
  label: string;
  value: string;
  options?: string[];
  onChange: (value: string) => void;
}) => (
  <label className="block">
    <FieldLabel>{label}</FieldLabel>
    <div className="relative">
      <select
        className={selectClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="" className="bg-stone-800">
          Select
        </option>
        {options.map((option) => (
          <option key={option} value={option} className="bg-stone-800">
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
    </div>
  </label>
);

const MultiSelectField = ({
  label,
  selected,
  onChange,
}: {
  label: string;
  selected: string[];
  onChange: (value: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);

  const toggleOption = (option: string) => {
    onChange(
      selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option],
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
  const [plans, setPlans] = useState<PlanForm[]>(staticPlans);
  const [activeIndex, setActiveIndex] = useState(0);
  const activePlan = plans[activeIndex];

  const pictureOptions = useMemo(
    () =>
      Array.from(
        new Set(
          [
            "500",
            "1000",
            "2000",
            "5000",
            activePlan?.pictureUploadLimit,
          ].filter(Boolean),
        ),
      ) as string[],
    [activePlan?.pictureUploadLimit],
  );

  const updateActivePlan = (updater: (plan: PlanForm) => PlanForm) => {
    setPlans((current) =>
      current.map((plan, index) =>
        index === activeIndex ? updater(plan) : plan,
      ),
    );
  };

  if (!activePlan) {
    return <main className="w-full text-sm text-stone-200">No plans found.</main>;
  }

  return (
    <main className="w-full text-stone-200">
      <div className="mb-4 flex w-fit flex-wrap gap-2 rounded-2xl bg-[#141615]">
        {plans.map((plan, index) => (
          <button
            key={plan._id || plan.id || `${plan.key}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-8 rounded-full px-5 text-xs font-medium transition-colors ${
              index === activeIndex
                ? "bg-rose-500 text-white"
                : "text-stone-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {plan.name.en || plan.key || `Plan ${index + 1}`}
          </button>
        ))}
      </div>

      <form className="space-y-3" onSubmit={(event) => event.preventDefault()}>
        <label className="block">
          <div className="mb-1.5 flex items-center justify-between">
            <FieldLabel>Key</FieldLabel>
            <InfoCircle className="h-4 w-4 text-stone-400" />
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

        <section className="space-y-2">
          <h2 className="text-xs font-medium text-stone-100">Plan Details</h2>
          <section className="space-y-2 rounded-md border border-stone-700 p-2">
            <h2 className="text-xs font-medium text-stone-100">Name Of Plan</h2>
            <div className="grid gap-2 md:grid-cols-4">
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
                    aria-label={`Name of plan ${locale.label}`}
                  />
                </label>
              ))}
            </div>
          </section>
        </section>

        <section className="space-y-2 rounded-md border border-stone-700 p-2">
          <h2 className="text-xs font-medium text-stone-100">Price</h2>
          <div className="grid gap-2 md:grid-cols-2">
            <label>
              <LabelWithInfo>In Euros</LabelWithInfo>
              <input
                className={inputClass}
                value={activePlan.price.eur}
                onChange={(event) =>
                  updateActivePlan((plan) => ({
                    ...plan,
                    price: { ...plan.price, eur: event.target.value },
                  }))
                }
                placeholder="4299"
              />
            </label>
            <label>
              <LabelWithInfo>In GBP</LabelWithInfo>
              <input
                className={inputClass}
                value={activePlan.price.gbp}
                onChange={(event) =>
                  updateActivePlan((plan) => ({
                    ...plan,
                    price: { ...plan.price, gbp: event.target.value },
                  }))
                }
                placeholder="129.99"
              />
            </label>
          </div>
        </section>

        <section className="space-y-2 rounded-md border border-stone-700 p-2">
          <h2 className="text-xs font-medium text-stone-100">Description</h2>
          <div className="space-y-2">
            {locales.map((locale) => (
              <label key={locale.key} className="block">
                <FieldLabel>{locale.label}</FieldLabel>
                <textarea
                  className="h-20 w-full resize-none rounded-md border border-stone-700 bg-transparent px-3 py-3 text-xs text-stone-200 outline-none placeholder:text-stone-500 focus:border-rose-400"
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
        </section>

        <div className="grid gap-2 md:grid-cols-2">
          <SelectField
            label="Tasks Permitted"
            value={activePlan.tasksPermitted}
            options={taskOptions}
            onChange={(value) =>
              updateActivePlan((plan) => ({ ...plan, tasksPermitted: value }))
            }
          />
          <SelectField
            label="Picture Upload Limit"
            value={activePlan.pictureUploadLimit}
            options={pictureOptions}
            onChange={(value) =>
              updateActivePlan((plan) => ({
                ...plan,
                pictureUploadLimit: value,
              }))
            }
          />
        </div>

        <SelectField
          label="General Contact"
          value={activePlan.generalSupport}
          onChange={(value) =>
            updateActivePlan((plan) => ({ ...plan, generalSupport: value }))
          }
        />

        <section className="grid gap-2 md:grid-cols-3">
          {permissionFields.map((field) =>
            field.key === "regionalAccess" ? (
              <MultiSelectField
                key={field.key}
                label={field.label}
                selected={activePlan.regionalAccess}
                onChange={(value) =>
                  updateActivePlan((plan) => ({
                    ...plan,
                    regionalAccess: value,
                  }))
                }
              />
            ) : (
              <SelectField
                key={field.key}
                label={field.label}
                value={activePlan[field.key]}
                onChange={(value) =>
                  updateActivePlan((plan) => ({
                    ...plan,
                    [field.key]: value,
                  }))
                }
              />
            ),
          )}
        </section>

        <section className="space-y-2 rounded-md border border-stone-700 p-2">
          <h2 className="text-xs font-medium text-stone-100">
            Free Trial Details
          </h2>
          <div className="grid gap-2 md:grid-cols-2">
            <label className="block">
              <FieldLabel>Tasks Per Criteria</FieldLabel>
              <input
                className={inputClass}
                value={activePlan.freeTrial.tasksPerCriteria}
                onChange={(event) =>
                  updateActivePlan((plan) => ({
                    ...plan,
                    freeTrial: {
                      ...plan.freeTrial,
                      tasksPerCriteria: event.target.value,
                    },
                  }))
                }
                placeholder="Task Per Model"
              />
            </label>
            <label className="block">
              <FieldLabel>Picture Upload Limit</FieldLabel>
              <input
                className={inputClass}
                value={activePlan.freeTrial.pictureUploadLimit}
                onChange={(event) =>
                  updateActivePlan((plan) => ({
                    ...plan,
                    freeTrial: {
                      ...plan.freeTrial,
                      pictureUploadLimit: event.target.value,
                    },
                  }))
                }
                placeholder="12"
              />
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
