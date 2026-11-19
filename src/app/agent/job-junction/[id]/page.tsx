"use client";

import JobJunctionDetailsPage from "@/app/admin/job-junction/[id]/page";
import { AGENT_PANEL, PanelProvider } from "@/app/components/PanelContext";

// Same screen as the admin's job detail. On a job the agent posted they see
// every applicant, set statuses and can edit; otherwise it's read-only and
// lists only the agent's own models among the applicants
export default function AgentJobDetailsPage() {
  return (
    <PanelProvider value={AGENT_PANEL}>
      <JobJunctionDetailsPage />
    </PanelProvider>
  );
}
