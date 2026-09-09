"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ChevronDown, Circle, PlayCircle } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { urlFor } from "@/sanity/lib/image";
import { cn } from "@/lib/utils";
import type { getLessonSidebarData } from "@/sanity/lib/lesson";

type SidebarData = NonNullable<ReturnType<typeof getLessonSidebarData>>;

interface LessonSidebarProps {
  data: SidebarData;
  currentLessonId: string;
}

export function LessonSidebar({ data, currentLessonId }: LessonSidebarProps) {
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(data.modules.filter((module) => module.isActive).map((module) => module.key)),
  );

  function toggleModule(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  return (
    <aside className="w-full shrink-0 border-neutral-200 lg:w-[280px] lg:border-r">
      <div className="p-6">
        <Link
          href={`/courses/${data.course.slug}`}
          className="inline-flex items-center gap-1.5 text-body text-neutral-700 hover:text-primary-500"
        >
          <ArrowLeft className="size-4" strokeWidth={2} />
          Back to course
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <div className="relative size-11 shrink-0 overflow-hidden rounded-sm bg-neutral-900">
            {data.course.coverImage?.asset?.url ? (
              <Image
                src={urlFor(data.course.coverImage).width(88).height(88).url()}
                alt={data.course.coverImage.alt ?? data.course.title}
                fill
                className="object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-heading-3 text-neutral-900">{data.course.title}</h2>
            <ProgressBar value={data.percentComplete} showLabel className="mt-1" />
          </div>
        </div>
      </div>

      <ol className="border-t border-neutral-200">
        {data.modules.map((module) => {
          const isOpen = expanded.has(module.key);
          return (
            <li key={module.key} className="border-b border-neutral-200">
              <button
                type="button"
                onClick={() => toggleModule(module.key)}
                aria-expanded={isOpen}
                className={cn(
                  "flex w-full items-center gap-3 px-6 py-4 text-left",
                  module.isActive && "bg-primary-100",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full font-sans text-xs",
                    module.isActive
                      ? "bg-primary-500 text-white"
                      : module.status === "complete"
                        ? "text-primary-500"
                        : "border border-neutral-300 text-neutral-700",
                  )}
                >
                  {module.status === "complete" && !module.isActive ? (
                    <CheckCircle2 className="size-5" strokeWidth={2} />
                  ) : (
                    module.moduleNumber
                  )}
                </span>
                <span className="flex-1">
                  <span className="block text-heading-3 text-neutral-900">{module.title}</span>
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-neutral-500 transition-transform",
                    isOpen && "rotate-180",
                  )}
                  strokeWidth={2}
                />
              </button>

              {isOpen ? (
                <ul className="pb-2">
                  {module.lessons.map((lesson) => {
                    const isCurrent = lesson._id === currentLessonId;
                    return (
                      <li key={lesson._id}>
                        <Link
                          href={`/lessons/${lesson.slug}`}
                          className={cn(
                            "flex items-center gap-3 px-6 py-2.5 text-body",
                            isCurrent
                              ? "font-medium text-primary-500"
                              : "text-neutral-700 hover:text-primary-500",
                          )}
                        >
                          {lesson.status === "complete" ? (
                            <CheckCircle2 className="size-4 shrink-0 text-primary-500" strokeWidth={2} />
                          ) : isCurrent ? (
                            <PlayCircle className="size-4 shrink-0 text-primary-500" strokeWidth={2} />
                          ) : (
                            <Circle className="size-4 shrink-0 text-neutral-300" strokeWidth={2} />
                          )}
                          <span className="flex-1">
                            {lesson.title}
                            {isCurrent ? (
                              <span className="block text-small text-primary-500">Now playing</span>
                            ) : (
                              <span className="block text-small text-neutral-500">
                                {lesson.duration}
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
