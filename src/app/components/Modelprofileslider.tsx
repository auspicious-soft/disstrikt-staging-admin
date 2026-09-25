"use client";

import Image, { StaticImageData } from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Lock, UnlockIcon } from "lucide-react";
import dummyUserImg from "../../assets/images/dummyUserImg.png";

// Gender-specific measurement diagrams
import maleFrontImg from "../../assets/images/Component 3.svg";
import maleBackImg from "../../assets/images/Component 4.svg";
import femaleFrontImg from "../../assets/images/Component 1.svg";
import femaleBackImg from "../../assets/images/Component 2.svg";
import { User } from "iconoir-react";
import SafeImage from "./SafeImage";
import { resolveMediaUrl } from "@/lib/media";

// Default gender used until this is wired up dynamically
const DEFAULT_GENDER: "male" | "female" = "male";

const sections = [
  {
    title: "Headshot & Measurements",
    subtitle: "Keep the previous headshot layout with measurement fields",
    type: "headshot-measurements",
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
    subtitle: "Clear, front-facing headshot, no sunglasses or filters",
    type: "basic-portfolio",
    cards: [
      { labels: ["Full Body", "Front View"] },
      { labels: ["Side Profile", "Left or Right"] },
      { labels: ["Close Up", "Face Details"] },
      { labels: ["Own Choice", "Your Choice"] },
    ],
  },
  {
    title: "Versatility & Experience",
    subtitle: "Showcase your range (up to 9 photos)",
    type: "versatility",
    cards: Array.from({ length: 9 }, (_, i) => `Photo ${i + 1}`),
  },
  {
    title: "Detailed Measurements",
    subtitle: "Fill in your exact measurements",
    type: "detailed-front",
    fields: [
      "Height",
      "Bust",
      "Waist",
      "Hips",
      "Underbust",
      "Arm Length",
      "Bicep",
      "Wrist",
      "Thigh",
      "Calf",
      "Inseam",
      "Leg Length",
    ],
  },
  {
    title: "Detailed Measurements",
    subtitle: "Fill in your exact measurements",
    type: "detailed-back",
    fields: [
      "Shoulders",
      "Neck",
      "Torso Length",
      "Back Width",
      "Chest",
      "Waist to Hips",
      "Hip to Knee",
      "Ankle",
      "Shoe Size",
      "Dress Size",
      "Hat Size",
    ],
  },
  {
    title: "Videos",
    subtitle: "Add your portfolio videos",
    type: "videos",
    cards: [
      {
        title: "Portfolio Video",
        subtitle: "Standard portfolio video",
        action: "Upload Portfolio Video",
        locked: false,
      },
      {
        title: "Catwalk Video",
        subtitle: "Walk video (required)",
        action: "Complete task to unlock",
        locked: true,
      },
    ],
  },
];

type ModelProfileSliderProps = {
  profileImage?: string | StaticImageData;
  // Real portfolio (admin Model Mansion). undefined keeps the placeholder layout,
  // null means the model hasn't created a portfolio yet.
  portfolio?: any;
  gender?: string | null;
};

// Portfolio field for each label shown in the slider
const HEADSHOT_KEYS: Record<string, string> = {
  Height: "height",
  Bust: "bust",
  Waist: "waist",
  Hips: "hips",
  "Shoe Size": "shoeSize",
  "Hair Color": "hairColor",
  "Eye Color": "eyeColor",
};
const BASIC_PORTFOLIO_KEYS: Record<string, string> = {
  "Full Body": "fullBody",
  "Front View": "frontView",
  "Side Profile": "sideProfile",
  "Left or Right": "leftOrRight",
  "Close Up": "closeUp",
  "Face Details": "faceDetails",
  "Own Choice": "ownChoice",
  "Your Choice": "yourChoice",
};
const DETAILED_KEYS: Record<string, string> = {
  Height: "height",
  Bust: "bust",
  Waist: "waist",
  Hips: "hips",
  Underbust: "underBust",
  "Arm Length": "armLength",
  Bicep: "bicep",
  Wrist: "wrist",
  Thigh: "thigh",
  Calf: "calf",
  Inseam: "inseam",
  "Leg Length": "legLength",
  Shoulders: "shoulders",
  Neck: "neck",
  "Torso Length": "torsoLength",
  "Back Width": "backWidth",
  Chest: "chest",
  "Waist to Hips": "waistToHips",
  "Hip to Knee": "hipToKnee",
  Ankle: "ankle",
  "Shoe Size": "shoeSize",
  "Dress Size": "dressSize",
  "Hat Size": "hatSize",
};
const CM_FIELDS = new Set(["height", "bust", "waist", "hips"]);

const displayValue = (value: any, unit = "") =>
  value === null || value === undefined || value === ""
    ? "-"
    : `${value}${unit && typeof value === "number" ? ` ${unit}` : ""}`;

