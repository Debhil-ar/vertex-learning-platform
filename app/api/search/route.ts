import { NextResponse } from "next/server";
import { z } from "zod";
import { searchLessons } from "@/lib/search";

const requestSchema = z.object({
  query: z.string().trim().min(1).max(200),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "A non-empty search query is required." }, { status: 400 });
  }

  try {
    const results = await searchLessons(parsed.data.query);
    return NextResponse.json({ query: parsed.data.query, results });
  } catch (error) {
    console.error("Search failed", error);
    return NextResponse.json({ error: "Search failed. Please try again." }, { status: 500 });
  }
}
