"use client";

import * as React from "react";
import { NavMain } from "./nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "./ui/sidebar";
import AppLogo from "./app-logo";
import { SettingsIcon, UsersIcon } from "../../../lib/icons";
import TripleDotIcon from "../././../../assets/icons/ThreeDots.png";
import { useRouter } from "next/navigation";
import Loader from "./ui/Loader";
import {
  Camera,
  ChatLines,
  GraduationCap,
  HomeSimple,
  ListSelect,
  Phone,
  ShoppingBag,
  ShopWindow,
} from "iconoir-react";
import SettingsModal from "./SettingModal";
import Link from "next/link";
import Image from "next/image";
import Logo from "../../../assets/images/Logo.png";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const { isMobile, state, setOpen, setOpenMobile } = useSidebar();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const userRole = "ADMIN";
  // Use useMemo to recalculate dataa whenever userRole changes
  const dataa = React.useMemo(() => {
    return {
      user: {
        name: "Kane",
        profile: "Admin",
        avatar: "https://github.com/shadcn.png",
      },
      navMain: [
        {
          title: "Dashboard",
          url: "/agent/dashboard",
          icon: () => <HomeSimple />,
        },
        {
          title: "Assigned Models",
          url: "/agent/assigned-models",
          icon: () => <UsersIcon />,
        },
        {
          title: "Job Junction",
          url: "/agent/job-junction",
          icon: () => <ShoppingBag />,
        },
        {
          title: "Model Market",
          url: "/agent/model-market",
          icon: () => <ShopWindow />,
        },
        {
          title: "Messages",
          url: "/agent/messages",
          icon: () => <ChatLines />,
        },
        {
          title: "Calls",
          url: "/agent/calls",
          icon: () => <Phone />,
        },
      ],
      projects: [
        {
          title: "Settings",
          url: "/",
          icon: SettingsIcon,
        },
      ],
    };
  }, [userRole]);

  // 🔹 Prevent scrolling when modal is open
  React.useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isModalOpen]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      localStorage.removeItem("token");
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="relative shrink-0">
            <Sidebar
              collapsible="icon"
              {...props}
              className="transition-all duration-300 ease-in-out "
            >
              <SidebarHeader
                className={
                  !isMobile && state === "expanded"
                    ? "flex items-center justify-between px-[26px] pt-[2px] pb-[2px]"
                    : "flex items-center justify-between pt-[2px] pb-[10px] pl-[12px]"
                }
              >
                {state === "expanded" && (
                  <div className="inline-block group-data-[collapsible=icon]:opacity-0">
                    <Link href="/agent/dashboard" className="w-max block">
                      <Image
                        src={Logo}
                        alt="Logo"
                        width={0}
                        height={0}
                        sizes="100vw"
                        className="h-18 w-26"
                      />
                    </Link>
                  </div>
                )}
                {(isMobile || state === "collapsed") && (
                  <SidebarTrigger className="sidebar-trigger-collapse" />
                )}
                {!isMobile && state === "expanded" && (
                  <SidebarTrigger className="sidebar-trigger-collapse" />
                )}
              </SidebarHeader>

              <SidebarContent>
                <NavMain
                  items={dataa.navMain.map((item) => {
                    // For non-admin, intercept Logout click to show modal
                    if (userRole !== "ADMIN" && item.title === "Logout") {
                      return {
                        ...item,
                        onClick: (e: React.MouseEvent) => {
                          e.preventDefault();
                          setShowLogoutConfirm(true);
                        },
                      };
                    }
                    return item;
                  })}
                />
              </SidebarContent>

              {/* ✅ Render footer only for ADMIN */}
              {userRole === "ADMIN" && (
                <SidebarFooter>
                  {state === "expanded" ? (
                    <div
                      className="self-stretch px-2 py-2 border-t border-stone-700 inline-flex justify-between items-center cursor-pointer"
                      onClick={() => {
                        setIsModalOpen(!isModalOpen);
                        if (isMobile) setOpenMobile(false); // <-- Close sidebar on mobile
                      }}
                    >
                      <div className="flex justify-start items-center gap-2.5">
                        <div className="w-8 h-8 relative overflow-hidden">
                          <SettingsIcon />
                        </div>
                        <div className="justify-start text-stone-200 text-base font-semibold  mb-[4px]">
                          Settings
                        </div>
                      </div>
                      <div
                        className="w-5 h-5 relative overflow-hidden cursor-pointer"
                        onClick={() => {
                          setIsModalOpen(!isModalOpen);
                          if (isMobile) setOpenMobile(false); // <-- Close sidebar on mobile
                        }}
                      >
                        <img src={TripleDotIcon.src} alt="More options" />
                      </div>
                    </div>
                  ) : (
                    <div
                      className="self-stretch px-2 py-2 border-t border-stone-700 inline-flex justify-center items-center cursor-pointer"
                      onClick={() => setIsModalOpen(!isModalOpen)}
                    >
                      <div className="w-8 h-8 relative overflow-hidden">
                        <SettingsIcon />
                      </div>
                    </div>
                  )}
                </SidebarFooter>
              )}
            </Sidebar>

            {showLogoutConfirm && (
              <>
                <div className="fixed inset-0 bg-black/60 z-50"></div>
                <div className="fixed inset-0 flex items-center justify-center z-50">
                  <div className="bg-stone-950 rounded-xl p-6 w-80 shadow-lg text-center border border-stone-700">
                    <h3 className="text-lg font-semibold text-stone-200 mb-3">
                      Confirm Logout
                    </h3>
                    <p className="text-sm text-stone-400 mb-6">
                      Are you sure you want to log out?
                    </p>
                    <div className="flex justify-between gap-4">
                      <button
                        className="flex-1 py-2 rounded-lg border border-stone-600 text-stone-300 hover:bg-stone-800 cursor-pointer"
                        onClick={() => setShowLogoutConfirm(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="flex-1 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 cursor-pointer"
                        onClick={handleLogout}
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {isModalOpen && (
              <div className="fixed inset-0 backdrop-blur-sm z-40"></div>
            )}

            <SettingsModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          </div>
        </>
      )}
    </>
  );
}
