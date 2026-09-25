"use client";

import RoleGuard from "@/app/components/RoleGuard";

// Admin panel: founders only (agents are sent to /agent)
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard role="FOUNDER">{children}</RoleGuard>;
}
