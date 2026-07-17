"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LogOutIcon, PanelLeftIcon } from "lucide-react";

import AppLogo from "./app-logo";
import SettingsModal from "../../components/SettingsModal";
import Loader from "./ui/Loader";
import {
  DashboardIcon,
  ReviewtaskIcon,
  SettingsIcon,
  UserIcon,
} from "../../../lib/icons";
import TaskLogo from "../../../assets/icons/Task.png";
import subscptionLogo from "../../../assets/icons/Subscription.png";
import FrameLogo from "../../../assets/icons/Frame.png";
import Revenue from "../../../assets/icons/revenue.png";
import TripleDotIcon from "../../../assets/icons/ThreeDots.png";
import { cn } from "@/lib/utils";

const SIDEBAR_COOKIE_NAME = "custom_sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  toggleSidebar: () => void;
};

type NavItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within CustomSidebarProvider.");
  }

  return context;
}

export function CustomSidebarProvider({
  defaultOpen = true,
  children,
}: {
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpenState] = React.useState(defaultOpen);
  const [openMobile, setOpenMobile] = React.useState(false);

  const setOpen = React.useCallback((value: boolean) => {
    setOpenState(value);
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  }, []);

  const toggleSidebar = React.useCallback(() => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setOpenMobile((current) => !current);
      return;
    }

    setOpenState((current) => {
      const next = !current;
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      return next;
    });
  }, []);

  const value = React.useMemo<SidebarContextProps>(
    () => ({
      state: open ? "expanded" : "collapsed",
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [open, setOpen, openMobile, setOpenMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={value}>
      <div className="min-h-svh w-full overflow-x-hidden bg-neutral-900">
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function CustomSidebarInset({
  className,
  ...props
}: React.ComponentProps<"main">) {
  const { state } = useSidebar();

  return (
    <main
      className={cn(
        "relative flex min-h-svh min-w-0 flex-1 flex-col overflow-x-hidden transition-[margin] duration-300 ease-in-out",
        state === "expanded"
          ? "md:ml-[calc(16rem+1rem)]"
          : "md:ml-[calc(3rem+1rem)]",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarTrigger({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      type="button"
      aria-label="Toggle Sidebar"
      className={cn(
        "inline-flex size-7 cursor-pointer items-center justify-center rounded-md bg-transparent text-stone-200 transition hover:text-white",
        className,
      )}
      onClick={toggleSidebar}
      {...props}
    >
      <PanelLeftIcon className="size-6" />
    </button>
  );
}

export function NewAppSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { state, openMobile, setOpenMobile } = useSidebar();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  const userRole = "ADMIN";
  const isExpanded = state === "expanded" || openMobile;
  const fr = searchParams.get("fr");

  React.useEffect(() => {
    document.body.style.overflow = isModalOpen || openMobile ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen, openMobile]);

  const navItems = React.useMemo<NavItem[]>(() => {
    if (userRole === "ADMIN") {
      return [
        {
          title: "Dashboard",
          url: "/admin/dashboard",
          icon: DashboardIcon,
        },
        {
          title: "Employee Management",
          url: "/admin/employee-management",
          icon: UserIcon,
        },
        {
          title: "Review Tasks",
          url: "/admin/review-tasks",
          icon: ReviewtaskIcon,
        },
        {
          title: "User Management",
          url: "/admin/user-management",
          icon: UserIcon,
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
      ];
    }

    return [
      {
        title: "Review Tasks",
        url: "/admin/review-tasks",
        icon: ReviewtaskIcon,
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
        url: "#",
        icon: LogOutIcon,
        onClick: (event) => {
          event.preventDefault();
          setShowLogoutConfirm(true);
        },
      },
    ];
  }, [userRole]);

  const handleLogout = async () => {
    setLoading(true);

    try {
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setLoading(false);
    }
  };

  const closeMobile = () => setOpenMobile(false);

  const sidebarPanel = (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-[10px] border-r border-stone-700 bg-[#000000] text-stone-200">
      <div
        className={cn(
          "flex items-center justify-between gap-2",
          isExpanded ? "px-[26px] py-[2px]" : "pb-[10px] pl-[12px] pt-[2px]",
        )}
      >
        {isExpanded && <AppLogo />}
        <SidebarTrigger className="sidebar-trigger-collapse" />
      </div>

      <nav className="min-h-0 flex-1 overflow-auto">
        <ul className="flex w-full min-w-0 flex-col">
          {navItems.map((item) => {
            let isActive =
              pathname === item.url || pathname.startsWith(item.url + "/");

            if (fr === "review-tasks" && item.title === "Review Tasks") {
              isActive = true;
            }

            if (
              fr === "review-tasks" &&
              item.title === "User Management" &&
              pathname.startsWith("/admin/user-management/review-task")
            ) {
              isActive = false;
            }

            const Icon = item.icon;

            return (
              <li key={item.title} className="relative border-b border-stone-700">
                <Link
                  href={item.url}
                  title={!isExpanded ? item.title : undefined}
                  className={cn(
                    "custom-madeTommy flex h-auto w-full items-center gap-2 overflow-hidden px-[20px] py-[10px] text-base outline-none transition-all hover:bg-rose-200 hover:text-neutral-900",
                    isActive
                      ? "rounded-bl-md rounded-tl-md bg-rose-200 font-semibold text-neutral-900"
                      : "font-normal",
                    !isExpanded && "justify-center px-[8px] py-2",
                  )}
                  onClick={(event) => {
                    item.onClick?.(event);
                    closeMobile();
                  }}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden">
                    <Icon />
                  </span>
                  {isExpanded && <span className="truncate">{item.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {userRole === "ADMIN" && (
        <div className="flex flex-col gap-2 px-0 py-0">
          <button
            type="button"
            className={cn(
              "inline-flex w-full cursor-pointer items-center border-t border-stone-700 px-2 py-2",
              isExpanded ? "justify-between" : "justify-center",
            )}
            onClick={() => {
              setIsModalOpen(true);
              closeMobile();
            }}
          >
            <span className="flex items-center gap-2.5">
              <span className="relative size-8 overflow-hidden">
                <SettingsIcon />
              </span>
              {isExpanded && (
                <span className="mb-[4px] text-base font-semibold text-stone-200">
                  Settings
                </span>
              )}
            </span>
            {isExpanded && (
              <span className="relative size-5 overflow-hidden">
                <img src={TripleDotIcon.src} alt="More options" />
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {loading && <Loader />}

      <aside
        className={cn(
          "fixed bottom-0 left-0 top-4 z-30 hidden transition-[width] duration-300 ease-in-out md:block",
          isExpanded ? "w-64" : "w-12",
        )}
      >
        {sidebarPanel}
      </aside>

      {openMobile && (
        <>
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={closeMobile}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] md:hidden">
            {sidebarPanel}
          </aside>
        </>
      )}

      {showLogoutConfirm && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60" />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="w-80 rounded-xl border border-stone-700 bg-stone-950 p-6 text-center shadow-lg">
              <h3 className="mb-3 text-lg font-semibold text-stone-200">
                Confirm Logout
              </h3>
              <p className="mb-6 text-sm text-stone-400">
                Are you sure you want to log out?
              </p>
              <div className="flex justify-between gap-4">
                <button
                  type="button"
                  className="flex-1 cursor-pointer rounded-lg border border-stone-600 py-2 text-stone-300 hover:bg-stone-800"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 cursor-pointer rounded-lg bg-rose-500 py-2 text-white hover:bg-rose-600"
                  onClick={handleLogout}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {isModalOpen && <div className="fixed inset-0 z-40 backdrop-blur-sm" />}

      <SettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
