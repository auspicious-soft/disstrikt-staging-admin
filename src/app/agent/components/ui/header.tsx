"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { SidebarTrigger, useSidebar } from "./sidebar";
import { Separator } from "./seperator";
import { useIsMobile } from "../hooks/use-mobile";
import CustomSelect from "@/app/components/CustomSelect";
import { ArrowLeft, ChevronsUpDown } from "lucide-react";
import { useCountry } from "@/app/components/CountryContext";
import Link from "next/link";

interface SelectOption {
  label: string;
  value: string;
}

export function AppHeader() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { country, setCountry } = useCountry();
  const searchParams = useSearchParams();

  const isMobile = useIsMobile();
  const pathSegments = pathname.split("/").filter(Boolean);
  const fromUserId = searchParams.get("fromUserId");
  const fr = searchParams.get("fr");

  const baseCountryOptions: SelectOption[] = [
    { label: "Netherlands", value: "NL" },
    { label: "Belgium", value: "BE" },
    { label: "Spain", value: "ES" },
    { label: "France", value: "FR" },
    { label: "United Kingdom", value: "UK" },
  ];

  // final options with conditional "Clear"
  const countryOptions: SelectOption[] = country
    ? [{ label: "Clear", value: "" }, ...baseCountryOptions]
    : baseCountryOptions;

  let pageName = "Assigned models";

  if (pathname === "/") {
    pageName = "Assigned models";
  } else if (
    pathname.startsWith("/agent/assigned-models") &&
    pathSegments.length > 2
  ) {
    pageName = "Model Mansion";
  } else if(
    pathname.startsWith("/agent/job-junction") ||
    pathSegments.length > 2
  ){
    pageName = "Job Junction";
  } else if(
    pathname.startsWith("/agent/model-market") ||
    pathSegments.length > 2
  ){
    pageName = "Model Market";
  } else if(
    pathname.startsWith("/agent/messages") ||
    pathSegments.length > 2
  ){
    pageName = "Messages";
  } else if(
    pathname.startsWith("/agent/dashboard") ||
    pathSegments.length > 2
  ){
    pageName = "DashBoard";
  }
  

  const showInputField = [
    "/agent/assigned-models",
    "/agent/job-junction",
    "/agent/model-market",
    "/agent/messages",
    "/agent/calls",
  ].some((path) => pathname === path || pathname === `${path}/`);

  let parentPath: string;

  
  return (
    <header className="flex flex-col shrink-0 min-[400px]:flex-row items-start gap-2 sm:gap-3 md:gap-4 lg:gap-5 transition-all ease-linear py-2 px-3 sm:py-3 sm:px-4 md:py-4 md:px-6 lg:py-5 lg:px-8 bg-none justify-between w-full">
      <div className="flex items-center ">
        {isMobile && <SidebarTrigger className="-ml-1 sm:-ml-2" />}
        <Separator
          orientation="vertical"
          className="!h-4 sm:!h-5 md:!h-6 lg:!h-7"
        />
        <h1 className="text-stone-200 text-xl font-ovo sm:text-2xl md:text-3xl font-normal  capitalize truncate max-w-[50vw] sm:max-w-[60vw] md:max-w-[70vw]">
          {(pageName).toUpperCase()}
        </h1>
      </div>
      {showInputField && (
        <div className="flex items-center cursor-pointer w-full min-[400px]:max-w-[40vw] sm:max-w-[30vw] md:max-w-[25vw] lg:max-w-[15vw]">
          <CustomSelect
            options={countryOptions}
            placeholder="Select Country"
            icon={<ChevronsUpDown className="w-3 h-3 sm:w-4 sm:h-4" />}
            value={country}
            onChange={(val) => setCountry(val)}
            hideDefaultArrow
          />
        </div>
      )}
    </header>
  );
}
