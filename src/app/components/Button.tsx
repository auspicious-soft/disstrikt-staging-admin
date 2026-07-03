import React from "react";
import { MoveRight } from "lucide-react";

interface ArrowButtonProps {
  text: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const ArrowButton: React.FC<ArrowButtonProps> = ({
  text,
  onClick,
  type = "button",
  disabled = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={`self-stretch px-2.5 py-4 bg-rose-500 rounded-[10px] inline-flex justify-center items-center gap-2.5 transition-opacity ${disabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span className="text-[#FFFFFF] text-sm font-medium ">{text}</span>
      <span className="w-4 h-5 relative origin-top-left overflow-hidden flex items-center justify-center">
        {/* <MoveRight
          className=" text-[#FFFFFF]"
          //   style={{ transform: 'rotate(0deg)' }}
        /> */}
      </span>
    </button>
  );
};

export default ArrowButton;
