"use client";

import ModelMarketDetailsPage from "@/app/admin/model-market/[id]/page";
import { AGENT_PANEL, PanelProvider } from "@/app/components/PanelContext";

// Same screen as the admin's project details
export default function AgentModelMarketDetailsPage() {
  return (
    <PanelProvider value={AGENT_PANEL}>
      <ModelMarketDetailsPage />
    </PanelProvider>
  );
}
