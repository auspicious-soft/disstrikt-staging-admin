import React, { ReactElement } from "react";

interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  placeholder: string;
  icon?: ReactElement;
  value: string;
  onChange: (value: string) => void;
  hideDefaultArrow?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  placeholder,
  icon,
  value,
  onChange,
  hideDefaultArrow = false,
}) => {
  return (
    <div className="w-full min-[400px]:max-w-[200px] sm:max-w-[250px] h-8 sm:h-9 p-2 rounded-md outline outline-offset-[-1px] outline-neutral-700 flex justify-between items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`bg-transparent text-stone-200 text-xs sm:text-sm font-medium  leading-tight outline-none w-full cursor-pointer px-2 ${
          hideDefaultArrow ? "appearance-none" : ""
        }`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option, index) => (
          <option
            key={index}
            value={option.value}
            className="text-stone-200 bg-neutral-800 cursor-pointer"
          >
            {option.label}
          </option>
        ))}
      </select>

      {icon && hideDefaultArrow && (
        <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
          {icon}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
