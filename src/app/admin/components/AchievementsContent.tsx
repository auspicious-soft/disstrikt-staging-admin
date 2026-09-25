"use client";

import { useGetModelMansionAchievements } from "@/hooks/useModelMansion";
import { formatDate } from "../model-mansion/[id]/format";
import Loader from "./ui/Loader";

type Trophy = {
  _id: string;
  name: string;
  label: string;
  achievedAt: string;
};

export default function AchievementsContent({ modelId }: { modelId: string }) {
  const { data, isPending, isError } = useGetModelMansionAchievements(modelId);
  const trophies: Trophy[] = data?.trophies ?? [];

  if (isPending) return <Loader />;

  if (isError) {
    return (
      <p className="py-8 text-center text-xs text-stone-500">
        Couldn&apos;t load achievements.
      </p>
    );
  }

  if (!trophies.length) {
    return (
      <p className="py-8 text-center text-xs text-stone-500">
        No achievements unlocked yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {trophies.map((item) => (
        <div
          key={item._id}
          className="flex flex-col items-center justify-center rounded-lg border-none bg-none py-8"
        >
          <div className="text-5xl">🏆</div>

          <p className="mt-3 text-sm font-medium text-stone-200">
            {item.label}
          </p>
          <p className="mt-1 text-[11px] text-stone-500">
            {formatDate(item.achievedAt)}
          </p>
        </div>
      ))}
    </div>
  );
}
