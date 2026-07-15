"use client";

import React from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Italic,
  Link,
  List,
  Trash2,
  Underline,
} from "lucide-react";

interface FeatureSection {
  title: string;
  fields: string[];
}

const sections: FeatureSection[] = [
  { title: "Shoot Goals", fields: ["Type Your Text Here", "Type Your Text Here"] },
  { title: "Shoot Format", fields: ["Type Your Text Here", "Type Your Text Here"] },
  { title: "Vibes", fields: ["Type Your Text Here", "Type Your Text Here"] },
  { title: "Outfits", fields: ["Type Your Text Here", "Type Your Text Here"] },
];

const addOnRows = [
  { feature: "Type Your Text Here", price: "Enter Amount" },
  { feature: "Type Your Text Here", price: "Enter Amount" },
];

const inputClass =
  "h-12 w-full rounded-md border border-stone-700 bg-transparent px-3 text-[11px] text-stone-200 outline-none placeholder:text-stone-500 focus:border-rose-400";

const SectionHeader = ({ title }: { title: string }) => (
  <button
    type="button"
    className="flex h-8 w-full items-center justify-between rounded-t-md bg-white/15 px-3 text-left"
  >
    <span className="text-[11px] font-medium text-stone-100">{title}</span>
    <ChevronDown className="h-3.5 w-3.5 text-stone-300" />
  </button>
);

const DeleteButton = () => (
  <button
    type="button"
    aria-label="Delete row"
    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded bg-rose-500 text-white transition-colors hover:bg-rose-400"
  >
    <Trash2 className="h-3.5 w-3.5" />
  </button>
);

const AddNewLink = () => (
  <button
    type="button"
    className="ml-auto mt-2 block text-[10px] font-medium text-stone-300 underline-offset-2 hover:text-white underline"
  >
    + Add Another
  </button>
);

const TextRowsSection = ({ title, fields }: FeatureSection) => (
  <section className="overflow-hidden rounded-md border border-stone-700">
    <SectionHeader title={title} />
    <div className="space-y-2 p-3">
      {fields.map((placeholder, index) => (
        <div key={`${title}-${index}`} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input className={inputClass} placeholder={placeholder} />
            
          </div>
          <DeleteButton />
        </div>
      ))}
      <AddNewLink />
    </div>
  </section>
);

const EditorToolbar = () => {
  const icons = [
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
  ];

  return (
    <div className="flex h-8 items-center gap-1 border-b border-stone-800 px-3 text-stone-500">
      <span className="mr-2 text-[10px] text-stone-500">Normal</span>
      {icons.map((Icon, index) => (
        <button
          key={index}
          type="button"
          className="inline-flex h-5 w-5 items-center justify-center rounded hover:bg-white/10 hover:text-stone-200"
        >
          <Icon className="h-3 w-3" />
        </button>
      ))}
    </div>
  );
};

const PolicyEditor = () => (
  <section className="overflow-hidden rounded-md border border-stone-700">
    <SectionHeader title="Add On Features" />
    <div className="space-y-2 p-3">
      <div className="overflow-hidden rounded-md border border-stone-800 bg-neutral-950/30">
        <button
          type="button"
          className="flex h-8 w-full items-center justify-between px-3 text-left text-[11px] font-medium text-stone-200"
        >
          English
          <ChevronDown className="h-3.5 w-3.5 text-stone-300" />
        </button>
        <EditorToolbar />
        <div className="h-52" />
      </div>

      <button
        type="button"
        className="flex h-8 w-full items-center justify-between rounded-md border border-stone-800 px-3 text-left text-[11px] font-medium text-stone-200"
      >
        Dutch
        <ChevronDown className="h-3.5 w-3.5 text-stone-300" />
      </button>
    </div>
  </section>
);

const ManageShootFeatures = () => {
  return (
    <main className="w-full text-stone-200">
      <form className="space-y-4">
        {sections.map((section) => (
          <TextRowsSection key={section.title} {...section} />
        ))}

        <section className="overflow-hidden rounded-xl border border-stone-700">
          <SectionHeader title="Add On Features" />
          <div className="space-y-3 px-5 py-4">
            {addOnRows.map((row, index) => (
              <div
                key={index}
                className="grid items-center gap-3 sm:grid-cols-[1fr_1fr_32px]"
              >
                <div className="relative">
                  <input
                    className="h-12 w-full rounded-md border border-stone-700 bg-transparent px-4 text-sm text-stone-200 outline-none placeholder:text-stone-500 focus:border-rose-400"
                    placeholder={row.feature}
                  />
                </div>
                <input
                  className="h-12 w-full rounded-md border border-stone-700 bg-transparent px-4 text-sm text-stone-200 outline-none placeholder:text-stone-500 focus:border-rose-400"
                  placeholder={row.price}
                />
                <DeleteButton />
              </div>
            ))}
            <div className="flex justify-end">
              <button
                type="button"
                className="inline-flex items-center gap-3 text-xs font-medium text-stone-300 underline-offset-2 hover:text-white hover:underline"
              >
                <span className="text-base leading-none">+</span>
                Add Another
              </button>
            </div>
          </div>
        </section>

        <PolicyEditor />

        <div className="grid gap-3 sm:grid-cols-[minmax(160px,315px)_1fr]">
          <button
            type="button"
            className="h-9 rounded-md border border-stone-700 text-xs font-medium text-stone-200 transition-colors hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-9 rounded-md bg-rose-500 text-xs font-medium text-white transition-colors hover:bg-rose-400"
          >
            Save
          </button>
        </div>
      </form>
    </main>
  );
};

export default ManageShootFeatures;
