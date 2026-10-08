/**
 * Module access set per role by a founder (Admin → Disstriktonites → Manage Roles).
 *
 * The agent panel hides sidebar items and blocks direct URLs for modules the
 * role has switched off. The backend enforces the same flags on /api/agent/*.
 */
export const ROLE_MODULES = [
  { label: "Dashboard", key: "dashboard" },
  { label: "Model Mansion", key: "modelMansion" },
  { label: "Model Market", key: "modelMarket" },
  { label: "Job Junction", key: "jobJunction" },
  { label: "Training Theater", key: "trainingTheater" },
  { label: "Shoot Studio", key: "shootStudio" },
  { label: "University Union", key: "universityUnion" },
  { label: "Celebration Cruise", key: "celebrationCruise" },
  { label: "Subscription Plans", key: "subscriptionPlans" },
  { label: "Studio Management", key: "studioManagement" },
  { label: "Profile", key: "profile" },
  { label: "Terms of Use", key: "termOfUse" },
  { label: "Disstriktonites", key: "disstriktOnItes" },
] as const;

export type ModuleKey = (typeof ROLE_MODULES)[number]["key"];
export type Permissions = Partial<Record<ModuleKey, boolean>>;

// Agent panel sections and the module that controls each. Sections without a
// module (messages, calls, account settings) are always available.
export const AGENT_SECTION_MODULES: { url: string; module: ModuleKey; label: string }[] = [
  { url: "/agent/dashboard", module: "dashboard", label: "Dashboard" },
  { url: "/agent/assigned-models", module: "modelMansion", label: "Assigned Models" },
  { url: "/agent/job-junction", module: "jobJunction", label: "Job Junction" },
  { url: "/agent/model-market", module: "modelMarket", label: "Model Market" },
];

/** The toggles Manage Roles offers for a role. Agents only get their sidebar sections. */
export const modulesForRole = (roleName?: string): { key: ModuleKey; label: string }[] =>
  roleName === "AGENT"
    ? AGENT_SECTION_MODULES.map(({ module, label }) => ({ key: module, label }))
    : [...ROLE_MODULES];

/** The module that controls a path, or null when the path isn't restricted. */
export const moduleForPath = (pathname: string): ModuleKey | null =>
  AGENT_SECTION_MODULES.find(
    ({ url }) => pathname === url || pathname.startsWith(url + "/"),
  )?.module ?? null;

export const canAccessPath = (pathname: string, permissions?: Permissions) => {
  const key = moduleForPath(pathname);
  return !key || Boolean(permissions?.[key]);
};
