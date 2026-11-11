"use client";

import { STATUS_LABELS, FeatureStatus, useEntitlementMatrix } from "@/hooks/useSubscriptionAdmin";

const MODULES: Record<string, string> = {
  universityUnion: "University Union",
  modelMansion: "Model Mansion",
  shootStudio: "Shoot Studio",
  modelMarket: "Model Market",
  jobJunction: "Job Junction",
  trainingTheater: "Training Theater",
  disstriktDome: "Disstrikt Dome",
  celebrationCruise: "Celebration Cruise",
};

const label = (key: string) => {
  const sub = key.split(".")[1];
  if (!sub) return "Module access";
  return sub.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
};

const limit = (value: number | string) => (value === "UNLIMITED" ? "Unlimited" : String(value));

/**
 * What a plan includes, read-only. Access is decided on the server by the
 * entitlement matrix (backend entitlement-matrix.ts), so the old per-plan
 * module switches no longer change anything and are not shown.
 */
export function PlanEntitlements({ planKey }: { planKey: string }) {
  const { data, isLoading, isError } = useEntitlementMatrix();
  if (isLoading) return <p className="text-xs text-stone-400">Loading what this plan includes…</p>;
  if (isError || !data) return <p className="text-xs text-rose-300">Could not load the plan's access.</p>;

  // The F and C plan of a group share one entry
  const baseKey = planKey.replace(/-commitment$/, "");
  const group = data.plans?.[baseKey]?.group ?? data.plans?.[planKey]?.group;
  const entitlements = group ? data.groups?.[group] : null;
  if (!entitlements) return <p className="text-xs text-rose-300">This plan key has no access defined.</p>;

  const byModule: Record<string, string[]> = {};
  for (const feature of data.features as string[]) (byModule[feature.split(".")[0]] ??= []).push(feature);


  return (
    <section className="rounded-[6px] border border-[#332C2D] p-3">
      <div className="mb-3">
        <h3 className="text-sm font-medium text-stone-100">What this plan includes ({group}-F and {group}-C)</h3>
        <p className="text-xs text-stone-400">
          Read-only. Access, limits and add-on rules are set in the backend and enforced on every request; the flexible and
          commitment plans of a group get the same access. Ask the development team to change them.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Object.entries(byModule).map(([moduleKey, features]) => (
          <div key={moduleKey}>
            <h4 className="mb-1 text-xs font-semibold uppercase text-stone-300">{MODULES[moduleKey] ?? moduleKey}</h4>
            <ul className="space-y-0.5 text-xs">
              {features.map((f) => {
                const status = entitlements.features[f] as FeatureStatus;
                return (
                  <li key={f} className="flex justify-between gap-2">
                    <span className="text-stone-400">{label(f)}</span>
                    <span className={status === "FULL" ? "text-emerald-300" : status === "ADDON" ? "text-amber-300" : "text-stone-500"}>
                      {STATUS_LABELS[status] ?? status}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-2 text-xs text-stone-300 md:grid-cols-3">
        <p>
          Job applications: {limit(entitlements.limits.jobApplication.daily)} / day,{" "}
          {limit(entitlements.limits.jobApplication.monthly)} / month
        </p>
        <p>
          Collaboration requests: {limit(entitlements.limits.collabRequest.daily)} / day,{" "}
          {limit(entitlements.limits.collabRequest.monthly)} / month
        </p>
        <p>
          Agency applications: {limit(entitlements.limits.agencyApplication.daily)} / day,{" "}
          {limit(entitlements.limits.agencyApplication.monthly)} / month
        </p>
        <p>Portfolio Book pages: {entitlements.values.portfolioBookPages.join(", ")}</p>
        <p>Model modules: {entitlements.values.universityUnionModules.join(", ")}</p>
        <p>Celebration Cruise discount: {entitlements.values.celebrationCruiseDiscountPercent}%</p>
      </div>
    </section>
  );
}
