import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Nav } from "@/components/ui/nav";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/ui/course-card";
import { HomeSearch } from "@/components/ui/home-search";
import { getCourses } from "@/sanity/lib/course";
import { toCoursePreview } from "@/lib/course-preview";

const barHeights = [40, 64, 96, 56, 80, 48, 72, 100, 60, 88, 44, 76];

export default async function Home() {
  const courses = await getCourses();
  const previewCourses = courses.slice(0, 3).map(toCoursePreview);

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <Nav />

      <main className="flex flex-1 flex-col">
        <section className="border-b border-neutral-200 px-6 pt-20 pb-16 text-center">
          <div className="mx-auto w-full max-w-[1440px]">
            <span className="inline-flex items-center rounded-xs border border-primary-200 bg-primary-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary-500">
              Intelligent Learning
            </span>

            <h1 className="mx-auto mt-6 max-w-3xl font-display text-display-1 text-neutral-900">
              Search your learning in plain English.
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-body-lg text-neutral-500">
              Vertex understands what you want to learn and finds the exact lessons across all
              your courses.
            </p>

            <div className="mt-8 flex justify-center">
              <Button
                variant="primary"
                href="/courses"
                icon={<ArrowRight className="size-4" strokeWidth={2} />}
              >
                Explore Courses
              </Button>
            </div>

            <HomeSearch />
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1440px] px-6 py-12">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-heading-1 text-neutral-900">All Courses</h2>
            <Link
              href="/courses"
              className="inline-flex items-center gap-1 text-body font-medium text-primary-500 hover:text-primary-400"
            >
              View all courses
              <ArrowRight className="size-4" strokeWidth={2} />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {previewCourses.map((course) => (
              <Link key={course.slug} href={`/courses/${course.slug}`} className="block">
                <CourseCard {...course} />
              </Link>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden border-t border-neutral-200 px-6 pt-10 pb-0">
          <div className="mx-auto w-full max-w-[1440px]">
            <div className="flex items-center justify-center gap-4">
              <span className="h-px w-24 bg-neutral-200 sm:w-40" />
              <span className="inline-flex items-center gap-2 text-body text-neutral-700">
                <Star className="size-4 text-primary-500" strokeWidth={2} />
                New courses and lessons added every week.
              </span>
              <span className="h-px w-24 bg-neutral-200 sm:w-40" />
            </div>

            <div className="mt-10 flex h-40 items-end justify-center gap-3 sm:gap-4">
              {barHeights.map((height, i) => (
                <div
                  key={i}
                  className="w-8 rounded-t-xs sm:w-10"
                  style={{
                    height: `${height}%`,
                    background:
                      "linear-gradient(to top, rgba(251,146,60,0.9), rgba(251,146,60,0))",
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
