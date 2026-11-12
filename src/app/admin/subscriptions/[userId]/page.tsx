"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import ButtonSpinner from "@/app/admin/components/ui/ButtonSpinner";
import Loader from "../../components/ui/Loader";
import {
  ADDON_KEYS,
  ADDON_LABELS,
  AddonKey,
  errorMessage,
  FeatureStatus,
  STATUS_LABELS,
  useGrantAddon,
  useRefundAddon,
  useRevokeAddon,
  useUserAddons,
  useUserEntitlements,
} from "@/hooks/useSubscriptionAdmin";

const formatDate = (value?: string | null, time = false) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        ...(time ? { hour: "2-digit", minute: "2-digit" } : {}),
      })
    : "—";

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

const featureLabel = (key: string) => {
  const [, sub] = key.split(".");
  if (!sub) return "Module access";
  return sub.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
};

const tone = (status: FeatureStatus, access: boolean) =>
  access
    ? "text-emerald-300"
    : status === "ADDON"
      ? "text-amber-300"
      : status === "NOT_YET_AVAILABLE" || status === "NEXT_UPDATE"
        ? "text-stone-500"
        : "text-rose-300";

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-[8px] border border-[#332C2D] bg-[#111111] p-4">
    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-300">{title}</h2>
    {children}
  </section>
);

const addonState = (row: any) => {
  const now = Date.now();
  if (row.status === "PENDING") return { label: "Payment pending", cls: "text-amber-300" };
  if (row.status === "CANCELLED") return { label: "Payment cancelled", cls: "text-stone-500" };
  if (row.status === "REVOKED")
    return { label: row.revokeReason === "REFUNDED" ? "Refunded" : row.revokeReason === "DISPUTED" ? "Disputed" : "Revoked", cls: "text-rose-300" };
  if (row.consumedAt) return { label: "Used", cls: "text-stone-300" };
  if (new Date(row.startsAt).getTime() > now) return { label: "Starts later", cls: "text-sky-300" };
  if (row.expiresAt && new Date(row.expiresAt).getTime() <= now) return { label: "Expired", cls: "text-stone-500" };
  return { label: "Available", cls: "text-emerald-300" };
};

