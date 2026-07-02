"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface TaskItem {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  badge?: string;
  badgeColor?: string;
}

interface Milestone {
  id: string;
  title: string;
  tasks: TaskItem[];
}

interface TaskTabProps {
  milestones: Milestone[];
}

const TaskTab: React.FC<TaskTabProps> = ({ milestones }) => {
  const [expandedMilestones, setExpandedMilestones] = useState<string[]>([]);
  const router = useRouter();

  const toggleMilestone = (id: string) => {
    setExpandedMilestones((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const handleBadgeClick = (task: TaskItem) => {
    if (task.badge === "Review Task" && task.badgeColor === "bg-rose-200") {
      router.push(`/admin/user-management/review-task/${task.id}`);
    }
  };

  return (
    <div className="flex flex-col justify-start items-center gap-5 w-full px-4">
      <div className="flex flex-col justify-center items-center gap-2.5 w-full">
        {milestones.length === 0 ? (
          <div className="text-sm sm:text-base text-muted-foreground italic ">
            No tasks available.
          </div>
        ) : (
          milestones.map((milestone) => {
            const isExpanded = expandedMilestones.includes(milestone.id);
            return (
              <div key={milestone.id} className="flex flex-col gap-2.5 w-full">
                {/* Milestone Header */}
                <div
                  onClick={() => toggleMilestone(milestone.id)}
                  className="w-full p-2.5 bg-stone-900 rounded-sm border-r border-b border-stone-700 flex justify-between items-center cursor-pointer"
                >
                  <div className="text-stone-200 text-sm sm:text-base font-extrabold ">
                    {milestone.title}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-stone-200 opacity-50" />
                  ) : (
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-stone-200 opacity-50" />
                  )}
                </div>

                {/* Milestone Tasks */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key="task-grid"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden w-full"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                        {milestone.tasks.length > 0 ? (
                          milestone.tasks.map((task) => (
                            <div
                              key={task.id}
                              className="w-full max-w-[300px] mx-auto px-4 pt-10 pb-4 relative bg-neutral-900 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col justify-start items-end gap-3 min-h-[150px]"
                            >
                              <div className="self-stretch flex flex-col justify-start items-start gap-4">
                                <div className="flex flex-col justify-start items-start gap-2">
                                  <div className="text-stone-200 text-base sm:text-lg font-extrabold ">
                                    {task.title}
                                  </div>
                                  <div className="text-stone-200 text-xs sm:text-sm font-normal ">
                                    {task.subtitle}
                                  </div>
                                </div>
                                {task.badge && (
                                  <div
                                    onClick={() => handleBadgeClick(task)}
                                    className={`px-3 py-1.5 rounded-[99px] inline-flex justify-center items-center gap-2.5 ${
                                      task.badgeColor || "bg-rose-200"
                                    } ${
                                      task.badge === "Review Task" &&
                                      task.badgeColor === "bg-rose-200"
                                        ? "cursor-pointer"
                                        : ""
                                    }`}
                                  >
                                    <div
                                      className={`text-xs sm:text-sm font-normal  ${
                                        task.badge?.includes("Rating")
                                          ? "text-stone-200"
                                          : "text-stone-950"
                                      }`}
                                    >
                                      {task.badge}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="px-3 py-1.5 top-2 right-2 absolute bg-stone-800 rounded-[99px] inline-flex justify-center items-center gap-2.5">
                                <div className="text-stone-200 text-xs sm:text-sm font-normal ">
                                  {task.status}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm sm:text-base text-muted-foreground px-2 py-1 italic col-span-full">
                            No tasks available.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TaskTab;
