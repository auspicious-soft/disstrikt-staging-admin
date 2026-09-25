"use client";

import { createContext, useContext } from "react";

/**
 * The Model Mansion / Model Market screens are shared by the admin and agent
 * panels. This says which API and which page routes the current panel uses;
 * the agent API returns only the agent's own models and projects.
 */
export type PanelConfig = {
  kind: "admin" | "agent";
  mansionApi: string;
  marketApi: string;
  mansionPath: string;
  marketPath: string;
};

export const ADMIN_PANEL: PanelConfig = {
  kind: "admin",
  mansionApi: "/admin/model-mansion",
  marketApi: "/admin/model-market",
  mansionPath: "/admin/model-mansion",
  marketPath: "/admin/model-market",
};

export const AGENT_PANEL: PanelConfig = {
  kind: "agent",
  mansionApi: "/agent/assigned-models",
  marketApi: "/agent/model-market",
  mansionPath: "/agent/assigned-models",
  marketPath: "/agent/model-market",
};

const PanelContext = createContext<PanelConfig>(ADMIN_PANEL);

export const PanelProvider = PanelContext.Provider;

export const usePanel = () => useContext(PanelContext);
