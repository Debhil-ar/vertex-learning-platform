import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, Bookmark, Clock, Layers, SignalHigh, Users } from "lucide-react";
import { Nav } from "@/components/ui/nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CourseOutcomes } from "@/components/ui/course-outcomes";
import { CourseContent } from "@/components/ui/course-content";
import { getCourseBySlug, getCourseSlugs } from "@/sanity/lib/course";
import { urlFor } from "@/sanity/lib/image";
import { formatSecondsAsDuration, parseDurationToSeconds } from "@/lib/utils";

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export async function generateStaticParams() {
  const slugs = await getCourseSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return {};
  return {
    title: `${course.title} | Vertex`,
    description: course.summary,
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) notFound();

  const totalSeconds = course.modules.reduce(
    (total, module) =>
      total +
      module.lessons.reduce(
        (lessonTotal, lesson) => lessonTotal + parseDurationToSeconds(lesson.duration),
        0,
      ),
    0,
  );
  const firstLessonSlug = course.modules[0]?.lessons[0]?.slug;

  return (
    <div className="flex flex-1 flex-col bg-neutral-50 pb-24">
      <Nav />

      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-[1440px] px-6 py-8">
          <Breadcrumbs
            items={[{ label: "All Courses", href: "/courses" }, course.title]}
          />

          <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[340px_1fr]">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-900">
              {course.coverImage?.asset?.url ? (
                <Image
                  src={urlFor(course.coverImage).width(680).height(680).url()}
                  alt={course.coverImage.alt ?? course.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : null}
            </div>

            <div>
              {course.popular ? (
                <Badge variant="popular" className="mb-4">
                  Popular
                </Badge>
              ) : null}

              <h1 className="font-display text-display-2 text-neutral-900">{course.title}</h1>
              <p className="mt-4 max-w-xl text-body-lg text-neutral-500">{course.summary}</p>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-body text-neutral-500">
                <span className="inline-flex items-center gap-1.5">
                  <SignalHigh className="size-4" strokeWidth={2} />
                  {LEVEL_LABEL[course.level] ?? course.level}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4" strokeWidth={2} />
                  {formatSecondsAsDuration(totalSeconds)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="size-4" strokeWidth={2} />
                  {course.modules.length} modules
                </span>
                {course.studentCount ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="size-4" strokeWidth={2} />
                    {course.studentCount.toLocaleString()} students
                  </span>
                ) : null}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {firstLessonSlug ? (
                  <Button
                    variant="primary"
                    href={`/lessons/${firstLessonSlug}`}
                    icon={<ArrowRight className="size-4" strokeWidth={2} />}
                  >
                    Continue Learning
                  </Button>
                ) : null}
                <Button
                  variant="tertiary"
                  icon={<Bookmark className="size-4" strokeWidth={2} />}
                  type="button"
                >
                  Bookmark
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <CourseOutcomes outcomes={course.outcomes ?? []} />
          </div>

          <div className="mt-10">
            <CourseContent modules={course.modules} />
          </div>
        </div>
      </main>

      <div className="sticky bottom-0 border-t border-neutral-200 bg-white px-6 py-4">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-4">
          <div className="min-w-[220px] flex-1">
            <span className="block text-small text-neutral-500">Your Progress</span>
            <ProgressBar value={0} showLabel className="mt-1.5 max-w-md" />
          </div>
          {firstLessonSlug ? (
            <Button
              variant="primary"
              href={`/lessons/${firstLessonSlug}`}
              icon={<ArrowRight className="size-4" strokeWidth={2} />}
            >
              Continue Learning
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
