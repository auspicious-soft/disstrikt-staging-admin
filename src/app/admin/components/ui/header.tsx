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

  let pageName = "Dashboard";

  if (pathname === "/") {
    pageName = "Dashboard";
  } else if (
    pathname.startsWith("/admin/dashboard/") &&
    pathSegments.length === 2
  ) {
    pageName = "Dashboard";
  } else if (pathname.startsWith("/admin/user-management/review-task")) {
    if (fr === "review-tasks") {
      // 🔑 special case when query param exists
      pageName = "Review Task";
    } else if (pathSegments.length > 3) {
      pageName = "Review Task";
    } else {
      pageName = "Review Tasks";
    }
  } else if (pathname.startsWith("/admin/user-management")) {
    pageName = "User Management";
  } else if (pathname.startsWith("/admin/employee-management")) {
    pageName = "Employee Management";
  } else if (
    pathname.startsWith("/admin/review-tasks") &&
    pathSegments.length === 2
  ) {
    pageName = "Review Tasks";
  } else if (pathname === "/admin/job-management/post-job") {
    pageName = "Post a Job";
  } else if (pathname.startsWith("/admin/job-management")) {
    pageName = "Job Management";
  } else if (pathname.startsWith("/admin/task-management")) {
    pageName = "Task Management";
  } else if (pathname === "/admin/manage-studios/add-studio") {
    pageName = "Add a Studio";
  } else if (pathname === "/admin/manage-studios/studios-features") {
    pageName = "Manage Shoot Features";
  } else if (pathname.startsWith("/admin/manage-studios")) {
    pageName = "Studio Management";
  } else if (pathname.startsWith("/admin/activities/review-activity")) {
    pageName = "Review Activity";
  } else if (pathname.startsWith("/admin/activities")) {
    pageName = "Activities";
  } else if (pathname.startsWith("/admin/training-theater/edit-booking")) {
    pageName = "Edit Booking";
  } else if (pathname.startsWith("/admin/training-theater/review-activity")) {
    pageName = "Review Activity";
  } else if (pathname.startsWith("/admin/shoot-studio/review-activity")) {
    pageName = "Review Activity";
  } else if (pathname.startsWith("/admin/shoot-studio/edit-booking")) {
    pageName = "Review Activity";
  } else if (pathname.startsWith("/admin/university-union") &&
    pathSegments.length > 2) {
    pageName = "Progress Overview";
  } else if (pathname.startsWith("/admin/disstriktonites") &&
    pathSegments.length > 2 && pathSegments[2] !== "add") {
    pageName = "ADD NEW ROLE";
  } else if (pathname.startsWith("/admin/disstriktonites/add")) {
    pageName = "Add Disstriktonites";
  } else if (pathname.startsWith("/admin/celebration-cruise") &&
    pathSegments.length > 2 && pathSegments[2] !== "create-event") {
    pageName = "Celebration Cruise";
  } else if (pathname.startsWith("/admin/training-theater")) {
    pageName = "Training Theater";
  } else if (pathname.startsWith("/admin/model-market")) {
    pageName = "Model Market";
  } else if (
    pathname.startsWith("/admin/revenue") &&
    pathSegments.length === 2
  ) {
    pageName = "Revenue";
  } else if (
    pathname.startsWith("/admin/subscription-plans") &&
    pathSegments.length === 2
  ) {
    pageName = "Subscription Plan";
  } else {
    pageName = pathSegments.pop()?.replace(/-/g, " ") ?? "";
  }

  const showInputField = [
    "/admin/user-management",
    "/admin/job-junction",
    "/admin/model-mansion",
    "/admin/shoot-studio",
    "/admin/university-union",
    "/admin/model-market",
  ].some((path) => pathname === path || pathname === `${path}/`);

  let parentPath: string;

  // 🔑 Highest priority: explicit query overrides
  if (searchParams.get("from")) {
    parentPath = searchParams.get("from")!;
  } else if (fr === "review-tasks") {
    parentPath = "/admin/review-tasks";
  } else if (fromUserId) {
    parentPath = `/admin/user-management/${fromUserId}`;
  } else if (fr === "JobEntitites") {
    parentPath = `/admin/job-applicants`;
  } else if (pathname.startsWith("/admin/activities/review-activity")) {
    parentPath = "/admin/activities";
  } else {
    // fallback → go one level up
    parentPath = "/" + pathSegments.slice(0, -1).join("/");
  }
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
