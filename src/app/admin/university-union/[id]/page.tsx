"use client";

import Image from "next/image";
import dummyUserImg from "@/assets/images/dummyUserImg.png";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Check, NavArrowDownSolid } from "iconoir-react";

const labelClass = "text-xs font-normal text-stone-400";
const valueClass = "text-sm font-medium text-stone-100";
const controlClass =
  "h-11 w-full appearance-none rounded-md border border-stone-700 bg-transparent px-3 text-xs font-normal text-stone-200 outline-none transition-colors focus:border-rose-500";

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-2">
    <p className={labelClass}>{label}</p>
    <p className={valueClass}>{value}</p>
  </div>
);

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

const Panel = ({
  title,
  children,
  collapsible = false,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-md border border-stone-700 bg-black/10">
      <button
        type="button"
        onClick={() => collapsible && setIsOpen((prev) => !prev)}
        className="flex h-10 w-full items-center justify-between bg-white/10 px-4"
      >
        <h2 className="text-sm font-medium text-stone-100">{title}</h2>

        {collapsible && (
          <NavArrowDownSolid
            className={`h-4 w-4 text-stone-300 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {isOpen && <div className="px-2 pt-3 pb-3">{children}</div>}
    </section>
  );
};

const SelectControl = ({ label }: { label: string }) => (
  <label className="block">
    <span className="mb-2 block text-xs font-normal text-stone-200">
      {label}
    </span>
    <div className="relative">
      <select defaultValue="1 Star" className={`${controlClass} pr-9`}>
        <option className="bg-neutral-900">1 Star</option>
        <option className="bg-neutral-900">2 Stars</option>
        <option className="bg-neutral-900">3 Stars</option>
        <option className="bg-neutral-900">4 Stars</option>
        <option className="bg-neutral-900">5 Stars</option>
      </select>
      <NavArrowDownSolid className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-300" />
    </div>
  </label>
);

const ReviewActivityPage = () => {
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState(0);

  return (
    <div className="w-full space-y-5 text-stone-100">
      <div className="grid grid-cols-12 items-stretch gap-x-2 gap-y-6">
        <div className="col-span-12 space-y-4 lg:col-span-8">
          <Panel title="Model Details" collapsible className="h-full">
            <div className="grid grid-cols-1 gap-x-20 gap-y-6 md:grid-cols-2">
              <DetailItem label="Model Name" value="Naomi" />
              <DetailItem label="Gender" value="Male" />
              <DetailItem label="Phone Number" value="+7 457 458 7896" />
              <DetailItem
                label="Email Address"
                value="johnsonalexu@gmail.com"
              />
            </div>
          </Panel>
        </div>
        <div className="col-span-12 space-y-4 lg:col-span-4">
          <section className="h-full overflow-hidden rounded-md border border-stone-700 bg-black/10">
            <div className="flex h-10 items-center justify-between bg-white/10 px-4">
              <h2 className="text-sm font-medium text-stone-100">
                Fatima Laurent
              </h2>

              <span className="text-xs font-semibold text-white/70">
                Associated Agent
              </span>
            </div>

            <div className="flex gap-4 p-4">
              <div className="relative h-25 w-20 shrink-0 overflow-hidden rounded-md">
                <Image
                  src={dummyUserImg}
                  alt="Agent"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col justify-center gap-2">
                {[
                  "Portfolio Reviews",
                  "TPP Photography Matching",
                  "Job Applications",
                  "Industry Questions",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-xs font-normal text-stone-300"
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#3DA755]">
                      <Check className="h-2.5 w-2.5 text-black stroke-[3]" />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
      <Panel title="Shoot Details" collapsible>
        <div className="grid grid-cols-1 gap-x-20 gap-y-6 md:grid-cols-3 mb-2 md:mb-4">
          <DetailItem label="Shoot Goal" value="Digitals" />
          <DetailItem label="Shoot Format" value="Portraits" />

          <DetailItem label="Shoot Vibes" value="Clean & Minimal" />
        </div>
      </Panel>
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
                type="button"
                onClick={() => setSelectedTask(index)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  selectedTask === index
                    ? "bg-pink-500 text-white"
                    : "bg-stone-700 text-stone-200 hover:bg-stone-600"
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
};

export default ReviewActivityPage;
