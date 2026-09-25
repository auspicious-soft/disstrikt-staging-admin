export const Toggle = ({ checked = true }: { checked?: boolean }) => (
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