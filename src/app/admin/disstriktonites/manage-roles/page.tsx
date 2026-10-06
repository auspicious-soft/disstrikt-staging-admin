"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useGetEmployeesRoles, useUpdateEmployeeRole } from "@/hooks/useAdmin";
import { ROLE_MODULES } from "@/lib/permissions";

const selectClass =
  "h-11 w-full appearance-none rounded-md border border-stone-700 bg-transparent px-3 pr-9 text-xs font-normal text-stone-200 outline-none transition-colors focus:border-rose-400";

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="mb-1.5 block text-xs font-normal leading-none text-stone-200">
    {children}
  </span>
);

const roleIdOf = (role: any): string => role?._id ?? role?.id ?? role?.roleId ?? "";

const enabledModulesOf = (role: any) =>
  new Set<string>(ROLE_MODULES.filter(({ key }) => Boolean(role?.[key])).map(({ key }) => key));

const ManageRolesPage = () => {
  const router = useRouter();
  const { data: rolesData, isLoading } = useGetEmployeesRoles();
  const { mutate: saveRole, isPending: isSaving } = useUpdateEmployeeRole();

  // AGENT, SCOUT, COACH and MANAGER; FOUNDER isn't offered here
  const roleOptions = useMemo<any[]>(() => {
    const list = Array.isArray(rolesData)
      ? rolesData
      : Array.isArray((rolesData as any)?.data)
        ? (rolesData as any).data
        : [];
    return list.filter((role: any) => role?.role !== "FOUNDER");
  }, [rolesData]);

  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [enabledModules, setEnabledModules] = useState<Set<string>>(() => new Set());

  // Load the role's saved access only when a role is picked, so toggles
  // aren't reset by refetches while editing
  const selectRole = (roleId: string) => {
    setSelectedRoleId(roleId);
    setEnabledModules(enabledModulesOf(roleOptions.find((role) => roleIdOf(role) === roleId)));
  };

  const toggleModule = (moduleKey: string) => {
    setEnabledModules((current) => {
      const next = new Set(current);

      if (next.has(moduleKey)) {
        next.delete(moduleKey);
      } else {
        next.add(moduleKey);
      }

      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId) {
      toast.error("Please select a role");
      return;
    }

    const permissions = Object.fromEntries(
      ROLE_MODULES.map(({ key }) => [key, enabledModules.has(key)]),
    );

    saveRole(
      { roleId: selectedRoleId, permissions },
      {
        onSuccess: () => {
          toast.success("Role access updated");
          router.push("/admin/disstriktonites");
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to update role access");
        },
      },
    );
  };

  return (
    <main className="w-full text-stone-200">
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <label className="block">
          <FieldLabel>Select Role</FieldLabel>
          <div className="relative">
            <select
              className={selectClass}
              value={selectedRoleId}
              onChange={(e) => selectRole(e.target.value)}
              disabled={isLoading || isSaving}
            >
              <option value="" disabled className="bg-stone-900">
                Select
              </option>
              {roleOptions.map((role: any) => {
                const roleValue = roleIdOf(role);
                const roleLabel = role?.role ?? role?.name ?? "Role";

                return (
                  <option key={roleValue} value={roleValue} className="bg-stone-900">
                    {roleLabel}
                  </option>
                );
              })}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
          </div>
        </label>

        <section className="space-y-2">
          <FieldLabel>Access</FieldLabel>

          <div className="space-y-2">
            {ROLE_MODULES.map((module) => {
              const checked = enabledModules.has(module.key);

              return (
                <label
                  key={module.key}
                  className={`flex h-11 items-center justify-between rounded-md border border-stone-700 bg-transparent px-4 text-xs font-medium text-stone-100 ${
                    selectedRoleId ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                  }`}
                >
                  <span>{module.label}</span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleModule(module.key)}
                    disabled={!selectedRoleId || isSaving}
                    className="peer sr-only"
                  />
                  <span className="relative h-3.5 w-7 rounded-full bg-stone-700 transition-colors after:absolute after:left-0.5 after:top-1/2 after:h-2.5 after:w-2.5 after:-translate-y-1/2 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-rose-300 peer-checked:after:translate-x-3.5" />
                </label>
              );
            })}
          </div>
        </section>

        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => router.push("/admin/disstriktonites")}
            className="h-11 rounded-md border border-stone-500 text-sm font-medium text-stone-200 transition-colors hover:border-stone-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedRoleId || isSaving}
            className="h-11 rounded-md bg-[#EF476F] text-sm font-medium text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Confirm"}
          </button>
        </div>
      </form>
    </main>
  );
};

export default ManageRolesPage;
