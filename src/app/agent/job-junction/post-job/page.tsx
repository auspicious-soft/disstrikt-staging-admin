"use client";

import PostJobPage from "@/app/admin/job-junction/post-job/page";
import { AGENT_PANEL, PanelProvider } from "@/app/components/PanelContext";

// The admin's post-job form, saving through /api/agent/job-junction. The job
// is a Disstrikt job, recorded as posted by this agent.
export default function AgentPostJobPage() {
  return (
    <PanelProvider value={AGENT_PANEL}>
      <PostJobPage />
    </PanelProvider>
  );
}
