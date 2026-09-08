"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Star } from "lucide-react";
import { Nav } from "@/components/ui/nav";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { CourseCard } from "@/components/ui/course-card";

const courses = [
  {
    title: "Next.js for Production",
    description: "Build scalable, high-performance web applications with Next.js.",
    level: "Intermediate",
    duration: "18h 24m",
    moduleCount: 12,
    avatarLetter: "N",
    avatarBg: "bg-neutral-900",
  },
  {
    title: "Docker Essentials",
    description: "Containerize applications and streamline your development workflow.",
    level: "Beginner",
    duration: "10h 12m",
    moduleCount: 8,
    avatarLetter: "D",
    avatarBg: "bg-sky-500",
  },
  {
    title: "TypeScript Deep Dive",
    description: "Go beyond the basics and write safer, more expressive code.",
    level: "Intermediate",
    duration: "14h 36m",
    moduleCount: 10,
    avatarLetter: "TS",
    avatarBg: "bg-blue-600",
  },
];

const barHeights = [40, 64, 96, 56, 80, 48, 72, 100, 60, 88, 44, 76];

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

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
                icon={<ArrowRight className="size-4" strokeWidth={2} />}
                onClick={() => router.push("/courses")}
              >
                Explore Courses
              </Button>
            </div>

            <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-xl">
              <SearchInput
                placeholder="Ask anything about your learning..."
                shortcut="⌘K"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </form>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1440px] px-6 py-12">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-heading-1 text-neutral-900">All Courses</h2>
            <a
              href="/courses"
              className="inline-flex items-center gap-1 text-body font-medium text-primary-500 hover:text-primary-400"
            >
              View all courses
              <ArrowRight className="size-4" strokeWidth={2} />
            </a>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.title} {...course} />
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
