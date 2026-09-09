import type { Metadata } from "next";
import { Nav } from "@/components/ui/nav";
import { SearchResults } from "@/components/ui/search-results";

export const metadata: Metadata = {
  title: "Search | Vertex",
  description: "Search across every course and lesson on Vertex.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <Nav />
      <main className="flex flex-1 flex-col">
        <SearchResults initialQuery={q?.trim() ?? ""} />
      </main>
    </div>
  );
}
