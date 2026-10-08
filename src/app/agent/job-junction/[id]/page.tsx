"use client";

import JobJunctionDetailsPage from "@/app/admin/job-junction/[id]/page";
import { AGENT_PANEL, PanelProvider } from "@/app/components/PanelContext";

// Same screen as the admin's job detail, read-only, listing only the agent's
// own models among the applicants
export default function AgentJobDetailsPage() {
  return (
    <PanelProvider value={AGENT_PANEL}>
      <JobJunctionDetailsPage />
    </PanelProvider>
  );
}
