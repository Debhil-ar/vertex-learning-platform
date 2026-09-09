import 'server-only'

import { createMCPClient } from '@ai-sdk/mcp'
import { openai } from '@ai-sdk/openai'
import { generateText, stepCountIs, tool } from 'ai'
import { z } from 'zod'

import { dataset, projectId } from '@/sanity/env'
import { getLessonsByIds, getSearchLessonModuleLabel, getSearchLessonModuleNumber } from '@/sanity/lib/search'

const readToken = process.env.SANITY_API_READ_TOKEN
const contextSlug = process.env.SANITY_CONTEXT_SLUG || 'vertex-search'

if (!readToken) {
  throw new Error('Missing environment variable: SANITY_API_READ_TOKEN')
}

const MCP_BASE_URL = `https://api.sanity.io/v2026-03-03/context/mcp/${projectId}/${dataset}/${contextSlug}`

// The model follows this more reliably than the Context document's
// instructions (AGENTS.md section 12), so the critical grounding and
// ranking rules are stated here too, not only in the Context document.
const SYSTEM_PROMPT = `You are the search agent for Vertex, a learning platform. You find which lessons match a learner's plain-language query.

## Your only job
Use groq_query to find lessons whose title, notes, or key points genuinely relate to the query. Then call submit_results exactly once with the matching lesson ids, ranked best match first. Do not respond with prose — the only output that matters is the submit_results call.

## Grounding
- Never invent a lesson, course, or field value. Only include a lesson id that a groq_query result actually returned.
- If nothing genuinely matches, call submit_results with an empty results array. An empty, honest answer is correct — do not pad with loosely related lessons.

## Ranking
- Rank by specificity: a lesson whose title contains the exact concept beats one that only mentions it in passing.
- Do not cap results to a small handful — include every lesson that is a genuine match.

## Search mechanics
- Text match is token-based. Wildcard your keywords and OR multiple terms, e.g. (title match "*cache*" || title match "*caching*"), never one long phrase as a single pattern.
- lesson.notes is Portable Text — match its plain-text projection, e.g. pt::text(notes) match "*term*", never the raw notes array.
- Only search "lesson" and "course" documents for this task.`

const submitResultsInputSchema = z.object({
  results: z
    .array(
      z.object({
        lessonId: z.string().describe('The lesson document _id, exactly as returned by groq_query.'),
        reason: z.string().optional().describe('One short phrase on why this lesson matches.'),
      }),
    )
    .describe('Matching lessons, ranked best match first. Empty if nothing genuinely matches.'),
})

let cachedInitialContext: Promise<string | null> | null = null

async function fetchInitialContext(): Promise<string | null> {
  try {
    const response = await fetch(`${MCP_BASE_URL}/initial-context`, {
      headers: { Authorization: `Bearer ${readToken}` },
    })
    if (!response.ok) return null
    const data = await response.json()
    return typeof data?.instructions === 'string' ? data.instructions : JSON.stringify(data)
  } catch {
    return null
  }
}

// Cached at module scope: instruction/prompt edits only take effect after a
// server restart (AGENTS.md section 12).
function getInitialContext(): Promise<string | null> {
  if (!cachedInitialContext) {
    cachedInitialContext = fetchInitialContext()
  }
  return cachedInitialContext
}

export interface SearchResultCard {
  lessonId: string
  slug: string
  title: string
  description: string
  keyPoints: string[]
  courseTitle: string
  courseSlug: string
  moduleLabel: string | null
  duration: string
  freePreview: boolean
  studentCount: number
  avatarLetter: string
  avatarBg: string
}

// Same decorative palette as lib/course-preview.ts's toCoursePreview — the
// schema has no color field, so this cycles by position in the result list.
const AVATAR_PALETTE = ['bg-neutral-900', 'bg-sky-500', 'bg-blue-600', 'bg-emerald-600', 'bg-violet-600']

export async function searchLessons(query: string): Promise<SearchResultCard[]> {
  const [initialContext, mcpClient] = await Promise.all([
    getInitialContext(),
    createMCPClient({
      transport: {
        type: 'http',
        url: MCP_BASE_URL,
        headers: { Authorization: `Bearer ${readToken}` },
      },
    }),
  ])

  try {
    const allMcpTools = await mcpClient.tools()
    // Its data is already fetched via fetchInitialContext() and injected
    // into the system prompt, so it's excluded here to avoid a redundant
    // tool call.
    const mcpTools = Object.fromEntries(
      Object.entries(allMcpTools).filter(([name]) => name !== 'initial_context'),
    )

    const system = initialContext ? `${SYSTEM_PROMPT}\n\n## Schema context\n${initialContext}` : SYSTEM_PROMPT

    const result = await generateText({
      model: openai('gpt-5-mini'),
      system,
      prompt: `Find lessons matching: ${query}`,
      stopWhen: stepCountIs(8),
      tools: {
        ...mcpTools,
        submit_results: tool({
          description:
            'Call exactly once, when you have finished searching, with the final ranked list of matching lesson ids.',
          inputSchema: submitResultsInputSchema,
        }),
      },
    })

    const submitCall = result.toolCalls.find((call) => call.toolName === 'submit_results')
    if (!submitCall) return []

    const parsed = submitResultsInputSchema.safeParse(submitCall.input)
    if (!parsed.success || parsed.data.results.length === 0) return []

    const orderedIds = parsed.data.results.map((r) => r.lessonId)
    const lessons = await getLessonsByIds(orderedIds)

    // Preserve the model's ranked order; silently drop any id that didn't
    // resolve to a real lesson (a hallucinated id is dropped, not shown).
    const lessonsById = new Map(lessons.map((lesson) => [lesson._id, lesson]))

    return orderedIds
      .map((id) => lessonsById.get(id))
      .filter((lesson): lesson is NonNullable<typeof lesson> => Boolean(lesson?.course))
      .map((lesson, index) => {
        const moduleNumber = getSearchLessonModuleNumber(lesson)
        const moduleTitle = getSearchLessonModuleLabel(lesson)
        return {
          lessonId: lesson._id,
          slug: lesson.slug ?? '',
          title: lesson.title,
          description: (lesson.notesPlainText ?? '').slice(0, 140),
          keyPoints: (lesson.keyPoints ?? []).slice(0, 3),
          courseTitle: lesson.course!.title,
          courseSlug: lesson.course!.slug ?? '',
          moduleLabel: moduleNumber ? `Module ${moduleNumber}${moduleTitle ? ` · ${moduleTitle}` : ''}` : null,
          duration: lesson.duration,
          freePreview: Boolean(lesson.freePreview),
          studentCount: lesson.studentCount ?? 0,
          avatarLetter: lesson.course!.title.charAt(0).toUpperCase(),
          avatarBg: AVATAR_PALETTE[index % AVATAR_PALETTE.length],
        } satisfies SearchResultCard
      })
  } finally {
    await mcpClient.close()
  }
}
