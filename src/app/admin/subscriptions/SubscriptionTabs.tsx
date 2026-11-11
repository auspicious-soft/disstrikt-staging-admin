"use client";

import Link from "next/link";

const tabs = [
  { key: "users", label: "Users & access", href: "/admin/subscriptions" },
  { key: "addons", label: "Add-on catalog", href: "/admin/subscriptions/addons" },
  { key: "shoutouts", label: "Shoutout requests", href: "/admin/subscriptions/shoutouts" },
] as const;

export function SubscriptionTabs({ active }: { active: (typeof tabs)[number]["key"] }) {
  return (
    <div className="mb-6 flex w-full max-w-[560px] overflow-hidden rounded-full bg-[#111111] text-sm">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`flex-1 px-4 py-2 text-center transition-colors ${
            active === tab.key ? "bg-[#EF476F] text-white" : "text-stone-300 hover:text-white"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
