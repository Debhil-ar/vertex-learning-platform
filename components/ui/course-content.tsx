"use client";

import { useState } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import { ChevronDown, Lock, PlayCircle } from "lucide-react";
import { cn, formatSecondsAsDuration, parseDurationToSeconds } from "@/lib/utils";

interface Lesson {
  _id: string;
  title: string;
  slug: string;
  duration: string;
  freePreview: boolean | null;
}

interface Module {
  _key: string;
  title: string;
  summary: string | null;
  lessons: Lesson[];
}

const INITIAL_VISIBLE_MODULES = 6;

function moduleDurationSeconds(module: Module): number {
  return module.lessons.reduce(
    (total, lesson) => total + parseDurationToSeconds(lesson.duration),
    0,
  );
}

export function CourseContent({ modules }: { modules: Module[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const totalSeconds = modules.reduce(
    (total, module) => total + moduleDurationSeconds(module),
    0,
  );
  const visibleModules =
    showAll || modules.length <= INITIAL_VISIBLE_MODULES
      ? modules
      : modules.slice(0, INITIAL_VISIBLE_MODULES);

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
    <section className="rounded-lg border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-200 p-6 sm:p-8 sm:pb-6">
        <h2 className="font-display text-heading-1 text-neutral-900">Course Content</h2>
        <span className="text-body text-neutral-500">
          {modules.length} modules &bull; {formatSecondsAsDuration(totalSeconds)}
        </span>
      </div>

      <ol>
        {visibleModules.map((module, index) => {
          const isOpen = expanded.has(module._key);
          const moduleSeconds = moduleDurationSeconds(module);
          return (
            <li key={module._key} className="border-b border-neutral-200 last:border-b-0">
              <button
                type="button"
                onClick={() => toggleModule(module._key)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-4 px-6 py-5 text-left sm:px-8"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-neutral-300 font-sans text-sm text-neutral-700">
                  {index + 1}
                </span>
                <span className="flex-1">
                  <span className="block text-heading-3 text-neutral-900">{module.title}</span>
                  {module.summary ? (
                    <span className="mt-1 block text-body text-neutral-500">
                      {module.summary}
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-body text-neutral-500">
                  {formatSecondsAsDuration(moduleSeconds)}
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
                <ul className="border-t border-neutral-100 bg-neutral-50 px-6 py-2 sm:px-8">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <li key={lesson._id}>
                      <Link
                        href={`/lessons/${lesson.slug}`}
                        className="flex items-center gap-3 py-3 text-body text-neutral-700 hover:text-primary-500"
                        onClick={() =>
                          posthog.capture("course_started", {
                            lesson_slug: lesson.slug,
                            module_title: module.title,
                            lesson_index: lessonIndex + 1,
                            module_index: index + 1,
                            is_free_preview: lesson.freePreview ?? false,
                          })
                        }
                      >
                        {lesson.freePreview ? (
                          <PlayCircle className="size-4 shrink-0 text-primary-500" strokeWidth={2} />
                        ) : (
                          <Lock className="size-4 shrink-0 text-neutral-400" strokeWidth={2} />
                        )}
                        <span className="flex-1">
                          Lesson {index + 1}.{lessonIndex + 1}: {lesson.title}
                        </span>
                        <span className="shrink-0 text-small text-neutral-500">
                          {lesson.duration}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ol>

      {modules.length > INITIAL_VISIBLE_MODULES ? (
        <div className="p-6 sm:p-8 sm:pt-6">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-neutral-200 bg-white py-2.5 font-sans text-sm text-neutral-700 hover:bg-neutral-100"
          >
            {showAll ? "Show fewer modules" : `Show all ${modules.length} modules`}
            <ChevronDown
              className={cn("size-4 transition-transform", showAll && "rotate-180")}
              strokeWidth={2}
            />
          </button>
        </div>
      ) : null}
    </section>
  );
}
