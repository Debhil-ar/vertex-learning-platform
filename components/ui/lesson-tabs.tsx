"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LessonTabsProps {
  lessonContent: ReactNode;
  notes: ReactNode;
}

export function LessonTabs({ lessonContent, notes }: LessonTabsProps) {
  const [active, setActive] = useState<"content" | "notes">("content");

  return (
    <div>
      <div className="flex items-center gap-6 border-b border-neutral-200">
        {(
          [
            ["content", "Lesson Content"],
            ["notes", "Notes"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            className={cn(
              "-mb-px border-b-2 pb-3 font-sans text-sm font-medium",
              active === key
                ? "border-primary-500 text-primary-500"
                : "border-transparent text-neutral-500 hover:text-neutral-700",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">{active === "content" ? lessonContent : notes}</div>
    </div>
  );
}
