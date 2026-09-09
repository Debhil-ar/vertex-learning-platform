# Implement Intelligent Search (Lesson results, MCP-grounded)

## Goal

Wire up real search: connect the Sanity Context MCP server to a server-side search API that uses
an LLM to find matching lessons, then render a full results page (`design/vertex-search.png`)
using the existing `Lesson`-kind card style. Grounded in real Sanity data end to end — the LLM only
ever picks which lessons match; every field shown on a card is re-fetched straight from Sanity, so
nothing the model writes reaches the screen verbatim.

**Scoped to lesson results only** (confirmed with the user). There is no video document schema,
chapters, or transcripts yet (AGENTS.md section 8–9's ingestion pipeline hasn't been built), so
"video moment" results with a real matched second aren't possible without inventing a timestamp,
which the grounding rule (section 7/11) forbids. This task ships the `Lesson` result card only;
video-moment results are a separate future task once the video pipeline exists.

## Skills / docs read

- `AGENTS.md` root — section 5 (search API is a server route that connects to MCP, injects schema
  + system prompt, calls the LLM, streams back; the search UI is a client component rendering from
  that response), section 6 (Vercel AI SDK + OpenAI provider, Zod for structured output), section 7
  (search is Context MCP + LLM surfaced as result cards not a chatbox; grounded — never invent a
  course/lesson/price/timestamp; PostHog should capture "a search performed"), section 8 (lesson has
  no parent-course reference — derive via reverse reference; module numbers are derived from array
  order, never stored), section 10 (Context document = content scope filter + query instructions,
  edited by import/MCP if the Studio plugin isn't available), section 11 (full results page, not a
  widget/chatbox; result count + sort control defaulting to most relevant; never cap to a handful;
  empty state points to the catalog; text match is token-based — wildcard/OR, and Portable Text
  needs a plain-text projection, not direct match), section 12 (Context MCP needs a deployed Studio
  — confirmed already deployed; `@sanity/context` Studio plugin requires `sanity: ^6` — this Studio
  is on `^5.31.2`, so per this section **do not install it**, edit the Context document directly
  instead; never return whole transcripts/chunks — moot here, no video docs exist; keep the read
  token server-only; cache initial context, so instruction/prompt edits need a server restart).
- `create-agent-with-sanity-context` skill (`agent/skills/.../SKILL.md` + `references/nextjs-agent.md`
  + `references/studio-setup.md`) — the MCP connection pattern (`createMCPClient` over HTTP with a
  Bearer token), fetching `/initial-context` once and caching it, excluding the `initial_context`
  tool from the tools passed to the model, and the `sanity.agentContext` document shape.
- `dial-your-context` skill — used its Instructions-authoring rules (pure deltas only, nothing the
  schema already makes obvious) to write the Context document's `instructions` field below, and its
  guidance on the `groqFilter` field.
