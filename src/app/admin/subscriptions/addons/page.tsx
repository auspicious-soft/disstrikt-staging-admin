"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import ButtonSpinner from "@/app/admin/components/ui/ButtonSpinner";
import Loader from "../../components/ui/Loader";
import { SubscriptionTabs } from "../SubscriptionTabs";
import { AddonKey, errorMessage, useAddonProducts, useUpdateAddonProduct } from "@/hooks/useSubscriptionAdmin";

const LANGS = ["en", "nl", "fr", "es"] as const;
const CURRENCIES = ["eur", "gbp", "usd"] as const;

type Draft = {
  name: Record<string, string>;
  description: Record<string, string>;
  prices: Record<string, string>;
  isActive: boolean;
};

const toDraft = (p: any): Draft => ({
  name: Object.fromEntries(LANGS.map((l) => [l, p?.name?.[l] ?? ""])),
  description: Object.fromEntries(LANGS.map((l) => [l, p?.description?.[l] ?? ""])),
  prices: Object.fromEntries(CURRENCIES.map((c) => [c, p?.prices?.[c] != null ? String(p.prices[c]) : ""])),
  isActive: !!p?.isActive,
});

function ProductCard({ product }: { product: any }) {
  const update = useUpdateAddonProduct();
  const [draft, setDraft] = useState<Draft>(toDraft(product));
  const [lang, setLang] = useState<(typeof LANGS)[number]>("en");
  useEffect(() => setDraft(toDraft(product)), [product]);

  const save = () => {
    update.mutate(
      {
        addon: product.addon as AddonKey,
        name: draft.name,
        description: draft.description,
        prices: Object.fromEntries(CURRENCIES.map((c) => [c, draft.prices[c] === "" ? null : Number(draft.prices[c])])),
        ...(product.bookable ? { isActive: draft.isActive } : {}),
      },
      {
        onSuccess: () => toast.success("Add-on saved"),
        onError: (e) => toast.error(errorMessage(e, "Could not save")),
      },
    );
  };

  return (
    <section className="rounded-[8px] border border-[#332C2D] bg-[#111111] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-stone-100">{draft.name.en || product.addon}</h2>
          <p className="text-xs text-stone-400">
            {product.bookable ? `Opens: ${product.opens.join(", ")}` : "Opens no booking type yet: can't be put on sale"}
          </p>
        </div>
        <label className={`flex items-center gap-2 text-sm ${product.bookable ? "" : "opacity-40"}`}>
          <input
            type="checkbox"
            disabled={!product.bookable}
            checked={draft.isActive}
            onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
          />
          On sale in the app
        </label>
      </div>

      <div className="mb-3 flex gap-2 text-xs">
        {LANGS.map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`rounded-full px-3 py-1 ${lang === l ? "bg-[#EF476F] text-white" : "bg-black text-stone-300"}`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-xs text-stone-400">
          Name ({lang})
          <input
            value={draft.name[lang]}
            maxLength={80}
            onChange={(e) => setDraft({ ...draft, name: { ...draft.name, [lang]: e.target.value } })}
            className="mt-1 h-[38px] w-full rounded-[6px] border border-[#332C2D] bg-black px-3 text-sm text-stone-200"
          />
        </label>
        <div className="grid grid-cols-3 gap-2">
          {CURRENCIES.map((c) => (
            <label key={c} className="text-xs text-stone-400">
              Price {c.toUpperCase()}
              <input
                type="number"
                min={0.5}
                step="0.01"
                value={draft.prices[c]}
                placeholder="not sold"
                onChange={(e) => setDraft({ ...draft, prices: { ...draft.prices, [c]: e.target.value } })}
                className="mt-1 h-[38px] w-full rounded-[6px] border border-[#332C2D] bg-black px-3 text-sm text-stone-200"
              />
            </label>
          ))}
        </div>
      </div>
      <label className="mt-3 block text-xs text-stone-400">
        Description ({lang})
        <textarea
          value={draft.description[lang]}
          maxLength={1000}
          rows={3}
          onChange={(e) => setDraft({ ...draft, description: { ...draft.description, [lang]: e.target.value } })}
          className="mt-1 w-full rounded-[6px] border border-[#332C2D] bg-black p-3 text-sm text-stone-200"
        />
      </label>
      <button
        onClick={save}
        disabled={update.isPending}
        className="mt-3 inline-flex h-[38px] items-center justify-center gap-2 rounded-[6px] bg-[#EF476F] px-6 text-xs font-medium uppercase text-white hover:bg-rose-400 disabled:opacity-60"
      >
        {update.isPending && <ButtonSpinner />}
        Save
      </button>
    </section>
  );
}

export default function AddonCatalogPage() {
  const { data = [], isLoading, isError } = useAddonProducts();
  return (
    <main className="w-full space-y-4 text-stone-200">
      <SubscriptionTabs active="addons" />
      <p className="text-xs text-stone-400">
        Models pay by card (Stripe) in the app. One purchase = one booking credit. The buyer's currency follows their
        country (UK: GBP, US: USD, otherwise EUR); a currency without a price is not sold. Prices apply to new purchases
        only.
      </p>
      {isLoading ? (
        <Loader />
      ) : isError ? (
        <p className="text-sm text-rose-300">Could not load the add-on catalog.</p>
      ) : (
        data.map((product: any) => <ProductCard key={product.addon} product={product} />)
      )}
    </main>
  );
}
