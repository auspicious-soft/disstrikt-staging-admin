"use client";

import JobJunction from "@/app/admin/job-junction/page";
import { AGENT_PANEL, PanelProvider } from "@/app/components/PanelContext";

// Same screen as the admin's Job Junction. Agents post jobs and manage the
// ones they posted; on other jobs applicant counts are their own models only
export default function AgentJobJunctionPage() {
  return (
    <PanelProvider value={AGENT_PANEL}>
      <JobJunction />
    </PanelProvider>
  );
}
