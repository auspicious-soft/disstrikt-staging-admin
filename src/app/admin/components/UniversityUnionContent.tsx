"use client";
import { useEffect, useState } from "react";
import { NavArrowDownSolid } from "iconoir-react";
import { useGetModelMansionUniversityUnion } from "@/hooks/useModelMansion";
import {
  UnionProgress,
  UnionSubTask,
  UnionSubTaskStatus,
  UnionTask,
  useReviewUnionSubTask,
} from "@/hooks/useUniversityUnion";
import { apiErrorMessage } from "@/hooks/useAgentAccount";
import { formatDate } from "../model-mansion/[id]/format";
import ButtonSpinner from "./ui/ButtonSpinner";
import Loader from "./ui/Loader";
import { resolveMediaUrl } from "@/lib/media";

const STATUS_LABELS: Record<UnionSubTaskStatus, { label: string; className: string }> = {
  COMPLETED: { label: "Completed", className: "bg-emerald-500/15 text-emerald-400" },
  IN_REVIEW: { label: "Waiting for review", className: "bg-amber-500/15 text-amber-400" },
  REJECTED: { label: "Rejected", className: "bg-rose-500/15 text-rose-400" },
  AVAILABLE: { label: "In progress", className: "bg-sky-500/15 text-sky-400" },
  LOCKED: { label: "Locked", className: "bg-stone-500/15 text-stone-400" },
};

