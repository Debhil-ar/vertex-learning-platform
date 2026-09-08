import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/ui/nav";
import { CourseCard } from "@/components/ui/course-card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getCourses } from "@/sanity/lib/course";
import { getCategories } from "@/sanity/lib/category";
import { toCoursePreview } from "@/lib/course-preview";

export const metadata: Metadata = {
  title: "All Courses | Vertex",
  description: "Browse every course on Vertex.",
};

const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; level?: string }>;
}) {
  const { category, level } = await searchParams;
  const [courses, categories] = await Promise.all([getCourses(), getCategories()]);

  const filteredCourses = courses.filter((course) => {
    if (category && course.category.slug !== category) return false;
    if (level && course.level !== level) return false;
    return true;
  });

  const hasFilters = Boolean(category || level);

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <Nav current="courses" />

      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-[1440px] px-6 py-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-heading-1 text-neutral-900">All Courses</h1>
              <p className="mt-1 text-body text-neutral-500">
                {filteredCourses.length} course{filteredCourses.length === 1 ? "" : "s"}
              </p>
            </div>

            <form className="flex flex-wrap items-end gap-3">
              <div className="w-44">
                <Select name="category" defaultValue={category ?? ""}>
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c.slug}>
                      {c.title}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="w-40">
                <Select name="level" defaultValue={level ?? ""}>
                  <option value="">All levels</option>
                  {LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </Select>
              </div>
              <Button type="submit" variant="secondary">
                Apply
              </Button>
              {hasFilters ? (
                <Link
                  href="/courses"
                  className="text-body font-medium text-primary-500 hover:text-primary-400"
                >
                  Clear filters
                </Link>
              ) : null}
            </form>
          </div>

          {filteredCourses.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course, index) => {
                const preview = toCoursePreview(course, index);
                return (
                  <Link key={preview.slug} href={`/courses/${preview.slug}`} className="block">
                    <CourseCard {...preview} />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-10 text-center">
              <p className="text-body text-neutral-500">No courses match these filters.</p>
              <Link
                href="/courses"
                className="mt-2 inline-block text-body font-medium text-primary-500 hover:text-primary-400"
              >
                Clear filters
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
