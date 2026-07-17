import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { DataProvider } from "./components/DataContext";
import { CountryProvider } from "./components/CountryContext";

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
  return (
    <html lang="en">
      <body className={`overflow-auto overflo-custom`}>
        <CountryProvider>
          <DataProvider>
            <Toaster position="top-center" />
            {/* <Toaster position="top-right" /> */}

            <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
          </DataProvider>
        </CountryProvider>
      </body>
    </html>
  );
}