const StatusBadge = ({ status }: { status: UnionSubTaskStatus }) => (
  <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_LABELS[status].className}`}>
    {STATUS_LABELS[status].label}
  </span>
);

// Approve, or reject with the reason the model will see
const ReviewBox = ({ modelId, subTask }: { modelId: string; subTask: UnionSubTask }) => {
  const review = useReviewUnionSubTask(modelId);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState<"APPROVE" | "REJECT" | null>(null);

  const submit = (decision: "APPROVE" | "REJECT") => {
    setError("");
    if (decision === "REJECT" && !note.trim()) {
      setError("Please write the reason. The model will see it.");
      return;
    }
    setPending(decision);
    review.mutate(
      { key: subTask.key, decision, note: note.trim() || undefined },
      {
        onError: (err) => setError(apiErrorMessage(err)),
        onSettled: () => setPending(null),
      },
    );
  };

  return (
    <div className="mt-4 rounded-md border border-amber-500/30 bg-amber-500/5 p-4">
      <p className="text-sm font-medium text-white">Review this submission</p>
      <p className="mt-1 text-xs text-stone-400">
        The model can&apos;t continue until this is approved.
      </p>
      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        maxLength={500}
        rows={2}
        placeholder="Reason, if you reject"
        className="mt-3 w-full rounded-md border border-stone-700 bg-transparent p-3 text-xs text-stone-200 outline-none focus:border-rose-500"
      />
      {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={!!pending}
          onClick={() => submit("APPROVE")}
          className="flex h-9 items-center gap-2 rounded-md bg-emerald-600 px-4 text-xs font-medium text-white disabled:opacity-60"
        >
          {pending === "APPROVE" && <ButtonSpinner />} Approve
        </button>
        <button
          type="button"
          disabled={!!pending}
          onClick={() => submit("REJECT")}
          className="flex h-9 items-center gap-2 rounded-md border border-rose-500 px-4 text-xs font-medium text-rose-400 disabled:opacity-60"
        >
          {pending === "REJECT" && <ButtonSpinner />} Reject
        </button>
      </div>
    </div>
  );
};

const SubTaskCard = ({ modelId, subTask }: { modelId: string; subTask: UnionSubTask }) => {
  const details = [
    subTask.submittedAt && `Submitted ${formatDate(subTask.submittedAt)}`,
    subTask.score && `Score ${subTask.score.correct}/${subTask.score.total}`,
    subTask.attempts > 1 && `${subTask.attempts} submissions`,
    subTask.failedAttempts > 0 && `${subTask.failedAttempts} failed attempts`,
    subTask.reviewedBy && `Reviewed by ${subTask.reviewedBy.name || "staff"}`,
  ].filter(Boolean);

  return (
    <div className="rounded-md border border-stone-800 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-white">
          {subTask.key} {subTask.title}
        </p>
        <StatusBadge status={subTask.status} />
      </div>

      {details.length > 0 && <p className="mt-1 text-xs text-stone-400">{details.join(" · ")}</p>}

      {subTask.reviewNote && (
        <p className="mt-2 text-xs text-rose-300">Review note: {subTask.reviewNote}</p>
      )}

      {subTask.rows.length > 0 && (
        <div className="mt-4 space-y-3">
          {subTask.rows.map((row, index) => (
            <div key={index} className="border-b border-stone-800 pb-3 last:border-none last:pb-0">
              <p className="text-xs font-normal text-stone-400">{row.question}</p>
              <p className="mt-1 break-words text-sm font-medium text-white">
                {row.answer}{" "}
                {row.isCorrect !== undefined && (
                  <span className={row.isCorrect ? "text-emerald-400" : "text-rose-400"}>
                    {row.isCorrect ? "(Correct)" : "(Wrong)"}
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      )}

      {subTask.uploads.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {subTask.uploads.map((upload, index) => (
            <a key={upload} href={resolveMediaUrl(upload)} target="_blank" rel="noreferrer">
              <img
                src={resolveMediaUrl(upload)}
                alt={`Upload ${index + 1}`}
                className="h-28 w-28 rounded-md border border-stone-700 object-cover"
              />
            </a>
          ))}
        </div>
      )}

      {subTask.status === "IN_REVIEW" && <ReviewBox modelId={modelId} subTask={subTask} />}
    </div>
  );
};

export default function UniversityUnionContent({ modelId }: { modelId: string }) {
  const { data, isPending, isError } = useGetModelMansionUniversityUnion(modelId);
  const tasks: UnionTask[] = data?.tasks ?? [];
  const progress: UnionProgress | undefined = data?.progress;
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

  // Open on the task the model is on
  useEffect(() => {
    if (selectedNumber === null && tasks.length) {
      const current = tasks.find((task) =>
        task.subTasks.some((subTask) => subTask.key === progress?.currentKey),
      );
      setSelectedNumber(current?.number ?? tasks[0].number);
    }
  }, [tasks, progress, selectedNumber]);

  if (isPending) return <Loader />;

  if (isError) {
    return (
      <p className="py-8 text-center text-xs text-stone-500">
        Couldn&apos;t load University Union progress.
      </p>
    );
  }

  const progressItems = [
    { label: "Module", value: progress?.module?.title || "-" },
    {
      label: "Current Task",
      value: progress?.isComplete
        ? "All tasks completed"
        : `${progress?.currentKey ?? "-"} ${progress?.currentTitle ?? ""}`,
    },
    {
      label: "Progress",
      value: `${progress?.percentage ?? 0}% (${progress?.completed ?? 0}/${progress?.total ?? 0})`,
    },
    { label: "Last Completed", value: formatDate(progress?.lastCompletedAt) || "-" },
  ];

  const selectedTask = tasks.find((task) => task.number === selectedNumber);

  return (
    <div className="space-y-3">
      {/* Progress */}
      <details
        open
        className="overflow-hidden rounded-lg border border-stone-700 bg-black/20"
      >
        <summary className="flex h-11 cursor-pointer items-center justify-between border-b border-stone-700 bg-white/10 px-4 text-sm font-medium text-white list-none">
          Progress Details
          <NavArrowDownSolid className="h-4 w-4" />
        </summary>

        <div className="grid grid-cols-2 gap-y-6 gap-x-8 p-5 md:grid-cols-4">
          {progressItems.map((item) => (
            <div key={item.label}>
              <p className="text-[11px] text-stone-400 text-xs font-normal">
                {item.label}
              </p>

              <p className="mt-2 text-sm font-medium text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </details>

      {/* Tasks */}

      <details
        open
        className="overflow-hidden rounded-lg border border-stone-700 bg-black/20"
      >
        <summary className="flex h-11 cursor-pointer items-center justify-between border-b border-stone-700 bg-white/10 px-4 text-sm font-medium text-white list-none">
          Tasks
          <NavArrowDownSolid className="h-4 w-4" />
        </summary>

        <div className="p-4">
          <div className="mb-5 flex flex-wrap gap-2">
            {tasks.map((task) => {
              const waiting = task.subTasks.some((subTask) => subTask.status === "IN_REVIEW");
              return (
                <button
                  key={task.number}
                  type="button"
                  title={task.title}
                  onClick={() => setSelectedNumber(task.number)}
                  className={`relative rounded-md px-4 py-2 text-sm font-medium ${
                    task.number === selectedNumber
                      ? "bg-pink-500 text-white"
                      : task.status === "LOCKED"
                        ? "bg-stone-800 text-stone-500"
                        : "bg-stone-700 text-stone-200"
                  }`}
                >
                  Task {task.number}
                  {waiting && (
                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-400" />
                  )}
                </button>
              );
            })}
          </div>

          {selectedTask && (
            <>
              <p className="mb-4 text-xs text-stone-400">
                <span className="text-white">{selectedTask.title}</span>
                {" · "}
                {selectedTask.completed}/{selectedTask.total} completed
              </p>
              <div className="space-y-3">
                {selectedTask.subTasks.map((subTask) => (
                  <SubTaskCard key={subTask.key} modelId={modelId} subTask={subTask} />
                ))}
              </div>
            </>
          )}
        </div>
      </details>
    </div>
  );
}
