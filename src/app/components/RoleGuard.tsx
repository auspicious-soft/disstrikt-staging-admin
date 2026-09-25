"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, getSession, homeForRole, type StaffRole } from "@/lib/auth";

/**
 * Renders the panel only for a logged-in account with the given role.
 * Other panel roles are sent to their own panel; no session or a role without
 * a panel is logged out to the login page. Nothing is rendered until checked,
 * so protected screens never flash.
 */
export default function RoleGuard({
  role,
  children,
}: {
  role: StaffRole;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const session = getSession();

    if (session.token && session.role === role) {
      setAllowed(true);
      return;
    }

    const home = session.token ? homeForRole(session.role) : null;
    if (home) {
      router.replace(home);
    } else {
      clearSession();
      router.replace("/");
    }
  }, [role, router]);

  return allowed ? <>{children}</> : null;
}
