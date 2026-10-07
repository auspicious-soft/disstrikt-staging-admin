"use client";
import React from "react";
import { motion } from "framer-motion";

/**
 * Page loader. By default it fills the content area under the page heading,
 * so the sidebar and header stay visible. `fullScreen` covers the whole
 * window (auth pages, which have no layout around them).
 */
const Loader = ({
  fullScreen = false,
  label,
  className = "",
}: {
  fullScreen?: boolean;
  label?: string;
  className?: string;
}) => {
  const spinner = (
    <motion.div
      className="w-10 h-10 border-4 border-white/20 border-t-rose-500 rounded-full"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-xl z-[9999]">
        {spinner}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex min-h-[50vh] w-full flex-col items-center justify-center gap-3 ${className}`}
    >
      {spinner}
      <span className="text-xs text-stone-400">{label ?? "Loading..."}</span>
    </div>
  );
};

export default Loader;
