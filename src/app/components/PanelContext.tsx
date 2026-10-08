"use client";

import { createContext, useContext } from "react";

/**
 * The Model Mansion / Model Market / Job Junction screens are shared by the
 * admin and agent panels. This says which API and which page routes the
 * current panel uses; the agent API returns only the agent's own models,
 * projects and job applicants, and Job Junction is read-only for agents.
 */
export type PanelConfig = {
  kind: "admin" | "agent";
  mansionApi: string;
  marketApi: string;
  jobsApi: string;
  jobByIdApi: string;
  mansionPath: string;
  marketPath: string;
  jobsPath: string;
};

export const ADMIN_PANEL: PanelConfig = {
  kind: "admin",
  mansionApi: "/admin/model-mansion",
  marketApi: "/admin/model-market",
  jobsApi: "/admin/jobs",
  jobByIdApi: "/admin/jobsById",
  mansionPath: "/admin/model-mansion",
  marketPath: "/admin/model-market",
  jobsPath: "/admin/job-junction",
};

export const AGENT_PANEL: PanelConfig = {
  kind: "agent",
  mansionApi: "/agent/assigned-models",
  marketApi: "/agent/model-market",
  jobsApi: "/agent/job-junction",
  jobByIdApi: "/agent/job-junction",
  mansionPath: "/agent/assigned-models",
  marketPath: "/agent/model-market",
  jobsPath: "/agent/job-junction",
};

const PanelContext = createContext<PanelConfig>(ADMIN_PANEL);

export const PanelProvider = PanelContext.Provider;

export const usePanel = () => useContext(PanelContext);
