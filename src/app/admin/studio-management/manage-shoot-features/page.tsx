"use client";

import React from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import { TextEditor } from "../../components/policies/txtEditor";

interface FeatureSection {
  title: string;
  fields: string[];
}

const defaultSections: FeatureSection[] = [
  {
    title: "Shoot Goals",
    fields: ["Type Your Text Here", "Type Your Text Here"],
  },
  {
    title: "Shoot Format",
    fields: ["Type Your Text Here", "Type Your Text Here"],
  },
  { title: "Vibes", fields: ["Type Your Text Here", "Type Your Text Here"] },
  { title: "Outfits", fields: ["Type Your Text Here", "Type Your Text Here"] },
];

const defaultAddOnRows = [
  { feature: "Type Your Text Here", price: "Enter Amount" },
  { feature: "Type Your Text Here", price: "Enter Amount" },
];

const inputClass =
  "h-12 w-full rounded-md border border-stone-700 bg-transparent px-3 text-[11px] text-stone-200 outline-none placeholder:text-stone-500 focus:border-rose-400";

const SectionHeader = ({
  title,
  isOpen,
  onToggle,
}: {
  title: string;
  isOpen?: boolean;
  onToggle?: () => void;
}) => (
  <button
    type="button"
    onClick={onToggle}
    className="flex h-8 w-full items-center justify-between rounded-t-md bg-white/15 px-3 text-left"
  >
    <span className="text-[11px] font-medium text-stone-100">{title}</span>
    {typeof isOpen === "boolean" ? (
      <ChevronDown
        className={`h-3.5 w-3.5 text-stone-300 transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    ) : null}
  </button>
);

const DeleteButton = ({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label="Delete row"
    className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-white transition-colors ${
      disabled
        ? "bg-stone-600 cursor-not-allowed"
        : "bg-rose-500 hover:bg-rose-400"
    }`}
  >
    <Trash2 className="h-3.5 w-3.5" />
  </button>
);

const AddNewLink = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="ml-auto mt-2 block text-[10px] font-medium text-stone-300 underline-offset-2 hover:text-white underline"
  >
    + Add Another
  </button>
);

const TextRowsSection = ({
  title,
  fields,
  isOpen,
  onToggle,
  onFieldChange,
  onAddField,
  onRemoveField,
}: FeatureSection & {
  isOpen: boolean;
  onToggle: () => void;
  onFieldChange: (index: number, value: string) => void;
  onAddField: () => void;
  onRemoveField: (index: number) => void;
}) => (
  <section className="overflow-hidden rounded-md border border-stone-700">
    <SectionHeader title={title} isOpen={isOpen} onToggle={onToggle} />
    {isOpen && (
      <div className="space-y-2 p-3">
        {fields.map((value, index) => (
          <div key={`${title}-${index}`} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                value={value}
                onChange={(e) => onFieldChange(index, e.target.value)}
                className={inputClass}
                placeholder="Type Your Text Here"
              />
            </div>
            <DeleteButton
              onClick={() => onRemoveField(index)}
              disabled={fields.length === 1}
            />
          </div>
        ))}
        <AddNewLink onClick={onAddField} />
      </div>
    )}
  </section>
);

const AddOnFeatureEditor = ({
  values,
  setValues,
}: {
  values: { en: string; nl: string; es: string; fr: string };
  setValues: React.Dispatch<
    React.SetStateAction<{ en: string; nl: string; es: string; fr: string }>
  >;
}) => (
  <section className="overflow-hidden rounded-md border border-stone-700">
    <SectionHeader title="Add On Features" />
    <div className="flex w-full flex-col gap-3 p-3">
      <div className="w-full [&>*]:w-full">
        <TextEditor
          language="English"
          value={values.en}
          setDescription={(content) =>
            setValues((current) => ({ ...current, en: content }))
          }
        />
      </div>
      <div className="w-full [&>*]:w-full">
        <TextEditor
          language="Dutch"
          value={values.nl}
          setDescription={(content) =>
            setValues((current) => ({ ...current, nl: content }))
          }
        />
      </div>
      <div className="w-full [&>*]:w-full">
        <TextEditor
          language="Spanish"
          value={values.es}
          setDescription={(content) =>
            setValues((current) => ({ ...current, es: content }))
          }
        />
      </div>
      <div className="w-full [&>*]:w-full">
        <TextEditor
          language="French"
          value={values.fr}
          setDescription={(content) =>
            setValues((current) => ({ ...current, fr: content }))
          }
        />
      </div>
    </div>
  </section>
);

const ManageShootFeatures = () => {
  const [sectionsData, setSectionsData] =
    React.useState<FeatureSection[]>(defaultSections);
  const [expandedSections, setExpandedSections] = React.useState<
    Record<string, boolean>
  >({
    "Shoot Goals": true,
    "Shoot Format": true,
    Vibes: true,
    Outfits: true,
  });

  const [addOnRows, setAddOnRows] = React.useState(
    defaultAddOnRows.map((row) => ({ feature: "", price: "" })),
  );

  const [addOnFeatureContent, setAddOnFeatureContent] = React.useState({
    en: "",
    nl: "",
    es: "",
    fr: "",
  });

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const addField = (title: string) => {
    setSectionsData((current) =>
      current.map((section) =>
        section.title === title
          ? { ...section, fields: [...section.fields, "Type Your Text Here"] }
          : section,
      ),
    );
  };

  const updateField = (title: string, index: number, value: string) => {
    setSectionsData((current) =>
      current.map((section) => {
        if (section.title !== title) return section;
        const updatedFields = [...section.fields];
        updatedFields[index] = value;
        return { ...section, fields: updatedFields };
      }),
    );
  };

  const removeField = (title: string, index: number) => {
    setSectionsData((current) =>
      current.map((section) => {
        if (section.title !== title) return section;
        if (section.fields.length === 1) return section;
        return {
          ...section,
          fields: section.fields.filter((_, i) => i !== index),
        };
      }),
    );
  };

  const addAddOnRow = () => {
    setAddOnRows((current) => [...current, { feature: "", price: "" }]);
  };

  const updateAddOnRow = (
    index: number,
    field: keyof (typeof defaultAddOnRows)[number],
    value: string,
  ) => {
    setAddOnRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    );
  };

  const removeAddOnRow = (index: number) => {
    setAddOnRows((current) =>
      current.length === 1
        ? current
        : current.filter((_, rowIndex) => rowIndex !== index),
    );
  };

  return (
    <main className="w-full text-stone-200">
      <form className="space-y-4">
        {sectionsData.map((section) => (
          <TextRowsSection
            key={section.title}
            title={section.title}
            fields={section.fields}
            isOpen={!!expandedSections[section.title]}
            onToggle={() => toggleSection(section.title)}
            onFieldChange={(index, value) =>
              updateField(section.title, index, value)
            }
            onAddField={() => addField(section.title)}
            onRemoveField={(index) => removeField(section.title, index)}
          />
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
                    placeholder="Feature"
                    value={row.feature}
                    onChange={(e) =>
                      updateAddOnRow(index, "feature", e.target.value)
                    }
                  />
                </div>
                <input
                  className="h-12 w-full rounded-md border border-stone-700 bg-transparent px-4 text-sm text-stone-200 outline-none placeholder:text-stone-500 focus:border-rose-400"
                  placeholder="Price"
                  value={row.price}
                  onChange={(e) =>
                    updateAddOnRow(index, "price", e.target.value)
                  }
                />
                <DeleteButton
                  onClick={() => removeAddOnRow(index)}
                  disabled={addOnRows.length === 1}
                />
              </div>
            ))}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={addAddOnRow}
                className="inline-flex items-center gap-3 text-xs font-medium text-stone-300 underline-offset-2 hover:text-white underline"
              >
                + Add Another
              </button>
            </div>
          </div>
        </section>

        <AddOnFeatureEditor
          values={addOnFeatureContent}
          setValues={setAddOnFeatureContent}
        />

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
