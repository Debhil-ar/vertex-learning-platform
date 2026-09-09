"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import posthog from "posthog-js";
import { SearchInput } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SearchLessonCard } from "@/components/ui/search-lesson-card";
import type { SearchResultCard } from "@/lib/search";

type SortOption = "relevant" | "popular";

interface SearchResultsProps {
  initialQuery: string;
}

export function SearchResults({ initialQuery }: SearchResultsProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<SortOption>("relevant");
  const [results, setResults] = useState<SearchResultCard[]>([]);
  const [settled, setSettled] = useState<{ query: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (!query) return;

    const controller = new AbortController();

    fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Search failed");
        const data = await response.json();
        setResults(data.results ?? []);
        setSettled({ query, ok: true });
        posthog.capture("search_performed", {
          query,
          result_count: data.results?.length ?? 0,
        });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error(error);
        setSettled({ query, ok: false });
      });

    return () => controller.abort();
  }, [query]);

  const status: "idle" | "loading" | "done" | "error" = !query
    ? "idle"
    : settled?.query !== query
      ? "loading"
      : settled.ok
        ? "done"
        : "error";

  const sortedResults = useMemo(() => {
    if (sort === "relevant") return results;
    // "Most Popular": re-sort the already-fetched list by each lesson's
    // real studentCount, no new request.
    return [...results].sort((a, b) => b.studentCount - a.studentCount);
  }, [results, sort]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    setQuery(trimmed);
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-12">
      <div className="text-center">
        <span className="inline-flex items-center rounded-xs border border-primary-200 bg-primary-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary-500">
          Search Results
        </span>
        <h1 className="mt-4 font-display text-heading-1 text-neutral-900">
          Results for &ldquo;{query}&rdquo;
        </h1>
        <p className="mt-1 text-body text-neutral-500">
          {status === "loading"
            ? "Searching…"
            : `Found ${sortedResults.length} result${sortedResults.length === 1 ? "" : "s"}`}
        </p>

        <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-xl">
          <SearchInput
            placeholder="Ask anything about your learning..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </form>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <p className="text-body font-medium text-neutral-900">
          {sortedResults.length} result{sortedResults.length === 1 ? "" : "s"}
        </p>
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="w-48"
        >
          <option value="relevant">Most Relevant</option>
          <option value="popular">Most Popular</option>
        </Select>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {status === "error" ? (
          <div className="rounded-md border border-neutral-200 bg-white p-10 text-center text-body text-neutral-500">
            Something went wrong running that search. Please try again.
          </div>
        ) : status === "done" && sortedResults.length === 0 ? (
          <EmptyState />
        ) : (
          sortedResults.map((result) => <SearchLessonCard key={result.lessonId} result={result} />)
        )}
      </div>

      {status === "done" && sortedResults.length > 0 ? (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-md border border-primary-200 bg-primary-100 p-6">
          <div className="flex items-center gap-3">
            <Search className="size-5 text-primary-500" strokeWidth={2} />
            <div>
              <p className="text-body font-medium text-neutral-900">
                Can&apos;t find what you&apos;re looking for?
              </p>
              <p className="text-small text-neutral-500">
                Try different keywords or browse our full course catalog.
              </p>
            </div>
          </div>
          <Button variant="primary" href="/courses">
            Browse all courses
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-md border border-neutral-200 bg-white p-16 text-center">
      <Search className="size-8 text-neutral-400" strokeWidth={2} />
      <div>
        <p className="text-body-lg font-medium text-neutral-900">No results found</p>
        <p className="mt-1 text-body text-neutral-500">
          Try different keywords or browse our full course catalog.
        </p>
      </div>
      <Button variant="primary" href="/courses">
        Browse all courses
      </Button>
    </div>
  );
}
