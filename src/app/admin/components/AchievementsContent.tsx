"use client";

import { Trophy } from "lucide-react";

const achievements = [
  {
    icon: "🏆",
    title: "Foundation Year",
  },
  {
    icon: "🏆",
    title: "Foundation Year",
  },
  {
    icon: "🏆",
    title: "Foundation Year",
  },
];

export default function AchievementsContent() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {achievements.map((item, index) => (
        <div
          key={index}
          className="flex flex-col items-center justify-center rounded-lg border-none bg-none py-8"
        >
          <div className="text-5xl">{item.icon}</div>

          <p className="mt-3 text-sm font-medium text-stone-200">
            {item.title}
          </p>
        </div>
      ))}
    </div>
  );
}