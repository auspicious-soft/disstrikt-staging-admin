"use client";

import React, { useEffect, useMemo, useState } from "react";
import { InfoCircle } from "iconoir-react";
import { useGetSubscriptions, useUpdateSubscriptions } from "@/hooks/useAdmin";
import Loader from "../components/ui/Loader";
import { ModuleSection } from "@/app/components/ModuleSection";
import { SectionShell } from "@/app/components/SectionShell";
import { FieldLabel } from "@/app/components/FieldLabel";

type LocaleKey = "en" | "fr" | "es" | "nl";
type BillingMode = "flex" | "commitment";

type Plan = {
  _id?: string;
  key: string;
  name: Record<LocaleKey, string>;
  price: {
    eur: string;
    gbp: string;
    usd: string;
  };
  description: Record<LocaleKey, string>;
  moduleSections: ModuleSection[];
  isCommitment: boolean;
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

const planOrder = ["new-face", "aspire-model", "rising-star"];

const getNumericValue = (value: number | number[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0] ?? 0;
  }

  return value ?? 0;
};

const getOptionValueFromNumber = (
  value: number | number[] | undefined,
  options: string[],
) => {
  const numericValue = getNumericValue(value);

  if (!numericValue) {
    return options[0] ?? "01";
  }

  if (numericValue >= 100 || numericValue >= 1000) {
    return options[options.length - 1] ?? "Unlimited";
  }

  if (numericValue === 1) return options[0] ?? "01";
  if (numericValue === 5) return options[1] ?? "05";
  if (numericValue === 10) return options[0] ?? "10";
  if (numericValue === 30) return options[1] ?? "30";

  return options[0] ?? "01";
};

const mapPlanToForm = (apiPlan: any): Plan => {
  const fullAccess = apiPlan?.fullAccess ?? {};
  const shootStudio = fullAccess.shootStudio ?? {};
  const modelMarket = fullAccess.modelMarket ?? {};
  const jobJunction = fullAccess.jobJunction ?? {};
  const universityUnion = fullAccess.universityUnion ?? {};
  const modelMansion = fullAccess.modelMansion ?? {};

  const moduleSections: ModuleSection[] = [
    {
      title: "Shoot Studio",
      enabled: Boolean(shootStudio.enabled),
      rows: [
        { label: "Portfolio Shoot", type: "toggle", enabled: Boolean(shootStudio.portfolioShoot) },
        { label: "Custom Shoot", type: "toggle", enabled: Boolean(shootStudio.customShoot) },
      ],
    },
    {
      title: "Model Market",
      enabled: Boolean(modelMarket.enabled),
      rows: [
        { label: "Basic Scroll Mode", type: "toggle", enabled: Boolean(modelMarket.basicScrollMode) },
        { label: "Swipe Mode", type: "toggle", enabled: Boolean(modelMarket.swipeMode) },
      ],
    },
    {
      title: "Job Junction",
      enabled: Boolean(jobJunction.enabled),
      rows: [
        {
          label: "Job application per day",
          type: "options",
          options: ["01", "05", "Unlimited"],
          active: getOptionValueFromNumber(jobJunction.jobApplicationsPerDay, ["01", "05", "Unlimited"]),
        },
        {
          label: "Job Applications per month",
          type: "options",
          options: ["10", "30", "Unlimited"],
          active: getOptionValueFromNumber(jobJunction.jobApplicationsPerMonth, ["10", "30", "Unlimited"]),
        },
        { label: "Basic Scroll Mode", type: "toggle", enabled: Boolean(jobJunction.basicScrollMode) },
        { label: "Swipe Mode", type: "toggle", enabled: Boolean(jobJunction.swipeMode) },
      ],
    },
    {
      title: "University Union",
      enabled: Boolean(universityUnion.enabled),
      rows: [
        { label: "Personal Model Agent", type: "toggle", enabled: Boolean(universityUnion.personalModelAgent) },
        { label: "Agent Calls", type: "toggle", enabled: Boolean(universityUnion.agentCalls) },
        {
          label: "Modules Unlocked",
          type: "options",
          options: ["01", "02", "03", "04", "05"],
          active: getOptionValueFromNumber(universityUnion.modulesUnlocked, ["01", "02", "03", "04", "05"]),
        },
      ],
    },
    {
      title: "Model Mansion",
      enabled: Boolean(modelMansion.enabled),
      rows: [
        { label: "Achievement Cabinet", type: "toggle", enabled: Boolean(modelMansion.achievementCabinet) },
        { label: "Professional Model Contract", type: "toggle", enabled: Boolean(modelMansion.professionalModelContract) },
        {
          label: "Portfolio Book Tier",
          type: "options",
          options: ["01", "02", "03", "04", "05"],
          active: getOptionValueFromNumber(modelMansion.portfolioBookTier, ["01", "02", "03", "04", "05"]),
        },
        { label: "Model Fee Calculator", type: "toggle", enabled: Boolean(modelMansion.modelFeeCalculator) },
      ],
    },
  ];

  return {
    _id: apiPlan?._id ?? "",
    key: apiPlan?.key ?? "",
    name: {
      en: apiPlan?.name?.en ?? "",
      fr: apiPlan?.name?.fr ?? "",
      es: apiPlan?.name?.es ?? "",
      nl: apiPlan?.name?.nl ?? "",
    },
    price: {
      eur: apiPlan?.unitAmounts?.eur ? (apiPlan.unitAmounts.eur / 100).toFixed(2) : "0.00",
      gbp: apiPlan?.unitAmounts?.gbp ? (apiPlan.unitAmounts.gbp / 100).toFixed(2) : "0.00",
      usd: apiPlan?.unitAmounts?.usd ? (apiPlan.unitAmounts.usd / 100).toFixed(2) : "0.00",
    },
    description: {
      en: apiPlan?.description?.en ?? "",
      fr: apiPlan?.description?.fr ?? "",
      es: apiPlan?.description?.es ?? "",
      nl: apiPlan?.description?.nl ?? "",
    },
    isCommitment: Boolean(apiPlan?.isCommitment),
    moduleSections,
  };
};

