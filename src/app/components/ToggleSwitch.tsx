"use client";
import { motion } from "framer-motion";

interface ToggleSwitchProps {
  isOn: boolean;
  onToggle: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isOn, onToggle }) => {
  return (
    <div
      onClick={onToggle}
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
        isOn ? "bg-green-500" : "bg-red-500"
      }`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-4 h-4 bg-white rounded-full shadow-md"
        style={{ marginLeft: isOn ? "1.5rem" : "0" }}
      />
    </div>
  );
};

export default ToggleSwitch;
