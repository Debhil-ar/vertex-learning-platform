"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { SearchInput } from "@/components/ui/input";

export function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    posthog.capture("course_search_submitted", {
      query_length: query.length,
    });
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-xl">
      <SearchInput
        placeholder="Ask anything about your learning..."
        shortcut="⌘K"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
}
