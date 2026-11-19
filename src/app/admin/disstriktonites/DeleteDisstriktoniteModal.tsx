"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import ButtonSpinner from "@/app/admin/components/ui/ButtonSpinner";
import { useDeleteEmployee, useGetEmployeeDeletePreview } from "@/hooks/useAdmin";

type Preview = {
  employee: { _id: string; fullName: string; email: string; role: string | null };
  assignedModels: number;
  openCalls: number;
  projectChats: number;
  signedIn: boolean;
  canDelete: boolean;
  blockReason: string | null;
  reassignAgents: { _id: string; fullName: string; email: string }[];
};

type Choice = "reassign" | "unassign";

const plural = (count: number, one: string, many = `${one}s`) =>
  `${count} ${count === 1 ? one : many}`;

const errorMessage = (error: unknown, fallback: string) =>
  (axios.isAxiosError(error) && error.response?.data?.message) || fallback;

/**
 * Confirms deleting a staff account. It lists everything the delete changes
 * (from the server's preview), and when the account has models it asks
 * whether to move them to another agent or leave them unassigned.
 */
const DeleteDisstriktoniteModal = ({
  employee,
  onClose,
  onDeleted,
}: {
  employee: { _id: string; name: string } | null;
  onClose: () => void;
  onDeleted: () => void;
}) => {
  const { data, isPending, error } = useGetEmployeeDeletePreview(employee?._id);
  const preview = data as Preview | undefined;
  const { mutate: deleteEmployee, isPending: isDeleting } = useDeleteEmployee();
  const [choice, setChoice] = useState<Choice>("reassign");
  const [agentId, setAgentId] = useState("");

  // Fresh choices for each account opened
  useEffect(() => {
    setChoice("reassign");
    setAgentId("");
  }, [employee?._id]);

  if (!employee) return null;

  const name = preview?.employee.fullName || employee.name;
  const hasModels = (preview?.assignedModels ?? 0) > 0;
  const canReassign = (preview?.reassignAgents.length ?? 0) > 0;
  const reassigning = hasModels && canReassign && choice === "reassign";
  const newAgent = preview?.reassignAgents.find((agent) => agent._id === agentId);
  const missingAgent = reassigning && !agentId;
  const confirmDisabled = isPending || !preview?.canDelete || missingAgent || isDeleting;

  const close = () => {
    if (!isDeleting) onClose();
  };

  const confirm = () => {
    if (confirmDisabled) return;
    deleteEmployee(
      { id: employee._id, reassignTo: reassigning ? agentId : undefined },
      {
        onSuccess: () => {
          toast.success(
            reassigning && newAgent
              ? `${name} deleted. Their models now belong to ${newAgent.fullName}.`
              : `${name} deleted`,
          );
          onDeleted();
        },
        onError: (err) => toast.error(errorMessage(err, "Could not delete this Disstriktonite")),
      },
    );
  };

  const warnings: string[] = [];
  if (preview) {
    if (hasModels) {
      warnings.push(
        reassigning
          ? `${plural(preview.assignedModels, "model")} assigned to ${name} will move to ${newAgent?.fullName ?? "the agent you pick"}.`
          : `${plural(preview.assignedModels, "model")} assigned to ${name} will be left with no agent.`,
      );
    }
    warnings.push(
      preview.openCalls
        ? `${plural(preview.openCalls, "open call")} with ${name} will be cancelled. The models aren't notified.`
        : `${name} has no open calls to cancel.`,
    );
    warnings.push(
      preview.projectChats
        ? `${name} will be removed from ${plural(preview.projectChats, "project group chat")}.${
            reassigning && newAgent ? ` ${newAgent.fullName} joins them instead.` : ""
          }`
        : `${name} isn't in any project group chats.`,
    );
    warnings.push(
      preview.signedIn
        ? `${name} is signed in and will be signed out right away.`
        : `${name} isn't signed in now and won't be able to sign in again.`,
    );
    warnings.push("Their logs, past chat messages and posted jobs are kept.");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-disstriktonite-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[14px] border border-[#232327] bg-[#111115] p-5 text-stone-100"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-[#EF476F]" />
          <h4 id="delete-disstriktonite-title" className="text-sm font-semibold">
            Delete {name}?
          </h4>
        </div>

        {isPending ? (
          <div className="flex justify-center py-6">
            <ButtonSpinner />
          </div>
        ) : error || !preview ? (
          <p className="mb-5 text-xs text-[#EF476F]">
            {errorMessage(error, "Could not load what this delete affects")}
          </p>
        ) : (
          <>
            {preview.blockReason && (
              <p className="mb-4 rounded-md bg-[#EF476F]/10 px-3 py-2 text-xs text-[#EF476F]">
                {preview.blockReason}
              </p>
            )}

            {preview.canDelete && hasModels && (
              <fieldset className="mb-4 rounded-md border border-[#232327] p-3">
                <legend className="px-1 text-xs font-medium text-stone-300">
                  {plural(preview.assignedModels, "model")} assigned to {name}
                </legend>

                <label className={`flex items-start gap-2 py-1 text-xs ${canReassign ? "cursor-pointer" : "opacity-50"}`}>
                  <input
                    type="radio"
                    name="delete-choice"
                    className="mt-0.5 accent-rose-500"
                    checked={reassigning}
                    disabled={!canReassign || isDeleting}
                    onChange={() => setChoice("reassign")}
                  />
                  <span>
                    Reassign to another agent
                    {!canReassign && (
                      <span className="block text-stone-500">There's no other active agent.</span>
                    )}
                  </span>
                </label>

                {reassigning && (
                  <select
                    value={agentId}
                    onChange={(event) => setAgentId(event.target.value)}
                    disabled={isDeleting}
                    aria-label="Agent to reassign the models to"
                    className="mb-2 ml-6 mt-1 w-[calc(100%-1.5rem)] rounded-md border border-[#232327] bg-neutral-900 px-2 py-2 text-xs text-stone-100 outline-none focus:border-rose-500"
                  >
                    <option value="" disabled>
                      Select an agent
                    </option>
                    {preview.reassignAgents.map((agent) => (
                      <option key={agent._id} value={agent._id}>
                        {agent.fullName} ({agent.email})
                      </option>
                    ))}
                  </select>
                )}

                <label className="flex cursor-pointer items-start gap-2 py-1 text-xs">
                  <input
                    type="radio"
                    name="delete-choice"
                    className="mt-0.5 accent-rose-500"
                    checked={!reassigning}
                    disabled={isDeleting}
                    onChange={() => setChoice("unassign")}
                  />
                  <span>Delete without reassigning (models are left with no agent)</span>
                </label>
              </fieldset>
            )}

            {preview.canDelete && (
              <>
                <p className="mb-2 text-xs font-medium text-stone-300">This will:</p>
                <ul className="mb-4 list-disc space-y-1.5 pl-5 text-xs text-stone-400">
                  {warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
                <p className="mb-5 text-xs font-medium text-[#EF476F]">This can't be undone.</p>
              </>
            )}
          </>
        )}

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={close}
            disabled={isDeleting}
            className="flex items-center gap-1 rounded-lg border border-[#212121] px-3 py-2 text-xs font-medium text-white hover:text-stone-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={confirmDisabled}
            title={missingAgent ? "Select an agent first" : undefined}
            className="flex items-center gap-1 rounded-lg bg-[#EF476F] px-3 py-2 text-xs font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting && <ButtonSpinner />}
            {reassigning ? "Reassign & Delete" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDisstriktoniteModal;