export default function ModelProfileSlider({
  profileImage,
  portfolio,
  gender,
}: ModelProfileSliderProps) {
  const [index, setIndex] = useState(0);
  const total = sections.length;
  const section = sections[index];
  const hasData = portfolio !== undefined;

  const goPrev = () => setIndex((i) => (i - 1 + total) % total);
  const goNext = () => setIndex((i) => (i + 1) % total);

  const isFemale = hasData
    ? String(gender || "").toUpperCase() === "FEMALE"
    : DEFAULT_GENDER === "female";
  const frontImg = isFemale ? femaleFrontImg : maleFrontImg;
  const backImg = isFemale ? femaleBackImg : maleBackImg;

  if (hasData && !portfolio) {
    return (
      <div className="rounded-lg border border-stone-800 bg-black/10 px-4 py-10 text-center text-sm text-stone-400">
        This model hasn&apos;t created a portfolio yet.
      </div>
    );
  }

  const headshotValue = (label: string, fallback: string) =>
    hasData
      ? displayValue(
          portfolio?.[HEADSHOT_KEYS[label]],
          CM_FIELDS.has(HEADSHOT_KEYS[label]) ? "cm" : "",
        )
      : fallback;

  const detailedValue = (field: string, type: string) => {
    const key = DETAILED_KEYS[field];
    const source =
      type === "detailed-front"
        ? portfolio?.detailedMeasurementsFront
        : portfolio?.detailedMeasurementsBack;
    return displayValue(source?.[key], "cm");
  };

  // Each card shows the uploaded photos of its two labels (first that loads)
  const basicImages = (labels: string[]) =>
    labels
      .map((label) => portfolio?.basicPortfolio?.[BASIC_PORTFOLIO_KEYS[label]])
      .filter(Boolean);

  const versatility: string[] = portfolio?.versatility ?? [];

  // Videos are stored as { url, thumbnail } (older data: a plain string)
  const videoFor = (title: string) => {
    const video =
      title === "Portfolio Video"
        ? portfolio?.videos?.portfolioVideo
        : portfolio?.videos?.catwalkVideo;
    const url = resolveMediaUrl(typeof video === "string" ? video : video?.url);
    const poster = typeof video === "object" ? resolveMediaUrl(video?.thumbnail) : "";
    return url ? { url, poster } : null;
  };

  const unavailable = (
    <div className="flex h-full w-full items-center justify-center rounded border border-dashed border-neutral-800 text-xs text-neutral-600">
      Image unavailable
    </div>
  );

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
        <div className="absolute inset-y-1 left-[-5px] w-4 rounded-l-lg border-y-2 border-l-4 border-[#f0444d]" />
        <div className="absolute inset-y-1 left-0.5 w-4 rounded-l-lg border-y-2 border-l-3 border-[#751f26]" />
        <div className="absolute inset-y-1 right-0.5 w-4 rounded-r-lg border-y-2 border-r-3 border-[#751f26]" />
        <div className="absolute inset-y-1 right-[-5px] w-4 rounded-r-lg border-y-2 border-r-4 border-[#f0444d]" />

        <section className="relative z-10 min-h-[700px] rounded-lg border-5 border-[#37141C] bg-black px-5 py-3.5 shadow-[0_16px_38px_rgba(0,0,0,0.45)]">
          <p className="font-ovo text-2xl font-normal leading-none text-[#EF476F]">
            {String(index + 1).padStart(2, "0")}
          </p>
          <h2 className="mt-2 font-ovo text-2xl font-normal uppercase leading-tight text-[#EF476F]">
            {section.title}
          </h2>

          <p className="text-sm text-neutral-500">{section.subtitle}</p>

          {section.type === "headshot-measurements" ? (
            <div className="mt-4 grid gap-3 md:grid-cols-[300px_1fr] md:items-start">
              <div className="relative h-[400px] w-full overflow-hidden rounded border border-[#273126] bg-neutral-900">
                {typeof profileImage === "string" && profileImage ? (
                  <SafeImage
                    src={profileImage}
                    alt="Model headshot"
                    className="h-full w-full object-cover"
                  />
                ) : profileImage ? (
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
                        ? "min-w-0 h-20 sm:col-span-2"
                        : "min-w-0 h-20 "
                    }
                  >
                    <p className="mb-1 text-xs leading-none text-neutral-400">
                      {item.label}
                    </p>
                    <div className="flex h-12 items-center rounded-sm border border-[#242424] bg-black px-3">
                      <input
                        type="text"
                        value={headshotValue(item.label, item.value)}
                        readOnly
                        className="h-full w-full bg-transparent text-sm font-normal leading-tight text-neutral-400 outline-none placeholder:text-neutral-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : section.type === "basic-portfolio" ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {section.cards.map((card, index) => (
                <div key={index} className="overflow-hidden">
                  <div className="relative h-[220px] overflow-hidden">
                    {hasData ? (
                      basicImages(card.labels).length ? (
                        <SafeImage
                          src={basicImages(card.labels)}
                          alt={card.labels.join(" ")}
                          className="h-full w-full object-cover"
                          placeholder={unavailable}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded border border-dashed border-neutral-800 text-xs text-neutral-600">
                          Not uploaded
                        </div>
                      )
                    ) : profileImage ? (
                      <Image
                        src={dummyUserImg}
                        alt={card.labels.join(" ")}
                        fill
                        sizes="(max-width: 768px) 100vw, 300px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-neutral-600">
                        No photo
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between p-3 pt-2 pb-0 text-center">
                    <p className="text-sm text-neutral-100">
                      {card.labels[0]}
                    </p>
                    <p className="mt-1 text-sm text-neutral-100">
                      {card.labels[1]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : section.type === "versatility" ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {section.cards.map((card, i) => (
                <div
                  key={card}
                  className="flex h-43 items-center justify-center overflow-hidden rounded-xl border border-[#2c2c2c] bg-[#0b0b0b] text-center text-sm text-neutral-300 shadow-sm"
                >
                  {hasData && versatility[i] ? (
                    <SafeImage
                      src={versatility[i]}
                      alt={card}
                      className="h-full w-full object-cover"
                      placeholder={unavailable}
                    />
                  ) : hasData ? (
                    <span className="text-xs text-neutral-600">Not uploaded</span>
                  ) : (
                    card
                  )}
                </div>
              ))}
            </div>
          ) : section.type === "detailed-front" ||
            section.type === "detailed-back" ? (
            <div className="mt-4 grid gap-4 lg:grid-cols-[280px_1fr]">
              <div className="overflow-hidden rounded-xl p-4">
                <div className="relative h-[440px] w-full overflow-hidden">
                  <Image
                    src={section.type === "detailed-front" ? frontImg : backImg}
                    alt={
                      section.type === "detailed-front"
                        ? "Front view measurement guide"
                        : "Back view measurement guide"
                    }
                    fill
                    sizes="(max-width: 768px) 100vw, 280px"
                    className="object-contain p-4"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {section.fields.map((field) => (
                  <div key={field} className="min-w-0">
                    <p className="mb-1 text-xs leading-none text-neutral-400">
                      {field}
                    </p>
                    <div className="flex h-12 items-center rounded-sm border border-[#242424] bg-black px-3">
                      <input
                        type="text"
                        placeholder="cm"
                        value={hasData ? detailedValue(field, section.type) : undefined}
                        readOnly={hasData}
                        className="h-full w-full bg-transparent text-sm font-normal leading-tight text-neutral-400 outline-none placeholder:text-neutral-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : section.type === "videos" ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {section.cards.map((card) => (
                <div
                  key={card.title}
                  className="relative h-100 overflow-hidden rounded-3xl border border-[#2c2c2c] bg-[#090909] p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-neutral-100">
                        {card.title}
                      </p>
                    </div>
                    <div>
                      <p className="mt-1 text-xs text-neutral-500">
                        {card.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex h-82 items-center justify-center overflow-hidden rounded-3xl border border-dashed border-neutral-800 bg-[#0b0b0b] text-center text-sm text-neutral-500">
                    {hasData ? (
                      videoFor(card.title) ? (
                        <video
                          src={videoFor(card.title)!.url}
                          poster={videoFor(card.title)!.poster || undefined}
                          controls
                          className="h-full w-full object-contain"
                        />
                      ) : card.locked && !portfolio?.catWalkEnabled ? (
                        <div className="flex flex-col items-center gap-2">
                          <UnlockIcon className="h-8 w-8 text-[#A93E58]" />
                          <p className="text-[#A93E58]">Locked</p>
                          <p className="text-xs text-neutral-500">
                            Catwalk video unlocks after the Catwalk Training task
                          </p>
                        </div>
                      ) : (
                        <p className="text-neutral-500">Not uploaded</p>
                      )
                    ) : card.locked ? (
                      <div className="flex flex-col items-center gap-2">
                        {/* <div className="rounded-full w-fit bg-[#2a1118] p-2 text-[#ef4b59]"> */}
                        <UnlockIcon className="h-8 w-8 text-[#A93E58]" />
                        {/* </div> */}

                        <div>
                          <p className="mb-2 text-[#A93E58]">Locked</p>
                          <p className="text-xs text-neutral-500">
                            Complete task “Catwalk Training” to unlock this
                            video upload
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <User className="h-8 w-8 text-[#A93E58]" />
                        <p className="text-[#A93E58]">{card.action}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-4 flex items-center justify-center gap-1">
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
