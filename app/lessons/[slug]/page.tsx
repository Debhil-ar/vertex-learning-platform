import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from "@portabletext/react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Clock,
  FileText,
  Lightbulb,
  Link2,
  PlayCircle,
  SignalHigh,
  Users,
} from "lucide-react";
import { Nav } from "@/components/ui/nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ResourceCard } from "@/components/ui/resource-card";
import { LessonSidebar } from "@/components/ui/lesson-sidebar";
import { LessonTabs } from "@/components/ui/lesson-tabs";
import { VideoPlayer } from "@/components/ui/video-player";
import { PageViewTracker } from "@/components/ui/page-view-tracker";
import {
  getLessonBySlug,
  getLessonNavigation,
  getLessonPosition,
  getLessonSidebarData,
} from "@/sanity/lib/lesson";
import { parseStartSeconds } from "@/lib/video";

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const RESOURCE_ICON: Record<string, typeof FileText> = {
  article: FileText,
  download: FileText,
  video: PlayCircle,
  link: Link2,
};

function getResourceIcon(type: string) {
  return RESOURCE_ICON[type] ?? FileText;
}

const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
  },
};

type Lesson = NonNullable<Awaited<ReturnType<typeof getLessonBySlug>>>;

/** First block's plain text, for the header's one-line lesson description. */
function getFirstBlockPlainText(notes: Lesson["notes"]): string | null {
  const firstBlock = notes?.find((block) => block._type === "block");
  if (!firstBlock || !Array.isArray(firstBlock.children)) return null;
  return firstBlock.children.map((child) => child.text ?? "").join("");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);
  if (!lesson) return {};
  return {
    title: `${lesson.title} | Vertex`,
    description: getFirstBlockPlainText(lesson.notes) ?? lesson.title,
  };
}

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { slug } = await params;
  const { t } = await searchParams;
  const lesson = await getLessonBySlug(slug);

  if (!lesson || !lesson.course) notFound();

  const position = getLessonPosition(lesson);
  const sidebarData = getLessonSidebarData(lesson);
  const { previous, next } = getLessonNavigation(lesson);
  const description = getFirstBlockPlainText(lesson.notes);

  return (
    <div className="flex flex-1 flex-col bg-neutral-50 pb-24">
      <Nav />
      <PageViewTracker
        event="lesson_viewed"
        properties={{
          lesson_slug: lesson.slug,
          lesson_title: lesson.title,
          course_slug: lesson.course.slug,
        }}
      />

      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col lg:flex-row">
        {sidebarData ? (
          <LessonSidebar data={sidebarData} currentLessonId={lesson._id} />
        ) : null}

        <main className="flex-1 px-6 py-8">
          <Breadcrumbs
            items={[
              { label: "All Courses", href: "/courses" },
              { label: lesson.course.title, href: `/courses/${lesson.course.slug}` },
              position?.moduleTitle ?? lesson.course.title,
              lesson.title,
            ]}
          />

          <div className="mt-6 flex items-start justify-between gap-4">
            <div>
              {position ? <Badge variant="lesson">Lesson {position.label.replace("Lesson ", "")}</Badge> : null}
              <h1 className="mt-3 font-display text-display-2 text-neutral-900">{lesson.title}</h1>
              {description ? (
                <p className="mt-3 max-w-2xl text-body-lg text-neutral-500">{description}</p>
              ) : null}
            </div>
            <button
              type="button"
              aria-label="Bookmark lesson"
              className="flex size-10 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
            >
              <Bookmark className="size-4" strokeWidth={2} />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-body text-neutral-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" strokeWidth={2} />
              {lesson.duration}
            </span>
            {lesson.course.level ? (
              <span className="inline-flex items-center gap-1.5">
                <SignalHigh className="size-4" strokeWidth={2} />
                {LEVEL_LABEL[lesson.course.level] ?? lesson.course.level}
              </span>
            ) : null}
            {lesson.studentCount ? (
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-4" strokeWidth={2} />
                {lesson.studentCount.toLocaleString()} students
              </span>
            ) : null}
          </div>

          <VideoPlayer
            videoUrl={lesson.videoUrl}
            startSeconds={parseStartSeconds(t)}
            lessonSlug={lesson.slug}
            lessonTitle={lesson.title}
            courseSlug={lesson.course.slug}
            className="mt-6 aspect-video w-full overflow-hidden rounded-lg bg-neutral-900"
          />

          <div className="mt-8">
            <LessonTabs
              lessonContent={
                <div className="space-y-8">
                  {lesson.notes && lesson.notes.length > 0 ? (
                    <section>
                      <h2 className="text-heading-1 text-neutral-900">Overview</h2>
                      <div className="mt-3 max-w-none text-body-lg text-neutral-700">
                        <PortableText
                          value={lesson.notes as PortableTextBlock[]}
                          components={portableTextComponents}
                        />
                      </div>
                    </section>
                  ) : null}

                  {lesson.keyPoints && lesson.keyPoints.length > 0 ? (
                    <section>
                      <h2 className="text-heading-1 text-neutral-900">In this lesson you will:</h2>
                      <ul className="mt-3 space-y-2.5">
                        {lesson.keyPoints.map((point) => (
                          <li
                            key={point}
                            className="flex items-start gap-2.5 text-body-lg text-neutral-700"
                          >
                            <CheckCircle2
                              className="mt-0.5 size-5 shrink-0 text-primary-500"
                              strokeWidth={2}
                            />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}

                  {lesson.proTip ? (
                    <div className="flex gap-3 rounded-md bg-primary-100 p-5">
                      <Lightbulb className="size-5 shrink-0 text-primary-500" strokeWidth={2} />
                      <div>
                        <h3 className="text-heading-3 text-neutral-900">Pro Tip</h3>
                        <p className="mt-1 text-body text-neutral-700">{lesson.proTip}</p>
                      </div>
                    </div>
                  ) : null}

                  {lesson.resources && lesson.resources.length > 0 ? (
                    <section>
                      <h2 className="text-heading-1 text-neutral-900">Resources</h2>
                      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {lesson.resources.map((resource) => (
                          <ResourceCard
                            key={resource.url}
                            title={resource.title}
                            description={resource.description ?? ""}
                            icon={getResourceIcon(resource.type)}
                            href={resource.url}
                          />
                        ))}
                      </div>
                    </section>
                  ) : null}
                </div>
              }
              notes={
                <textarea
                  placeholder="Add your notes while you watch..."
                  className="min-h-48 w-full rounded-md border border-neutral-200 bg-white p-4 text-body text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              }
            />
          </div>
        </main>
      </div>

      <div className="sticky bottom-0 border-t border-neutral-200 bg-white px-6 py-4">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4">
          {previous ? (
            <Button
              variant="tertiary"
              href={`/lessons/${previous.slug}`}
              className="flex-row-reverse"
            >
              <ArrowLeft className="size-4" strokeWidth={2} />
              <span className="ml-1.5 flex flex-col items-start text-left">
                <span className="text-small text-neutral-500">Previous Lesson</span>
                <span>{previous.title}</span>
              </span>
            </Button>
          ) : (
            <span />
          )}
          {next ? (
            <Button
              variant="primary"
              href={`/lessons/${next.slug}`}
              icon={<ArrowRight className="size-4" strokeWidth={2} />}
            >
              <span className="flex flex-col items-start text-left">
                <span className="text-small text-white/80">Next Lesson</span>
                <span>{next.title}</span>
              </span>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
