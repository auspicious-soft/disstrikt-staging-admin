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
export const AGENT_SECTION_MODULES: { url: string; module: ModuleKey }[] = [
  { url: "/agent/dashboard", module: "dashboard" },
  { url: "/agent/assigned-models", module: "modelMansion" },
  { url: "/agent/job-junction", module: "jobJunction" },
  { url: "/agent/model-market", module: "modelMarket" },
];

/** The module that controls a path, or null when the path isn't restricted. */
export const moduleForPath = (pathname: string): ModuleKey | null =>
  AGENT_SECTION_MODULES.find(
    ({ url }) => pathname === url || pathname.startsWith(url + "/"),
  )?.module ?? null;

export const canAccessPath = (pathname: string, permissions?: Permissions) => {
  const key = moduleForPath(pathname);
  return !key || Boolean(permissions?.[key]);
};
