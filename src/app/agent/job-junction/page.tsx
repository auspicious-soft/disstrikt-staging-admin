"use client";

import JobJunction from "@/app/admin/job-junction/page";
import { AGENT_PANEL, PanelProvider } from "@/app/components/PanelContext";

// Same screen as the admin's Job Junction, read-only, with applicant counts
// limited to the agent's own models
export default function AgentJobJunctionPage() {
  return (
    <PanelProvider value={AGENT_PANEL}>
      <JobJunction />
    </PanelProvider>
  );
}
