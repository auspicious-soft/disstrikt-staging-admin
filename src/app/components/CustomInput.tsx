import React from "react";

interface CustomInputProps {
  placeholder: string;
  icon?: React.ReactElement;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: React.HTMLInputTypeAttribute;
}

const CustomInput: React.FC<CustomInputProps> = ({
  placeholder,
  icon,
  value,
  onChange,
  type,
}) => {
  return (
    <div className="w-full min-[400px]:max-w-[200px] sm:max-w-[250px] h-9 px-4 py-2 rounded-md shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-offset-[-1px] outline-neutral-700 flex justify-start items-center gap-2 overflow-hidden">
      <input
        type={type || "text"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="flex-1 bg-transparent text-neutral-50 text-sm font-medium  leading-tight outline-none"
      />
      {icon && (
        <div className="w-4 h-4 relative opacity-50 overflow-hidden">
          {icon}
        </div>
      )}
    </div>
  );
};

export default CustomInput;
