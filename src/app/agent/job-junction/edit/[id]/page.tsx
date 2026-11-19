"use client";

import PostJobPage from "@/app/admin/job-junction/post-job/page";
import { AGENT_PANEL, PanelProvider } from "@/app/components/PanelContext";

// The post-job form in edit mode (the route has an :id). The API only saves
// jobs this agent posted.
export default function AgentEditJobPage() {
  return (
    <PanelProvider value={AGENT_PANEL}>
      <PostJobPage />
    </PanelProvider>
  );
}
