"use client";

import { type FormEvent, useRef } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Category {
  _id: string;
  slug: string;
  title: string;
}

interface CourseFilterFormProps {
  categories: Category[];
  defaultCategory: string;
  defaultLevel: string;
  hasFilters: boolean;
}

const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function CourseFilterForm({
  categories,
  defaultCategory,
  defaultLevel,
  hasFilters,
}: CourseFilterFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    const data = new FormData(e.currentTarget);
    const category = (data.get("category") as string) || "";
    const level = (data.get("level") as string) || "";
    if (category || level) {
      posthog.capture("course_filter_applied", {
        filter_category: category || null,
        filter_level: level || null,
      });
    }
  }

  return (
    <form ref={formRef} className="flex flex-wrap items-end gap-3" onSubmit={handleSubmit}>
      <div className="w-44">
        <Select name="category" defaultValue={defaultCategory}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c.slug}>
              {c.title}
            </option>
          ))}
        </Select>
      </div>
      <div className="w-40">
        <Select name="level" defaultValue={defaultLevel}>
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
  );
}
