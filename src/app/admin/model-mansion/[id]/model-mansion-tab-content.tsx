"use client";

import AchievementsContent from "../../components/AchievementsContent";
import UniversityUnionContent from "../../components/UniversityUnionContent";
import BookingsContent from "../../components/BookingsContent";
import NotificationsContent from "./NotificationsContent";
import LikesSavesContent from "./LikesSavesContent";
import ModelChatContent from "./ModelChatContent";
import ModelProfileSlider from "@/app/components/Modelprofileslider";
import { formatName } from "@/lib/media";

type TabContentProps = {
  activeTab: string;
  model: any;
};

// Collab requests have no backend feature yet; their designed UI
// (CollabRequestsContent) is kept for when it does.
const NotAvailable = ({ feature }: { feature: string }) => (
  <div className="rounded-lg border border-stone-800 bg-black/10 px-4 py-10 text-center">
    <p className="text-sm text-stone-300">{feature} isn&apos;t available yet.</p>
    <p className="mt-1 text-xs text-stone-500">
      There is no {feature.toLowerCase()} data in the app to show here.
    </p>
  </div>
);

const ModelMansionTabContent = ({ activeTab, model }: TabContentProps) => {
  const modelId = String(model?._id || "");

  return (
    <div className="w-full flex flex-col gap-2">
      {activeTab === "Achievements" ? (
        <AchievementsContent modelId={modelId} />
      ) : activeTab === "University Union" ? (
        <UniversityUnionContent modelId={modelId} />
      ) : activeTab === "Bookings" ? (
        <BookingsContent modelId={modelId} />
      ) : activeTab === "Collab Requests" ? (
        <NotAvailable feature="Collab Requests" />
      ) : activeTab === "Notifications" ? (
        <NotificationsContent modelId={modelId} language={model?.language} />
      ) : activeTab === "Likes & Saves" ? (
        <LikesSavesContent modelId={modelId} />
      ) : activeTab === "Chat" ? (
        <ModelChatContent modelId={modelId} modelName={formatName(model?.fullName) || "Model"} />
      ) : (
        <ModelProfileSlider
          profileImage={model?.portfolio?.headshot || model?.image || undefined}
          portfolio={model?.portfolio}
          gender={model?.gender}
        />
      )}
    </div>
  );
};

export default ModelMansionTabContent;
