import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { DataProvider } from "./components/DataContext";
import { CountryProvider } from "./components/CountryContext";
// import { useRouter } from "next/router";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Disstrikt Admin",
  description: "Disstrikt Admin ",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/Favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "icon",
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        rel: "icon",
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={`overflow-auto overflo-custom`}>
        <SessionProvider session={session}>
          <CountryProvider>
            <DataProvider>
              <Toaster position="top-center" />
              {/* <Toaster position="top-right" /> */}

              <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
            </DataProvider>
          </CountryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
