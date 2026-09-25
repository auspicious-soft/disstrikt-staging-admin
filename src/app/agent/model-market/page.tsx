"use client";

import ModelMarket from "@/app/admin/model-market/page";
import { AGENT_PANEL, PanelProvider } from "@/app/components/PanelContext";

// Same screen as the admin's Model Market, limited to projects with the agent's models
export default function AgentModelMarketPage() {
  return (
    <PanelProvider value={AGENT_PANEL}>
      <ModelMarket />
    </PanelProvider>
  );
}
