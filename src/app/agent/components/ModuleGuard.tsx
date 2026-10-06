"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMyPermissions } from "@/hooks/usePermissions";
import { AGENT_SECTION_MODULES, canAccessPath } from "@/lib/permissions";
import Loader from "./ui/Loader";

// Where to send an agent whose role can't open the requested page
export const agentHome = (permissions?: Record<string, boolean | undefined>) =>
  AGENT_SECTION_MODULES.find(({ module }) => permissions?.[module])?.url ??
  "/agent/messages";

/**
 * Blocks agent pages whose module is switched off for the role (Manage Roles),
 * including when the URL is typed directly: the agent is redirected to the
 * first page they can open. Nothing is rendered until access is known.
 */
export default function ModuleGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data, isLoading, isError } = useMyPermissions();
  const permissions = data?.permissions;

  const ready = !isLoading;
  // If permissions can't be loaded, restricted pages stay closed
  const allowed = ready && canAccessPath(pathname, isError ? {} : permissions);

  useEffect(() => {
    if (ready && !allowed) {
      router.replace(agentHome(isError ? {} : permissions));
    }
  }, [ready, allowed, isError, permissions, router]);

  if (!ready) return <Loader />;
  return allowed ? <>{children}</> : null;
}
