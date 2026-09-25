"use client";
import { useEffect, useState } from "react";
import { NavArrowDownSolid } from "iconoir-react";
import { useGetModelMansionUniversityUnion } from "@/hooks/useModelMansion";
import { formatDate, titleCase } from "../model-mansion/[id]/format";
import Loader from "./ui/Loader";
import { resolveMediaUrl } from "@/lib/media";

type QuizAnswer = {
  questionNumber: number;
  question: string;
  answer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

type SubmittedTask = {
  _id: string;
  title: string;
  answerType: string | null;
  taskNumber: number;
  milestone: number;
  rating: number;
  reviewed: boolean;
  submittedAt: string;
  quiz: QuizAnswer[];
  checkBox: string[];
  text: string;
  uploadLinks: string[];
};

const mediaUrl = (key: string) => resolveMediaUrl(key);

// Question / answer rows for one submitted task, whatever its answer type
const answerRows = (task: SubmittedTask) => {
  const rows: { no: string; question: string; answer: React.ReactNode }[] = [];
  const prefix = `${task.milestone}.${task.taskNumber}`;

  task.quiz.forEach((item) => {
    rows.push({
      no: `${prefix}.${item.questionNumber}`,
      question: item.question || "Question",
      answer: (
        <>
          {item.answer || "-"}{" "}
          <span className={item.isCorrect ? "text-emerald-400" : "text-rose-400"}>
            {item.isCorrect ? "(Correct)" : `(Correct: ${item.correctAnswer || "-"})`}
          </span>
        </>
      ),
    });
  });

  if (task.checkBox.length) {
    rows.push({ no: prefix, question: "Selected", answer: task.checkBox.join(", ") });
  }

  if (task.text) {
    rows.push({ no: prefix, question: "Written answer", answer: task.text });
  }

  if (task.uploadLinks.length) {
    rows.push({
      no: prefix,
      question: "Uploads",
      answer: (
        <span className="flex flex-wrap gap-2">
          {task.uploadLinks.map((link, index) => (
            <a
              key={link}
              href={mediaUrl(link)}
              target="_blank"
              rel="noreferrer"
              className="text-pink-400 underline"
            >
              File {index + 1}
            </a>
          ))}
        </span>
      ),
    });
  }

  return rows;
};

export default function UniversityUnionContent({ modelId }: { modelId: string }) {
  const { data, isPending, isError } = useGetModelMansionUniversityUnion(modelId);
  const tasks: SubmittedTask[] = data?.tasks ?? [];
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (tasks.length && !tasks.some((task) => task._id === selectedTaskId)) {
      setSelectedTaskId(tasks[0]._id);
    }
  }, [tasks, selectedTaskId]);

  if (isPending) return <Loader />;

  if (isError) {
    return (
      <p className="py-8 text-center text-xs text-stone-500">
        Couldn&apos;t load University Union progress.
      </p>
    );
  }

  const progress = data?.progress;
  const progressItems = [
    { label: "Current Chapter", value: titleCase(progress?.chapter) || "-" },
    { label: "Module", value: progress?.currentMilestone ?? "-" },
    { label: "Task", value: progress?.latestTaskNumber || "-" },
    {
      label: "Progress",
      value: `${progress?.percentage ?? 0}% (${progress?.completedTasks ?? 0}/${progress?.totalTasks ?? 0})`,
    },
  ];

  const selectedTask = tasks.find((task) => task._id === selectedTaskId);
  const rows = selectedTask ? answerRows(selectedTask) : [];

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

      {/* Submitted Answers */}

      <details
        open
        className="overflow-hidden rounded-lg border border-stone-700 bg-black/20"
      >
        <summary className="flex h-11 cursor-pointer items-center justify-between border-b border-stone-700 bg-white/10 px-4 text-sm font-medium text-white list-none">
          Submitted Answers
          <NavArrowDownSolid className="h-4 w-4" />
        </summary>

        <div className="p-4">
          {!tasks.length ? (
            <p className="py-4 text-center text-xs text-stone-500">
              No tasks submitted yet.
            </p>
          ) : (
            <>
              <div className="mb-5 flex flex-wrap gap-2">
                {tasks.map((task) => (
                  <button
                    key={task._id}
                    type="button"
                    title={task.title}
                    onClick={() => setSelectedTaskId(task._id)}
                    className={`rounded-md px-4 py-2 text-sm font-medium ${
                      task._id === selectedTaskId
                        ? "bg-pink-500 text-white"
                        : "bg-stone-700 text-stone-200"
                    }`}
                  >
                    Task {task.taskNumber}
                  </button>
                ))}
              </div>

              {selectedTask && (
                <p className="mb-4 text-xs text-stone-400">
                  <span className="text-white">{selectedTask.title}</span>
                  {" · "}Submitted {formatDate(selectedTask.submittedAt)}
                  {" · "}Rating {selectedTask.rating}
                  {" · "}
                  {selectedTask.reviewed ? "Reviewed" : "Awaiting review"}
                </p>
              )}

              <div className="space-y-4">
                {rows.length ? (
                  rows.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 border-b border-stone-800 pb-4 last:border-none"
                    >
                      <div className="flex h-10 min-w-10 items-center justify-center rounded bg-stone-700 px-1 text-sm font-medium text-white">
                        {item.no}
                      </div>

                      <div className="flex-1">
                        <p className="text-xs font-normal text-stone-400">
                          {item.question}
                        </p>

                        <p className="mt-1 text-sm font-medium text-white break-words">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-500">
                    This task was completed without a written answer.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </details>
    </div>
  );
}
