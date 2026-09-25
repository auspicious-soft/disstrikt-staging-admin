"use client";

import ModelMansion from "@/app/admin/model-mansion/page";
import { AGENT_PANEL, PanelProvider } from "@/app/components/PanelContext";

// Same screen as the admin's Model Mansion, limited to the agent's own models
export default function AssignedModelsPage() {
  return (
    <PanelProvider value={AGENT_PANEL}>
      <ModelMansion />
    </PanelProvider>
  );
}
