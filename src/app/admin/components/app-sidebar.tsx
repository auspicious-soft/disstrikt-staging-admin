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
import {
  DashboardIcon,
  ReviewtaskIcon,
  UserIcon,
  SettingsIcon,
} from "../../../lib/icons";
import TaskLogo from "../././../../assets/icons/Task.png";
import subscptionLogo from "../././../../assets/icons/Subscription.png";
import FrameLogo from "../././../../assets/icons/Frame.png";
import Revenue from "../././../../assets/icons/revenue.png";
import TripleDotIcon from "../././../../assets/icons/ThreeDots.png";
import { NavProjects } from "./nav-projects";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import SettingsModal from "../../components/SettingsModal";
import { LogOutIcon } from "lucide-react";
import Loader from "./ui/Loader";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  session?: any; // Add session as a prop
}

export function AppSidebar({ session, ...props }: AppSidebarProps) {
  const router = useRouter();
  const { isMobile, state, setOpen, setOpenMobile } = useSidebar();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [wasExpanded, setWasExpanded] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  console.log("Session in AppSidebar:", session);

  // Get userRole directly from session prop
  const userRole = session?.user?.role || "";
  console.log("Current userRole:", userRole);

  // Use useMemo to recalculate dataa whenever userRole changes
  const dataa = React.useMemo(() => {
    console.log("Calculating dataa with userRole:", userRole);

    if (userRole === "ADMIN") {
      console.log("Returning admin menu");
      return {
        user: {
          name: "Kane",
          profile: "Admin",
          avatar: "https://github.com/shadcn.png",
        },
        navMain: [
          {
            title: "Dashboard",
            url: "/admin/dashboard",
            icon: () => <DashboardIcon />,
          },
          {
            title: "Employee Management",
            url: "/admin/employee-management",
            icon: () => <UserIcon />,
          },
          {
            title: "Review Tasks",
            url: "/admin/review-tasks",
            icon: () => <ReviewtaskIcon />,
          },
          {
            title: "User Management",
            url: "/admin/user-management",
            icon: () => <UserIcon />,
          },
          {
            title: "Job Management",
            url: "/admin/job-management",
            icon: () => <img src={FrameLogo.src} alt="Job" />,
          },
          {
            title: "Task Management",
            url: "/admin/task-management",
            icon: () => <img src={TaskLogo.src} alt="Task" />,
          },
          {
            title: "Revenue",
            url: "/admin/revenue",
            icon: () => <img src={Revenue.src} alt="Revenue" />,
          },
          {
            title: "Job Applicants",
            url: "/admin/job-applicants",
            icon: () => <img src={Revenue.src} alt="Revenue" />,
          },
          {
            title: "Subscription-Plans",
            url: "/admin/subscription-plans",
            icon: () => (
              <img
                src={subscptionLogo.src}
                alt="Subscription"
                className="hover:invert"
              />
            ),
          },
          {
            title: "Manage Studios",
            url: "/admin/manage-studios",
            icon: () => <img src={Revenue.src} alt="Revenue" />,
          },
          {
            title: "Activities",
            url: "/admin/activities",
            icon: () => <img src={Revenue.src} alt="Revenue" />,
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
    } else if (userRole && userRole !== "ADMIN") {
      // Return employee data for any non-ADMIN role
      console.log("Returning employee menu for role:", userRole);
      return {
        user: {
          name: "Kane",
          profile: "Employee",
          avatar: "https://github.com/shadcn.png",
        },
        navMain: [
          {
            title: "Review Tasks",
            url: "/admin/review-tasks",
            icon: () => <ReviewtaskIcon />,
          },
          {
            title: "Task Management",
            url: "/admin/task-management",
            icon: () => <img src={TaskLogo.src} alt="Task" />,
          },
          {
            title: "Job Applicants",
            url: "/admin/job-applicants",
            icon: () => <img src={Revenue.src} alt="Revenue" />,
          },
          {
            title: "Job Management",
            url: "/admin/job-management",
            icon: () => <img src={FrameLogo.src} alt="Job" />,
          },
          {
            title: "Activities",
            url: "/admin/activities",
            icon: () => <img src={Revenue.src} alt="Revenue" />,
          },
          {
            title: "Logout",
            url: "#", // prevent navigation
            icon: () => <LogOutIcon />,
          },
        ],
        projects: [],
      };
    }

    // Return default employee structure if no role is found
    console.log("Returning default employee menu - no role found");
    return {
      user: {
        name: "Kane",
        profile: "Employee",
        avatar: "https://github.com/shadcn.png",
      },
      navMain: [
        {
          title: "Review Tasks",
          url: "/admin/review-tasks",
          icon: () => <ReviewtaskIcon />,
        },
        {
          title: "Task Management",
          url: "/admin/task-management",
          icon: () => <img src={TaskLogo.src} alt="Task" />,
        },
        {
          title: "Job Applicants",
          url: "/admin/job-applicants",
          icon: () => <img src={Revenue.src} alt="Revenue" />,
        },
        {
          title: "Job Management",
          url: "/admin/job-management",
          icon: () => <img src={FrameLogo.src} alt="Job" />,
        },
        {
          title: "Logout",
          url: "#",
          icon: () => <LogOutIcon />,
        },
      ],
      projects: [],
    };
  }, [userRole]);

  React.useEffect(() => {
    // if (isModalOpen && !isMobile && state === "expanded") {
    //   setWasExpanded(true);
    //   setOpen(false);
    // } else if (!isModalOpen && !isMobile && wasExpanded) {
    //   setOpen(true);
    //   setWasExpanded(false);
    // }
  }, [isModalOpen, isMobile, state, setOpen]);

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
      await signOut({ callbackUrl: "/" }); // Let NextAuth handle the redirect
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
          <div className="relative">
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
                {state === "expanded" && <AppLogo />}
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
