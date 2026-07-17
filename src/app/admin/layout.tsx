import clsx from "clsx";
import type { Metadata } from "next";
import { Mulish } from "next/font/google";

import "../globals.css";
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { AppHeader } from "./components/ui/header";
// import { LoadingProvider } from "@/context/loading-context";
import { Toaster } from "sonner";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Disstrikt Admin Panel",
  description: "Admin panel for Disstrikt management",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={clsx(
          "dark",
          mulish.variable,
          "antialiased",
          "overflow-auto",
          "overflow-custom",
          "bg-neutral-900",
        )}
      >
        {" "}
        <SidebarProvider>
          <AppSidebar session={session} />
          <SidebarInset className="min-w-0 overflow-x-hidden">
            <div className="min-h-screen min-w-0 flex flex-col bg-none"
            style={{
                    background:
                      "radial-gradient(circle at center, rgba(100,60,94,0.25) 0%, rgba(160,63,94,0.15) 0%, transparent 70%)",
                  }}
            >
              <AppHeader />
              <div className="relative min-w-0 flex-1 flex flex-col gap-4 py-6 px-4 md:py-8 md:px-7 md:gap-7">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  
                />

                <div className="relative z-10 min-w-0 max-w-full">
                  {children}
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
