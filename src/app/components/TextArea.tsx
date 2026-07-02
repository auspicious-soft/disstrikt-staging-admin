"use client";
import React from "react";

interface TextAreaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
}

const TextArea: React.FC<TextAreaProps> = ({
  placeholder = "",
  value,
  onChange,
  className = "",
  rows = 4,
  disabled = false,
  required = false,
}) => {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      disabled={disabled}
      required={required}
      className={`w-full px-4 py-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 placeholder-zinc-400 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none ${className}`}
    />
  );
};

export default TextArea;