- `shape-your-agent` skill — used its "less is more" structure (role / voice / boundaries / when you
  don't know) for the inline system prompt, skipping tone-crafting since this agent has no
  conversational voice — it only ever returns a ranked id list.

## Code inspected

- `design/vertex-search.png` — target layout: "SEARCH RESULTS" eyebrow, `Results for "query"`
  heading, result count, a search box, a "N results" / "Most Relevant" sort row, a card list mixing
  `VIDEO` and `LESSON` badge rows, and a persistent bottom banner ("Can't find what you're looking
  for? … Browse all courses"). Only the `LESSON`-badge row is in scope now: course icon + name,
  `LESSON` badge, title, description, a 3-item key-points checklist on the left, a `Module N` meta
  line, and a "View lesson →" action.
- `studio/schemaTypes/*` — confirmed there is no video document type, no `sanity.agentContext`
  usage anywhere yet, and lesson/course/module/instructor/category are the only document/object
  types that exist.
- `sanity/queries/{lesson,course,fragments}.ts`, `sanity/lib/{lesson,course,client}.ts` — confirmed
  the reverse-reference pattern for a lesson's course, the `defineQuery` + `sanityFetch` convention,
  the private-dataset server client (`SANITY_API_READ_TOKEN`, `useCdn: false`), and that
  `plainTextFragment` already exists in `fragments.ts` for `pt::text()` projections of Portable
  Text — built for exactly this kind of text search but unused until now.
- `sanity/lib/lesson.ts` (`getLessonPosition`) — the exact derivation for `Module N` / `Lesson N.M`
  labels from array order; reused the same approach for search result cards.
- `components/ui/{lesson-card,badge,input,select,button,course-card}.tsx`,
  `lib/course-preview.ts`, `app/design-system/page.tsx`, `app/courses/page.tsx`, `app/page.tsx` —
  existing primitives and conventions: `SearchInput` (with `⌘K` shortcut slot), `Select`,
  `Badge` (`video`/`lesson`/`popular` variants), the `LessonCard` component (already built, but its
  layout is a plain badge+title+description+meta+button card — the design's search row is a
  richer layout with a course icon/name row and a key-points checklist column, so a new
  purpose-built `SearchLessonCard` is needed rather than reusing `LessonCard` as-is), and the
  decorative `avatarLetter`/`avatarBg` cycling `toCoursePreview` uses for course icons.
- `lib/{posthog-server,video,utils,course-preview}.ts` — confirmed the split: `sanity/lib/*` does
  raw Sanity fetches, root `lib/*` does cross-cutting/shaping logic and server integrations
  (PostHog). The MCP+LLM orchestration belongs in root `lib/`, next to `posthog-server.ts`.
- `instrumentation-client.ts` / `components/ui/course-actions.tsx` — the PostHog capture convention
  (`posthog.capture(event, props)` from a client component, `posthog-js` import, fire once per
  meaningful moment).
- `proxy.ts` (Clerk middleware) — no route protection configured; search stays public browsing, no
  gating needed for `/search` or `/api/search`.
- `.env.example` / `.env.local` — confirmed `SANITY_API_READ_TOKEN`/`SANITY_API_WRITE_TOKEN` exist;
  no `OPENAI_API_KEY` yet.
- `studio/sanity.cli.ts`, `studio/package.json` — Studio deployment `appId` is already set
  (confirms a prior `sanity deploy`), Studio runs `sanity ^5.31.2`.
- Live checks run this session:
  - `npm info @sanity/context peerDependencies` → `{ sanity: '^6', ai: '^6.0.175', ... }` — confirms
    the plugin is incompatible with this Studio's `sanity ^5.31.2`. Per AGENTS.md section 12, it is
    **not** installed.
  - Downloaded the `@sanity/context` package and read `dist/studio.js` directly to get the exact
    `sanity.agentContext` field names without the plugin: `version` (string, hidden), `name`
    (string), `slug` (slug), `groqFilter` (string), `instructions` (text/string). This lets the
    Context document be created by a raw mutation with the write token, bypassing the Studio UI
    entirely, consistent with section 10/12's "create and edit this document by import" fallback.
  - `curl`'d the live MCP endpoint (`https://api.sanity.io/v2026-03-03/context/mcp/soq9evt7/production`)
    with the real read token and got a valid `tools/list` response (`initial_context`, `groq_query`,
    …) — confirms the Studio is already deployed and the MCP is reachable today, no Studio
    redeploy needed for this task (no new schema types are being added).
  - `npm info` for current versions: `ai@7.0.95`, `@ai-sdk/openai@4.0.63`, `@ai-sdk/mcp@2.0.46`,
    `zod@4.5.4` (peer range on all three AI SDK packages: `zod: ^3.25.76 || ^4.1.8`, so `zod@4.5.4`
    is compatible).

## Decisions / assumptions

1. **No `@sanity/context` Studio plugin, no Studio redeploy.** The Context document is created by a
   one-off script using `SANITY_API_WRITE_TOKEN` (same pattern as `studio/script/seed.ts`), writing
   a `sanity.agentContext` document directly with the field names found above. Conversation
   Insights stays unavailable, as AGENTS.md section 12 anticipates.
2. **Content filter:** `groqFilter: '_type in ["course", "lesson", "instructor", "category"]'`.
   `module` is excluded because it's an embedded object, not a document — it isn't a queryable
   `_type` on its own.
3. **Instructions field** (pure deltas the schema doesn't already say):
   - A lesson has no reference back to its course — find it with
     `*[_type == "course" && references(^._id)]`.
   - `module` is an embedded array item on `course.modules`, never its own document — module and
     lesson numbers ("Module 5", "Lesson 5.1") come from position in `modules[]` / `modules[].lessons[]`,
     never a stored field.
   - `lesson.notes` is Portable Text (an array of blocks) — text-match its plain projection with
     `pt::text(notes)`, never the raw array.
   - `lesson.keyPoints` is a plain array of strings and can be matched directly.
   - `lesson.freePreview` is a display label only, not an access filter — ignore it when filtering.
4. **MCP URL** is built server-side from `NEXT_PUBLIC_SANITY_PROJECT_ID` +
   `NEXT_PUBLIC_SANITY_DATASET` + a new `SANITY_CONTEXT_SLUG` env var (default `vertex-search`),
   not a full pasted URL — keeps project id/dataset defined in one place. Auth is the existing
   `SANITY_API_READ_TOKEN` as a Bearer token, since search only ever reads.
5. **Grounding via re-fetch, not trusting model text.** The model is given the MCP's `groq_query`
   tool plus one extra tool, `submit_results` (no `execute`, so the AI SDK stops the loop and hands
   its arguments back to us), typed with a Zod schema: `{ results: { lessonId: string, reason?:
   string }[] }`. The model's only job is to decide *which* lessons match and in what order — it
   never states a title, description, or timestamp. After the tool call, the route re-fetches those
   exact lesson ids directly against Sanity (not through the MCP) and builds every card field from
   that real document. Any id the model invents that doesn't resolve is silently dropped, never
   surfaced. This makes hallucination structurally harmless instead of something the prompt has to
   prevent through wording alone.
6. **Two-tool loop, capped steps.** `generateText` with `tools: { ...mcpTools (minus
   initial_context), submit_results }` and `stopWhen: stepCountIs(8)` — enough room for a few
   `groq_query` calls plus the final `submit_results` call. If the model never calls
   `submit_results` in budget, the route returns an empty result list rather than guessing.
7. **Initial context is fetched once and module-cached** (`fetchInitialContext()` memoized at module
   scope), per section 12 — instruction/system-prompt edits need a server restart to take effect,
   which is called out in the manual test steps below rather than worked around.
8. **The inline system prompt carries the same critical rules as the Context document**
   (grounding + specificity ranking), per section 11's "put the critical rules in both" — the
   Context document instructions are schema deltas; the system prompt additionally states the
   behavioral contract (must call `submit_results` exactly once, never fabricate, rank by
   specificity, don't cap to a handful of results).
9. **Result shaping done in code, not by the model:** `description` is the lesson's first ~140
   characters of `pt::text(notes)`; `keyPoints` shows up to 3 as authored; `moduleLabel` reuses the
   same derivation as `getLessonPosition`; the course icon reuses `toCoursePreview`'s
   `avatarLetter`/`avatarBg` cycling (by the result's position in the list, same as the catalog).
10. **The results page is a server shell + client component.** `app/search/page.tsx` is a thin
    Server Component (Nav + reads `?q=`); it renders `<SearchResults initialQuery={q} />`, a client
    component that owns the search box state, calls `POST /api/search`, renders loading / results /
    empty states, a client-side sort control (`Most Relevant` = API order, `Most Popular` = re-sort
    the already-fetched list by `studentCount` — no extra fetch, no invented field), and fires the
    `search_performed` PostHog event once results land. This matches section 5's split (server
    route does the MCP/LLM work; the client component renders from that response) and section 11
    (full results page with a count and a sort control).
11. **Sort control options are `Most Relevant` and `Most Popular` only**, not `Newest` — there's no
    lesson-level date field to sort by honestly, and inventing one would violate the grounding rule.
12. **The bottom "Browse all courses" banner is always shown** below the results list (matches the
    design showing it beneath a populated list), and becomes the sole content of a larger centered
    empty state when there are zero results, per section 11.
13. **No pagination** — section 11 says return all ranked results, not a capped page; the model is
    instructed not to artificially truncate, and the UI renders the full list it gets back.

## Files expected to touch

- `studio/script/seed-search-context.ts` — new one-off script (same shape as `seed.ts`) that writes
  the `sanity.agentContext` document with the write token. Run once, not part of the app.
- `sanity/queries/search.ts` — new `SEARCH_LESSONS_BY_IDS_QUERY` (uses `plainTextFragment('notes')`,
  the reverse-course-reference pattern, and enough of `course.modules[].lessons[]` to derive the
  module label).
- `sanity/lib/search.ts` — new `getLessonsByIds(ids)` server fetch helper (mirrors `lesson.ts`/
  `course.ts`).
- `lib/search.ts` — new server-only module: MCP client creation, cached initial context, the inline
  system prompt, the `submit_results` tool schema, `searchLessons(query)` orchestration, and the
  result-shaping step described in decision 9.
- `app/api/search/route.ts` — new POST route handler calling `searchLessons`.
- `app/search/page.tsx` — new Server Component page.
- `components/ui/search-results.tsx` — new client component (search box, sort control, states,
  PostHog capture).
- `components/ui/search-lesson-card.tsx` — new presentational card matching the design's `LESSON`
  row (course icon/name, badge, title, description, key-points checklist, module meta, action).
- `package.json` — add `ai`, `@ai-sdk/openai`, `@ai-sdk/mcp`, `zod`.
- `.env.example` / `.env.local` — add `OPENAI_API_KEY` and `SANITY_CONTEXT_SLUG`.

## Requirements

- Search is grounded end to end: every rendered field is re-fetched from Sanity by id; the model
  never contributes text or numbers to the page, only an ordered id list.
- Results page matches the design's `LESSON` row layout, count, sort control, and bottom banner.
- No result cap; empty state points at the full catalog.
- Search API is a POST server route; the browser never holds a Sanity token or calls the MCP/LLM
  directly.
- PostHog `search_performed` fires client-side with the public project key, once per completed
  search, carrying `{ query, result_count }`.
- Responsive down to mobile (stacked card layout), per section 3.

## Security considerations

- `SANITY_API_READ_TOKEN` and `OPENAI_API_KEY` are read only inside `lib/search.ts` /
  `sanity/lib/search.ts`, both server-only modules (`import 'server-only'`), never sent to the
  client.
- The search query string is user input — it's only ever passed as an LLM prompt value and as a
  parameter (`$query`/tool args) into `groq_query`, never string-interpolated into a hand-built GROQ
  string on our side (the MCP's own `groq_query` tool handles its internal query construction; our
  own `SEARCH_LESSONS_BY_IDS_QUERY` uses a parameterized `_id in $ids` filter, never interpolation).
- The `/api/search` route validates the incoming body (non-empty string query, reasonable max
  length) before doing anything with it, and returns a generic error on failure rather than leaking
  stack traces.

## Acceptance criteria

- Submitting a query on the home page (`HomeSearch`) navigates to `/search?q=...` and shows a
  real, non-empty result list for a query that genuinely matches seeded lesson content (e.g. "async
  await" or "caching").
- Every card's title, description, key points, module label, and course name match the real Sanity
  document for that lesson — spot-checked against Studio.
- A query with no genuine matches (e.g. "quantum blockchain") shows the empty state, not fabricated
  results.
- The result count in the heading matches the number of cards rendered.
- The sort control re-orders the same result set without a new network request.
- "View lesson" on a card navigates to that lesson's real `/lessons/[slug]` page.
- `search_performed` appears in PostHog (or console/dev tools network tab if PostHog isn't
  configured locally) with the query and result count.

## Checks to run

- In web (root): `npm run lint`, `npx tsc --noEmit`, `npm run build` (new route + server modules),
  `npm run dev` for manual verification.
- Verify the live MCP endpoint directly (already confirmed reachable this session) after the
  Context document is written, by requesting
  `https://api.sanity.io/v2026-03-03/context/mcp/soq9evt7/production/vertex-search/initial-context`
  with the read token and confirming the `instructions` content appears.

## Manual test steps

1. Add a real `OPENAI_API_KEY` to `.env.local` (required — no key is present today).
2. From `studio/`, run the new `tsx script/seed-search-context.ts` once to create the
   `sanity.agentContext` document, then confirm via a direct `curl` to the
   `.../vertex-search/initial-context` endpoint that the instructions are live.
3. From the root, `npm run dev`.
4. On the home page, type a query that matches real seeded lesson content (e.g. "async await" or
   "caching") into the hero search box and submit.
5. Confirm `/search?q=...` renders: eyebrow, `Results for "…"` heading, a correct result count, the
   search box (still usable to re-search from this page), a sort control, one `LessonCard`-style row
   per matched lesson with real title/description/key points/module label/course name, and the
   "Browse all courses" banner at the bottom.
6. Click "View lesson" on a card and confirm it lands on that lesson's real page.
7. Switch the sort control to "Most Popular" and confirm the list re-orders without a network
   request (check dev tools).
8. Search a nonsense query ("quantum blockchain kayaking") and confirm the empty state renders
   instead of invented results.
9. Resize to mobile width and confirm the result cards stack cleanly with no horizontal scroll.
10. Confirm in PostHog (or the `/ingest` network calls in dev tools) that `search_performed` fired
    with the query and result count.
