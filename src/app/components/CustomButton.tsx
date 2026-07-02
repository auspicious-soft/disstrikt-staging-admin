import React from 'react';

interface CustomButtonProps {
  label: string;
  variant?: 'Default' | 'Outline' | 'Ghost';
  size?: 'Small' | 'Medium';
  state?: 'Default' | 'Disabled';
  style?: 'Default' | 'New York';
  onClick?: () => void;
  bgColor?: string;
  textColor?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  variant = 'Default',
  size = 'Small',
  state = 'Default',
  style = 'Default',
  onClick,
  bgColor = 'bg-neutral-800',
  textColor = 'text-stone-200',
}) => {
  const variantStyles = {
    Default: `${bgColor} rounded-md`,
    Outline: `border border-stone-700 ${bgColor} rounded-md`,
    Ghost: `bg-neutral-800 rounded-md`,
  };
  const sizeStyles = {
    Small: 'w-full min-[400px]:max-w-[200px] sm:max-w-[250px] h-8 px-4 py-2 text-xs',
    Medium: 'w-full min-[400px]:max-w-[200px] sm:max-w-[250px] h-9 px-4 py-2 text-sm',
  };
  const stateStyles = {
    Default: '',
    Disabled: 'opacity-50 cursor-not-allowed',
  };
  const styleStyles = {
    Default: 'font-["Kodchasan"] font-normal',
    'New York': 'font-["Inter"] font-medium leading-none',
  };

  return (
    <div
      data-size={size}
      data-state={state}
      data-style={style}
      data-variant={variant}
      className={`flex justify-center cursor-pointer items-center gap-2 ${variantStyles[variant]} ${sizeStyles[size]} ${stateStyles[state]} ${styleStyles[style]} ${textColor}`}
      onClick={state !== 'Disabled' ? onClick : null}
    >
      <span>{label}</span>
    </div>
  );
};

export default CustomButton;