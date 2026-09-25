"use client";

import RoleGuard from "@/app/components/RoleGuard";

// Agent panel: agents only (founders are sent to /admin)
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard role="AGENT">{children}</RoleGuard>;
}
