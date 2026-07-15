"use client";
import { NavArrowDownSolid } from "iconoir-react";

const progress = [
  {
    label: "Current Chapter",
    value: "Model",
  },
  {
    label: "Module",
    value: "2",
  },
  {
    label: "Task",
    value: "10",
  },
  {
    label: "Progress",
    value: "68%",
  },
];

const tasks = [
  "Task 1",
  "Task 2",
  "Task 3",
  "Task 4",
  "Task 5",
  "Task 6",
  "Task 7",
  "Task 8",
  "Task 9",
  "Task 10",
];

const answers = [
  {
    no: "1.1",
    question:
      "Select the 6 most important things to look at when choose a profile picture.",
    answer: "Clear Face, Good Lighting",
  },
  {
    no: "1.1",
    question: "Do you have a good profile picture already?",
    answer: "No, I don't",
  },
  {
    no: "1.2",
    question: "Which niche are you most interested in?",
    answer: "Fitness, Influencer, Commercial",
  },
  {
    no: "1.2",
    question: "How long have you been active in this niche?",
    answer: "Less than a Year",
  },
];

export default function UniversityUnionContent() {
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
          {progress.map((item) => (
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
          <div className="mb-5 flex flex-wrap gap-2">
            {tasks.map((task, index) => (
              <button
                key={task}
                className={`rounded-md px-4 py-2 text-sm font-medium ${
                  index === 0
                    ? "bg-pink-500 text-white"
                    : "bg-stone-700 text-stone-200"
                }`}
              >
                {task}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {answers.map((item, index) => (
              <div
                key={index}
                className="flex gap-4 border-b border-stone-800 pb-4 last:border-none"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded bg-stone-700 text-sm font-medium  text-white">
                  {item.no}
                </div>

                <div className="flex-1">
                  <p className="text-xs font-normal text-stone-400">
                    {item.question}
                  </p>

                  <p className="mt-1 text-sm font-medium text-white">
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </details>
    </div>
  );
}
