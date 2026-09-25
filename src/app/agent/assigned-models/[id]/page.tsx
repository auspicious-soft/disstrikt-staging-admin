"use client";

import ModelMansionDetailsPage from "@/app/admin/model-mansion/[id]/page";
import { AGENT_PANEL, PanelProvider } from "@/app/components/PanelContext";

// Same screen as the admin's model details, for one of the agent's models
export default function AssignedModelDetailsPage() {
  return (
    <PanelProvider value={AGENT_PANEL}>
      <ModelMansionDetailsPage />
    </PanelProvider>
  );
}
