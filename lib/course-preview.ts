import type { getCourses } from "@/sanity/lib/course";
import { formatSecondsAsDuration, parseDurationToSeconds } from "@/lib/utils";

type Course = Awaited<ReturnType<typeof getCourses>>[number];

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

// Decorative, per-card letter-avatar colors — the schema has no color field,
// so this cycles a fixed palette by the course's position in the result list.
const AVATAR_PALETTE = [
  "bg-neutral-900",
  "bg-sky-500",
  "bg-blue-600",
  "bg-emerald-600",
  "bg-violet-600",
];

export function toCoursePreview(course: Course, index: number) {
  const totalSeconds = course.modules.reduce(
    (total, module) =>
      total +
      module.lessons.reduce(
        (lessonTotal, lesson) => lessonTotal + parseDurationToSeconds(lesson.duration),
        0,
      ),
    0,
  );

  return {
    slug: course.slug,
    title: course.title,
    description: course.summary,
    level: LEVEL_LABEL[course.level] ?? course.level,
    duration: formatSecondsAsDuration(totalSeconds),
    moduleCount: course.moduleCount,
    avatarLetter: course.title.charAt(0).toUpperCase(),
    avatarBg: AVATAR_PALETTE[index % AVATAR_PALETTE.length],
  };
}
