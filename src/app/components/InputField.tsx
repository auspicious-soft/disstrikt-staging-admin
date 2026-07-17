import React from "react";

interface InputFieldProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  maxLength?: number;
}

const InputField: React.FC<InputFieldProps> = ({
  type = "text",
  placeholder = "",
  value,
  onChange,
  className = "",
  disabled = false,
  required = false,
  name="",
  id,
  maxLength,
}) => {
  return (
    <input
      id={id}
      type={type}
      name={name}
      maxLength={maxLength}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={`w-full px-4 py-5 bg-white rounded-[10px] outline outline-rose-100 text-zinc-400 placeholder-zinc-400 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-300 ${className}`}
    />
  );
};

export default InputField;
