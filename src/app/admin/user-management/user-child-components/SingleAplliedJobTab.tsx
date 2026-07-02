// ./src/app/admin/user-management/user-child-components/SingleAppliedJobTab.tsx
import React, { useState } from "react";
import ImagesTab from "../user-child-components/ImagesTab";
import VideosTab from "../user-child-components/VideosTab";
import dummyImgInTable from "../../../../assets/images/dummyImageInUsers.png";

const TABS = ["Images", "Videos"];

const SingleAppliedJob: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Images");
  const ImagesData = Array(6).fill(dummyImgInTable);

  const renderTabContent = () => {
    switch (activeTab) {
      case "Images":
        return <ImagesTab images={ImagesData} setCards={ImagesData} />; // Pass ImagesData as setCards

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-10 min-h-screen">
      {/* Tab Buttons */}
      <div className="bg-neutral-900 p-[3px] rounded-[50px] outline-offset-[-1px] inline-flex justify-center items-center max-w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`w-40 p-2.5 rounded-[50px] flex justify-center items-center text-xs  transition-all duration-200 cursor-pointer ${
              activeTab === tab
                ? "bg-rose-500 text-white"
                : "outline-offset-[-1px] text-stone-200 "
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dynamic Content Section */}
      <div className="rounded-xl">{renderTabContent()}</div>
    </div>
  );
};

export default SingleAppliedJob;
