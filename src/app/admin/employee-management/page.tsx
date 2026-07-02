"use client";
import React, { useState } from "react";
import CreateEmployee from "./employee-child-components/CreateEmployee";
import GetAllEmployees from "./employee-child-components/GetAllEmployees";

function Page() {
  const [activeTab, setActiveTab] = useState("Get All Employees");
  const TABS = ["Get All Employees", "Create Employee"];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Get All Employees":
        return <GetAllEmployees />;
      case "Create Employee":
        return (
          <>
            <CreateEmployee
              onSuccess={() => setActiveTab("Get All Employees")}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-neutral-900 p-[3px] rounded-[30px] sm:rounded-[40px] md:rounded-[50px] inline-flex flex-wrap justify-center items-center gap-2 max-w-full">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-[100px] sm:min-w-[150px] p-2 sm:p-2.5 rounded-[30px] sm:rounded-[40px] md:rounded-[50px] text-xs sm:text-sm  transition-all duration-200 cursor-pointer text-center ${
              activeTab === tab
                ? "bg-rose-500 text-white"
                : "outline-offset-[-1px] text-stone-200 hover:bg-neutral-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="rounded-xl w-full">{renderTabContent()}</div>
    </>
  );
}

export default Page;
