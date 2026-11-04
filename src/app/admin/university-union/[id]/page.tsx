"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useGetModelMansionDetails } from "@/hooks/useModelMansion";
import UniversityUnionContent from "../../components/UniversityUnionContent";

// One model's tasks, answers and uploads. Same content as their Model Mansion tab.
const UniversityUnionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: model } = useGetModelMansionDetails(id);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Back"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-700 text-stone-300 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <p className="text-sm font-medium text-white">{model?.fullName || "Model"}</p>
          {model?.agent?.fullName && (
            <p className="text-xs text-stone-400">Agent: {model.agent.fullName}</p>
          )}
        </div>
      </div>

      <UniversityUnionContent modelId={id} />
    </div>
  );
};

export default UniversityUnionDetailPage;