export default function UserAccessPage() {
  const { userId } = useParams<{ userId: string }>();
  const { data, isLoading, isError } = useUserEntitlements(userId);
  const { data: addons = [], isLoading: addonsLoading } = useUserAddons(userId);
  const grant = useGrantAddon(userId);
  const revoke = useRevokeAddon(userId);
  const refund = useRefundAddon(userId);
  const [form, setForm] = useState({ addon: "PORTFOLIO_SHOOT" as AddonKey, quantity: 1, startsAt: "", expiresAt: "", note: "" });

  const grouped = useMemo(() => {
    const out: Record<string, [string, any][]> = {};
    for (const [key, value] of Object.entries<any>(data?.features ?? {})) {
      const moduleKey = key.split(".")[0];
      (out[moduleKey] ??= []).push([key, value]);
    }
    return out;
  }, [data]);

  if (isLoading) return <Loader />;
  if (isError || !data) return <p className="text-sm text-rose-300">Could not load this user's access.</p>;

  const plan = data.plan;
  const sub = data.subscription;
  const isModel = data.applies;

  const submitGrant = () => {
    grant.mutate(
      {
        addon: form.addon,
        quantity: Number(form.quantity),
        ...(form.startsAt ? { startsAt: new Date(form.startsAt).toISOString() } : {}),
        ...(form.expiresAt ? { expiresAt: new Date(form.expiresAt).toISOString() } : {}),
        ...(form.note.trim() ? { note: form.note.trim() } : {}),
      },
      {
        onSuccess: () => {
          toast.success(`Granted ${form.quantity} × ${ADDON_LABELS[form.addon]}`);
          setForm((f) => ({ ...f, quantity: 1, note: "", startsAt: "", expiresAt: "" }));
        },
        onError: (e) => toast.error(errorMessage(e, "Could not grant the add-on")),
      },
    );
  };

  return (
    <main className="w-full space-y-5 text-stone-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/subscriptions" className="text-xs text-stone-400 hover:text-white">
            ← Users & access
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-stone-100">{data.user?.fullName ?? "User"}</h1>
          <p className="text-xs text-stone-400">
            {data.user?.email} · {data.user?.userMode}
            {data.user?.country ? ` · ${data.user.country}` : ""}
          </p>
          <p className="mt-1 text-xs text-stone-400">
            Stripe account:{" "}
            <span className="text-stone-200">
              {data.user?.stripeRegion === "US"
                ? "US"
                : data.user?.stripeRegion === "DEFAULT"
                  ? "Default (EU / UK)"
                  : "Not decided yet (set at the first payment or payout setup)"}
            </span>
          </p>
        </div>
      </div>

      {!isModel && (
        <p className="rounded-[6px] border border-[#332C2D] p-3 text-sm text-stone-300">
          Business accounts have no subscription plan; plan checks don't apply to them.
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Plan">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-stone-400">Current plan</dt>
              <dd className="font-medium text-stone-100">{plan?.planCode ?? "None"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-stone-400">Type</dt>
              <dd>{plan?.planCode ? (plan.planCode.endsWith("-C") ? "Commitment (C)" : "Flexible (F)") : "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-stone-400">Status</dt>
              <dd>
                {sub?.status ?? "none"}
                {sub?.storedStatus && sub.storedStatus !== sub.status ? ` (stored: ${sub.storedStatus}, period ended)` : ""}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-stone-400">{sub?.status === "trialing" ? "Trial ends" : sub?.status === "canceling" ? "Access ends" : "Renews"}</dt>
              <dd>{formatDate(plan?.validUntil ?? (sub?.status === "trialing" ? sub?.trialEnd : sub?.currentPeriodEnd))}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-stone-400">Store</dt>
              <dd>{sub?.deviceType ?? "—"}</dd>
            </div>
            {!data.active && isModel && (
              <p className="pt-1 text-xs text-rose-300">No valid plan ({data.reason}): nothing that needs a plan is open.</p>
            )}
          </dl>
        </Card>

        <Card title="Usage (UTC day / month)">
          {Object.keys(data.usage ?? {}).length === 0 ? (
            <p className="text-sm text-stone-400">No limits apply.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs text-stone-400">
                <tr>
                  <th className="pb-2 text-left">Action</th>
                  <th className="pb-2 text-right">Today</th>
                  <th className="pb-2 text-right">This month</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries<any>(data.usage).map(([action, u]) => (
                  <tr key={action} className="border-t border-[#332C2D]">
                    <td className="py-2">{action.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}</td>
                    <td className="py-2 text-right">
                      {u.usedToday} / {u.dailyLimit === "UNLIMITED" ? "∞" : u.dailyLimit}
                    </td>
                    <td className="py-2 text-right">
                      {u.usedThisMonth} / {u.monthlyLimit === "UNLIMITED" ? "∞" : u.monthlyLimit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Add-on credits">
          <ul className="space-y-2 text-sm">
            {(data.addons ?? []).map((a: any) => (
              <li key={a.addon} className="flex justify-between gap-3">
                <span>{ADDON_LABELS[a.addon as AddonKey] ?? a.addon}</span>
                <span className={a.credits > 0 ? "text-emerald-300" : "text-stone-500"}>
                  {a.credits ?? 0} available · {a.used ?? 0} used
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Feature access">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(grouped).map(([moduleKey, rows]) => (
            <div key={moduleKey}>
              <h3 className="mb-2 text-sm font-medium text-stone-100">{MODULES[moduleKey] ?? moduleKey}</h3>
              <ul className="space-y-1 text-xs">
                {rows.map(([key, f]) => (
                  <li key={key} className="flex justify-between gap-2">
                    <span className="text-stone-300">{featureLabel(key)}</span>
                    <span className={tone(f.status, f.access)}>
                      {f.access ? "Open" : STATUS_LABELS[f.status as FeatureStatus] ?? f.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {data.values && (
          <p className="mt-4 text-xs text-stone-400">
            Portfolio Book pages: {data.values.portfolioBookPages?.join(", ") || "none"} · Model modules:{" "}
            {data.values.universityUnionModules?.join(", ") || "none"} · Cruise discount: {data.values.celebrationCruiseDiscountPercent ?? 0}%
          </p>
        )}
      </Card>

      {isModel && (
        <Card title="Grant add-on credits">
          <div className="grid gap-3 md:grid-cols-5">
            <select
              value={form.addon}
              onChange={(e) => setForm({ ...form, addon: e.target.value as AddonKey })}
              className="h-[38px] rounded-[6px] border border-[#332C2D] bg-black px-3 text-sm"
            >
              {ADDON_KEYS.map((k) => (
                <option key={k} value={k}>
                  {ADDON_LABELS[k]}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              max={20}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              className="h-[38px] rounded-[6px] border border-[#332C2D] bg-black px-3 text-sm"
              aria-label="Quantity"
            />
            <label className="text-xs text-stone-400">
              Starts (optional)
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                className="mt-1 h-[34px] w-full rounded-[6px] border border-[#332C2D] bg-black px-2 text-sm text-stone-200"
              />
            </label>
            <label className="text-xs text-stone-400">
              Expires (optional)
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="mt-1 h-[34px] w-full rounded-[6px] border border-[#332C2D] bg-black px-2 text-sm text-stone-200"
              />
            </label>
            <button
              onClick={submitGrant}
              disabled={grant.isPending}
              className="inline-flex h-[38px] items-center justify-center gap-2 self-end rounded-[6px] bg-[#EF476F] text-xs font-medium uppercase text-white hover:bg-rose-400 disabled:opacity-60"
            >
              {grant.isPending && <ButtonSpinner />}
              Grant
            </button>
          </div>
          <input
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            maxLength={500}
            placeholder="Internal note (why this was granted)"
            className="mt-3 h-[38px] w-full rounded-[6px] border border-[#332C2D] bg-black px-3 text-sm"
          />
          <p className="mt-2 text-xs text-stone-400">
            One credit = one booking of that type. Credits only work while the model has a valid plan. Skill Bootcamp opens no
            booking yet.
          </p>
        </Card>
      )}

      <Card title="Add-on history">
        {addonsLoading ? (
          <Loader />
        ) : addons.length === 0 ? (
          <p className="text-sm text-stone-400">No add-ons yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-xs">
              <thead className="text-stone-400">
                <tr>
                  <th className="pb-2">Add-on</th>
                  <th className="pb-2">State</th>
                  <th className="pb-2">Source</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Transaction</th>
                  <th className="pb-2">Valid</th>
                  <th className="pb-2">Booking</th>
                  <th className="pb-2">Note / by</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {addons.map((row: any) => {
                  const state = addonState(row);
                  const canRefund = row.source === "STRIPE" && row.status === "ACTIVE" && !row.consumedAt;
                  return (
                    <tr key={row._id} className="border-t border-[#332C2D] align-top">
                      <td className="py-2 pr-2">
                        {ADDON_LABELS[row.addon as AddonKey] ?? row.addon}
                        <div className="text-stone-500">{formatDate(row.createdAt, true)}</div>
                      </td>
                      <td className={`py-2 pr-2 ${state.cls}`}>{state.label}</td>
                      <td className="py-2 pr-2">{row.source}</td>
                      <td className="py-2 pr-2">
                        {row.amount != null ? `${row.amount} ${String(row.currency ?? "").toUpperCase()}` : "—"}
                      </td>
                      <td className="py-2 pr-2 font-mono text-[11px] text-stone-400">{row.externalId ?? "—"}</td>
                      <td className="py-2 pr-2">
                        {formatDate(row.startsAt)} → {row.expiresAt ? formatDate(row.expiresAt) : "no end"}
                      </td>
                      <td className="py-2 pr-2">
                        {row.bookingId ? `${row.bookingId.activityType ?? ""} ${formatDate(row.bookingId.date)}` : "—"}
                      </td>
                      <td className="py-2 pr-2 text-stone-400">
                        {row.note ?? ""}
                        {row.grantedBy?.fullName ? <div>by {row.grantedBy.fullName}</div> : null}
                        {row.revokedBy?.fullName ? <div>revoked by {row.revokedBy.fullName}</div> : null}
                      </td>
                      <td className="space-x-2 whitespace-nowrap py-2 text-right">
                        {row.status === "ACTIVE" && !row.consumedAt && (
                          <button
                            disabled={revoke.isPending}
                            onClick={() => {
                              const note = window.prompt("Reason for revoking (internal)") ?? undefined;
                              if (note === undefined) return;
                              revoke.mutate(
                                { addonId: row._id, note },
                                {
                                  onSuccess: () => toast.success("Add-on revoked"),
                                  onError: (e) => toast.error(errorMessage(e, "Could not revoke")),
                                },
                              );
                            }}
                            className="rounded-[6px] border border-[#332C2D] px-2 py-1 hover:border-rose-400"
                          >
                            Revoke
                          </button>
                        )}
                        {canRefund && (
                          <button
                            disabled={refund.isPending}
                            onClick={() => {
                              if (!window.confirm("Refund this payment on Stripe and remove the credit?")) return;
                              refund.mutate(row._id, {
                                onSuccess: () => toast.success("Refunded"),
                                onError: (e) => toast.error(errorMessage(e, "Could not refund")),
                              });
                            }}
                            className="rounded-[6px] border border-[#332C2D] px-2 py-1 hover:border-amber-400"
                          >
                            Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </main>
  );
}
