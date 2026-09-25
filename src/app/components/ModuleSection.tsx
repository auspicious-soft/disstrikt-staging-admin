import { OptionGroup } from "./OptionGroup";
import { Toggle } from "./Toggle";

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
export const ModuleSection = ({
  title,
  enabled = true,
  rows,
  onToggleSection,
  onToggleRow,
  onSelectOption,
}: ModuleSection & {
  onToggleSection?: (enabled: boolean) => void;
  onToggleRow?: (rowLabel: string, enabled: boolean) => void;
  onSelectOption?: (rowLabel: string, value: string) => void;
}) => (
  <section className="overflow-hidden rounded-[6px] border border-[#292324] bg-black/30">
    <div className="flex h-[34px] items-center justify-between bg-white/10 px-3">
      <h2 className="text-sm font-medium text-stone-100">{title}</h2>
      <button
        type="button"
        onClick={() => onToggleSection?.(!enabled)}
        className="flex items-center gap-3 text-xs font-normal text-stone-100"
      >
        <span>Module Enabled</span>
        <Toggle checked={enabled} />
      </button>
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
            <button
              type="button"
              onClick={() => onToggleRow?.(row.label, !(row.enabled ?? false))}
              className="flex items-center gap-3 text-xs font-normal text-stone-100"
            >
              <span>On</span>
              <Toggle checked={row.enabled} />
            </button>
          ) : (
            <OptionGroup
              options={row.options}
              active={row.active}
              onSelect={(value) => onSelectOption?.(row.label, value)}
            />
          )}
        </div>
      ))}
    </div>
  </section>
);