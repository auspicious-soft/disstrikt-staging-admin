"use client";

import Image, { StaticImageData } from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const sections = [
  {
    title: "Headshot & Mesaurements",
    items: [
      { label: "Height", value: "178 cm" },
      { label: "Bust", value: "82 cm" },
      { label: "Waist", value: "46 cm" },
      { label: "Hips", value: "86 cm" },
      { label: "Shoe Size", value: "39 EU" },
      { label: "Hair Color", value: "Golden" },
      { label: "Eye Color", value: "Green" },
    ],
  },
  {
    title: "Basic Portfolio",
    items: [
      { label: "Agency", value: "Independent" },
      { label: "Location", value: "Milan, IT" },
      { label: "Experience", value: "5 years" },
      { label: "Category", value: "Editorial" },
    ],
  },
  {
    title: "Versatility & Experience",
    items: [
      { label: "Runway", value: "Yes" },
      { label: "Commercial", value: "Yes" },
      { label: "Swimwear", value: "Yes" },
      { label: "Fitness", value: "No" },
    ],
  },
  {
    title: "Detailed Measurements",
    items: [
      { label: "Chest", value: "82 cm" },
      { label: "Inseam", value: "80 cm" },
      { label: "Sleeve", value: "58 cm" },
      { label: "Neck", value: "33 cm" },
    ],
  },
  {
    title: "Videos",
    items: [
      { label: "Reel", value: "Available" },
      { label: "Runway Clip", value: "Available" },
    ],
  },
];

type ModelProfileSliderProps = {
  profileImage?: string | StaticImageData;
};

export default function ModelProfileSlider({
  profileImage,
}: ModelProfileSliderProps) {
  const [index, setIndex] = useState(0);
  const total = sections.length;
  const section = sections[index];

  const goPrev = () => setIndex((i) => (i - 1 + total) % total);
  const goNext = () => setIndex((i) => (i + 1) % total);

  return (
    <div className="relative mx-auto w-full max-w-full py-2">
      <button
        onClick={goPrev}
        aria-label="Previous section"
        className="absolute left-2 top-1/2 z-20 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full  bg-[#fbfbfb] text-[#ef4b59] shadow-sm transition-colors hover:bg-white"
      >
        <ChevronLeft className="h-3 w-3" />
      </button>

      <button
        onClick={goNext}
        aria-label="Next section"
        className="absolute right-2 top-1/2 z-20 flex h-5 w-5 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full  bg-[#fbfbfb] text-[#ef4b59] shadow-sm transition-colors hover:bg-white"
      >
        <ChevronRight className="h-3 w-3" />
      </button>

      <div className="relative px-2">
        <div className="absolute inset-y-0.5 left-0 w-4 rounded-l-lg border-y-2 border-l-2 border-[#f0444d]" />
        <div className="absolute inset-y-0.5 left-1 w-4 rounded-l-lg border-y-2 border-l-2 border-[#751f26]" />
        <div className="absolute inset-y-0.5 right-1 w-4 rounded-r-lg border-y-2 border-r-2 border-[#751f26]" />
        <div className="absolute inset-y-0.5 right-0 w-4 rounded-r-lg border-y-2 border-r-2 border-[#f0444d]" />

        <section className="relative z-10 min-h-[300px] rounded-lg border-3 border-[#37141C] bg-black px-5 py-3.5 shadow-[0_16px_38px_rgba(0,0,0,0.45)]">
          <p className="font-ovo text-2xl font-normal leading-none text-[#EF476F]">
            {String(index + 1).padStart(2, "0")}
          </p>
          <h2 className="mt-2 font-ovo text-2xl font-normal uppercase leading-tight text-[#EF476F]">
            {section.title}
          </h2>

          <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-[300px_1fr] md:items-start">
            <div className="relative h-[300px] w-full overflow-hidden rounded border border-[#273126] bg-neutral-900">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Model headshot"
                  fill
                  sizes="(max-width: 768px) 100vw, 250px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-neutral-600">
                  No photo
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-x-2 gap-y-3 sm:grid-cols-2">
              {section.items.map((item) => (
                <div
                  key={`${section.title}-${item.label}`}
                  className={
                    item.label === "Shoe Size"
                      ? "min-w-0 sm:col-span-2"
                      : "min-w-0"
                  }
                >
                  <p className="mb-1 text-xs leading-none text-neutral-400">
                    {item.label}
                  </p>
                  <div className="flex h-12 items-center rounded-sm border border-[#242424] bg-black px-3">
                    <input
                      type="text"
                      defaultValue={item.value}
                      className="h-full w-full bg-transparent text-sm font-normal leading-tight text-neutral-400 outline-none placeholder:text-neutral-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-center gap-1">
            {sections.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 w-1.5 rounded-full border transition-colors ${
                  i === index
                    ? "border-[#ef4b59] bg-[#ef4b59]"
                    : "border-white/80 bg-transparent"
                }`}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
