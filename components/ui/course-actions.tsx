"use client";

import { useEffect } from "react";
import { ArrowRight, Bookmark } from "lucide-react";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";

interface CourseActionsProps {
  courseSlug: string;
  courseTitle: string;
  courseLevel: string;
  firstLessonSlug: string | undefined;
}

export function CourseActions({
  courseSlug,
  courseTitle,
  courseLevel,
  firstLessonSlug,
}: CourseActionsProps) {
  useEffect(() => {
    posthog.capture("course_viewed", {
      course_slug: courseSlug,
      course_title: courseTitle,
      course_level: courseLevel,
    });
    // Only fire once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleBookmark() {
    posthog.capture("course_bookmarked", {
      course_slug: courseSlug,
      course_title: courseTitle,
      course_level: courseLevel,
    });
  }

  return (
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
        onClick={handleBookmark}
      >
        Bookmark
      </Button>
    </div>
  );
}
