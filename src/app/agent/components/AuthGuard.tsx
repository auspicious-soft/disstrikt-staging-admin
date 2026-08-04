"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children, }: { children: React.ReactNode }) {
  const router = useRouter();

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   const role = localStorage.getItem("role");

  //   if (token && role === "FOUNDER") {
  //     router.replace("/admin/dashboard");
  //   } else if (!token || role !== "AGENT") {
  //     localStorage.removeItem("token");
  //     localStorage.removeItem("role");
  //     localStorage.removeItem("admin");

  //     router.replace("/");
  //   }
  // }, [router]);

  return <>{children}</>;
}