const inputClass =
  "h-[54px] w-full rounded-[4px] border border-[#332C2D] bg-transparent px-3 text-[12px] font-light text-stone-300 outline-none transition-colors placeholder:text-stone-500 focus:border-[#EF476F]";

const textareaClass =
  "min-h-[136px] w-full resize-none rounded-[4px] border border-[#332C2D] bg-transparent px-3 py-3 text-[12px] font-light text-stone-300 outline-none transition-colors placeholder:text-stone-500 focus:border-[#EF476F]";

const normalizePlanPayloadValue = (value: string) => {
  const normalized = value.trim();

  if (!normalized) return 0;

  if (normalized.toLowerCase() === "unlimited") return 9999;

  const parsed = Number(normalized.replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildEditablePlanPayload = (plan: Plan) => {
  const toCents = (amount: string) => {
    const numeric = Number.parseFloat(amount || "0");
    return Number.isFinite(numeric) ? Math.round(numeric * 100) : 0;
  };

  const getOptionArray = (row: ModuleRow | undefined, fallback: number[] = []) => {
    if (!row || row.type !== "options") return fallback;

    const value = row.active;

    if (value === "Unlimited") return [];

    const numericValue = normalizePlanPayloadValue(value);
    return numericValue > 0 ? [numericValue] : [];
  };

  const getOptionNumber = (row: ModuleRow | undefined, fallback = 0) => {
    if (!row || row.type !== "options") return fallback;

    const value = row.active;
    if (value === "Unlimited") return 9999;

    return normalizePlanPayloadValue(value);
  };

  const shootStudioSection = plan.moduleSections.find((section) => section.title === "Shoot Studio");
  const modelMarketSection = plan.moduleSections.find((section) => section.title === "Model Market");
  const jobJunctionSection = plan.moduleSections.find((section) => section.title === "Job Junction");
  const universityUnionSection = plan.moduleSections.find((section) => section.title === "University Union");
  const modelMansionSection = plan.moduleSections.find((section) => section.title === "Model Mansion");

  const jobApplicationsPerDayRow = jobJunctionSection?.rows.find(
    (row) => row.label === "Job application per day",
  );
  const jobApplicationsPerMonthRow = jobJunctionSection?.rows.find(
    (row) => row.label === "Job Applications per month",
  );
  const modulesUnlockedRow = universityUnionSection?.rows.find(
    (row) => row.label === "Modules Unlocked",
  );
  const portfolioTierRow = modelMansionSection?.rows.find(
    (row) => row.label === "Portfolio Book Tier",
  );

  return {
    planId: plan._id ?? "",
    key: plan.key,
    name: plan.name,
    description: plan.description,
    isCommitment: Boolean(plan.isCommitment),
    unitAmounts: {
      eur: toCents(plan.price.eur),
      gbp: toCents(plan.price.gbp),
      usd: toCents(plan.price.usd),
    },
    fullAccess: {
      shootStudio: {
        enabled: Boolean(shootStudioSection?.enabled),
        portfolioShoot: Boolean(shootStudioSection?.rows[0]?.type === "toggle" && shootStudioSection.rows[0].enabled),
        customShoot: Boolean(shootStudioSection?.rows[1]?.type === "toggle" && shootStudioSection.rows[1].enabled),
      },
      modelMarket: {
        enabled: Boolean(modelMarketSection?.enabled),
        basicScrollMode: Boolean(modelMarketSection?.rows[0]?.type === "toggle" && modelMarketSection.rows[0].enabled),
        swipeMode: Boolean(modelMarketSection?.rows[1]?.type === "toggle" && modelMarketSection.rows[1].enabled),
      },
      jobJunction: {
        enabled: Boolean(jobJunctionSection?.enabled),
        jobApplicationsPerDay: getOptionArray(jobApplicationsPerDayRow, []),
        jobApplicationsPerMonth: getOptionArray(jobApplicationsPerMonthRow, []),
        basicScrollMode: Boolean(jobJunctionSection?.rows[2]?.type === "toggle" && jobJunctionSection.rows[2].enabled),
        swipeMode: Boolean(jobJunctionSection?.rows[3]?.type === "toggle" && jobJunctionSection.rows[3].enabled),
      },
      universityUnion: {
        enabled: Boolean(universityUnionSection?.enabled),
        personalModelAgent: Boolean(universityUnionSection?.rows[0]?.type === "toggle" && universityUnionSection.rows[0].enabled),
        agentCalls: Boolean(universityUnionSection?.rows[1]?.type === "toggle" && universityUnionSection.rows[1].enabled),
        modulesUnlocked: getOptionArray(modulesUnlockedRow, []),
      },
      modelMansion: {
        enabled: Boolean(modelMansionSection?.enabled),
        achievementCabinet: Boolean(modelMansionSection?.rows[0]?.type === "toggle" && modelMansionSection.rows[0].enabled),
        professionalModelContract: Boolean(modelMansionSection?.rows[1]?.type === "toggle" && modelMansionSection.rows[1].enabled),
        portfolioBookTier: getOptionArray(portfolioTierRow, []),
        modelFeeCalculator: Boolean(modelMansionSection?.rows[3]?.type === "toggle" && modelMansionSection.rows[3].enabled),
      },   
    },
  };
};

const SubscriptionPlans = () => {
  const { data, isLoading } = useGetSubscriptions();
  const updateSubscriptionPlan = useUpdateSubscriptions();
  const [billingMode, setBillingMode] = useState<BillingMode>("commitment");
  const [plans, setPlans] = useState<Plan[]>([]);
  // index into `plans` (not into the filtered list)
  const [activeIndex, setActiveIndex] = useState(0);

  const normalizePlanKey = (key: string) =>
    key.toLowerCase().replace(/\s+/g, "-").replace(/-commitment$/, "");

  const getPlanOrder = (plan: Plan) => {
    const index = planOrder.indexOf(normalizePlanKey(plan.key));
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };

  // Sync API data -> local editable state
  useEffect(() => {
    if (!Array.isArray(data?.plans)) return;

    const mapped: Plan[] = data.plans
      .map(mapPlanToForm)
      .sort((a, b) => getPlanOrder(a) - getPlanOrder(b));

    setPlans(mapped);

    const hasCommitment = mapped.some((plan) => plan.isCommitment);
    const initialMode: BillingMode = hasCommitment ? "commitment" : "flex";
    setBillingMode(initialMode);

    const firstIndex = mapped.findIndex((plan) =>
      initialMode === "commitment" ? plan.isCommitment : !plan.isCommitment,
    );
    setActiveIndex(firstIndex >= 0 ? firstIndex : 0);
  }, [data]);

  // Plans for the current billing mode, keeping their original index
  const filteredPlans = useMemo(() => {
    return plans
      .map((plan, index) => ({ plan, index }))
      .filter(({ plan }) =>
        billingMode === "commitment" ? plan.isCommitment : !plan.isCommitment,
      )
      .sort((a, b) => getPlanOrder(a.plan) - getPlanOrder(b.plan));
  }, [plans, billingMode]);

  const updateActivePlan = (updater: (plan: Plan) => Plan) => {
    setPlans((current) =>
      current.map((plan, index) =>
        index === activeIndex ? updater(plan) : plan,
      ),
    );
  };

  const updateModuleSection = (
    sectionTitle: string,
    rowLabel: string,
    updater: (row: ModuleRow) => ModuleRow,
  ) => {
    setPlans((current) =>
      current.map((plan, index) => {
        if (index !== activeIndex) return plan;

        return {
          ...plan,
          moduleSections: plan.moduleSections.map((section) => {
            if (section.title !== sectionTitle) return section;

            return {
              ...section,
              rows: section.rows.map((row) =>
                row.label === rowLabel ? updater(row) : row,
              ),
            };
          }),
        };
      }),
    );
  };

  const updateModuleSectionToggle = (sectionTitle: string, enabled: boolean) => {
    setPlans((current) =>
      current.map((plan, index) => {
        if (index !== activeIndex) return plan;

        return {
          ...plan,
          moduleSections: plan.moduleSections.map((section) =>
            section.title === sectionTitle ? { ...section, enabled } : section,
          ),
        };
      }),
    );
  };

  if (isLoading) {
    return <Loader />;
  }

  const activePlan =
    plans[activeIndex] ??
    filteredPlans[0]?.plan ??
    plans[0];

  const handleModeChange = (mode: BillingMode) => {
    setBillingMode(mode);
    const nextIndex = plans.findIndex((plan) =>
      mode === "commitment" ? plan.isCommitment : !plan.isCommitment,
    );
    if (nextIndex >= 0) {
      setActiveIndex(nextIndex);
    }
  };

  return (
    <main className="w-full text-stone-200">
      <div className="mb-7 flex h-[34px] w-[270px] overflow-hidden rounded-full bg-[#111111]">
        {(["commitment", "flex"] as BillingMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => handleModeChange(mode)}
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
        {filteredPlans.map(({ plan, index }) => {
          const isSelected = index === activeIndex;

          return (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`border-b pb-2 text-[12px] transition-colors ${
                isSelected
                  ? "border-[#EF476F] text-[#EF476F]"
                  : "border-transparent text-stone-400 hover:text-white"
              }`}
            >
              {plan.key}
            </button>
          );
        })}
      </div>

      {activePlan && (
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
            <div className="grid gap-3 md:grid-cols-3">
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
              <label className="block">
                <div className="mb-2 flex items-center justify-between">
                  <FieldLabel>In USD</FieldLabel>
                  <InfoCircle className="h-4 w-4 text-stone-300" />
                </div>
                <input
                  className={inputClass}
                  value={activePlan.price.usd}
                  onChange={(event) =>
                    updateActivePlan((plan) => ({
                      ...plan,
                      price: { ...plan.price, usd: event.target.value },
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
            {activePlan.moduleSections.map((section) => (
              <ModuleSection
                key={section.title}
                {...section}
                onToggleSection={(enabled) =>
                  updateModuleSectionToggle(section.title, enabled)
                }
                onToggleRow={(rowLabel, enabled) =>
                  updateModuleSection(section.title, rowLabel, (row) =>
                    row.type === "toggle"
                      ? { ...row, enabled }
                      : row,
                  )
                }
                onSelectOption={(rowLabel, value) =>
                  updateModuleSection(section.title, rowLabel, (row) =>
                    row.type === "options" ? { ...row, active: value } : row,
                  )
                }
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={updateSubscriptionPlan.isPending}
            onClick={() => {
              const payload = buildEditablePlanPayload(activePlan);
              updateSubscriptionPlan.mutate(payload);
            }}
            className="mt-10 h-[42px] w-full rounded-[6px] bg-[#EF476F] text-[12px] font-medium uppercase text-white transition-colors hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updateSubscriptionPlan.isPending ? "Saving..." : "SAVE"}
          </button>
        </form>
      )}
    </main>
  );
};

export default SubscriptionPlans;