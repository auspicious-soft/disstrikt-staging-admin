import React from "react";
import ButtonSpinner from "@/app/admin/components/ui/ButtonSpinner";

interface ArrowButtonProps {
  text: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  // Shows a spinner and disables the button (e.g. while a request runs)
  loading?: boolean;
}

const ArrowButton: React.FC<ArrowButtonProps> = ({
  text,
  onClick,
  type = "button",
  disabled = false,
  loading = false,
}) => {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={`self-stretch px-2.5 py-4 bg-rose-500 rounded-[10px] inline-flex justify-center items-center gap-2.5 transition-opacity ${isDisabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {loading && <ButtonSpinner className="text-white" />}
      <span className="text-[#FFFFFF] text-sm font-medium ">{text}</span>
    </button>
  );
};

export default ArrowButton;
