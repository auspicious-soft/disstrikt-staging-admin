export const OptionGroup = ({
  options,
  active,
  onSelect,
}: {
  options: string[];
  active: string;
  onSelect: (value: string) => void;
}) => (
  <div className="flex items-center gap-6 text-[10px] text-stone-500">
    {options.map((option) => (
      <button
        key={option}
        type="button"
        onClick={() => onSelect(option)}
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