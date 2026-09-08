# Implement Sanity Content Model + Studio + Server Read Layer

## Goal

Stand up the core Sanity content model for Vertex (course, module, instructor, category, plus the
`lesson` documents modules reference) as a **standalone Studio workspace**, and build the server-only
read client and data-access layer in the Next.js app so pages can eventually fetch real content.
Video documents (ingestion), the progress record, and the agent context document are separate
future tasks (sections 8-10 of AGENTS.md) and are out of scope here — this task only covers course,
module, lesson, instructor, and category.

## Skills / docs read

- `AGENTS.md` (root) — section 5 (two standalone workspaces, never embed Studio in Next.js; pages
  are read-only; data access is a server-only Sanity client with a token), section 6 (tech stack:
  `next-sanity`, `@sanity/image-url`, TypeScript), section 8 (the exact field shapes and
  relationships for course/module/lesson/instructor/category are fixed — module is embedded not a
  document, lesson has no back-reference to its course), section 12 (dataset is private and needs a
  read token kept server-only; Context MCP later needs a *deployed* standalone Studio, not just a
  schema push), section 13 (checks: type check, lint, build in web; deploy Studio + schema in
  Studio).
- `sanity-best-practices` skill, `references/schema.md` — `defineType`/`defineField`/
  `defineArrayMember`, icons from `@sanity/icons/<Name>` subpaths, reference-vs-object decision
  matrix, letting Sanity generate `_id`s, the deprecation lifecycle for future schema changes.
- `sanity-best-practices` skill, `references/nextjs.md` — standalone Studio is the recommended
  architecture (section 1), Live Content API via `defineLive` for data fetching (section 2),
  CDN vs API tradeoff for `useCdn`, standalone Studio setup command and CORS step, error handling
  with `notFound()`.
- `sanity-best-practices` skill, `references/groq.md` — `defineQuery` for TypeGen, query fragments
  for reused projections (image, instructor summary), ordering before slicing.
- `content-modeling-best-practices` skill, `references/reference-vs-embedding.md` was consulted for
  the module-as-embedded-object vs lesson-as-document distinction (module has no independent
  existence or reuse outside its course, matching AGENTS.md's explicit call that module is "an
  embedded object inside a course, not its own document").

## Code inspected

- Repo root is currently a single Next.js app (create-next-app + `sanity init` merged into it):
  `app/`, `components/ui/`, `lib/utils.ts`, `design/` (reference PNGs), `prompts/` all live at repo
  root, one `package.json` with both `next`/`@clerk/nextjs` and `sanity`/`@sanity/vision` as
  dependencies.
- `app/studio/[[...tool]]/page.tsx` — embedded Studio route (`NextStudio`), to be deleted.
- `sanity.config.ts` / `sanity.cli.ts` (repo root) — Studio config with `basePath: '/studio'`,
  `structureTool`, `visionTool`; both read `projectId`/`dataset` from
  `NEXT_PUBLIC_SANITY_PROJECT_ID`/`NEXT_PUBLIC_SANITY_DATASET`. To be moved into the new `studio/`
  workspace and de-embedded (no `basePath`, no `'use client'` directive — standalone Studio configs
  are plain ESM run by Vite, not Next.js).
- `sanity/schemaTypes/index.ts` — empty `types: []`, confirms no schema exists yet.
- `sanity/structure.ts` — default `S.documentTypeListItems()`, fine to keep as-is for now (will
  auto-list the new document types).
- `sanity/env.ts`, `sanity/lib/client.ts`, `sanity/lib/live.ts`, `sanity/lib/image.ts` — the
  fetch-side plumbing already scaffolded for the web app; `client.ts` has `useCdn: true` and no
  token (fine for public reads, but AGENTS.md says the dataset is private, so every fetch needs a
  token — currently missing). `live.ts` follows the skill's `defineLive` pattern but currently
  passes no `serverToken`/`browserToken`.
- `.env.local` — has Clerk keys and `NEXT_PUBLIC_SANITY_PROJECT_ID`/`NEXT_PUBLIC_SANITY_DATASET`,
  but no `SANITY_API_READ_TOKEN`. No `.env.example` exists yet (AGENTS.md section 12 requires one).
- `components/ui/course-card.tsx`, `lesson-card.tsx`, `resource-card.tsx` — existing presentational
  components already shaped for course/lesson list items (title, level, duration, module count /
  key points), useful later for wiring real data but not touched in this task.
- `package.json` — single package for web + Studio deps; will be split.

## Decisions / assumptions

1. **Split into two standalone workspaces**, per your answer to the structure question:
   - New top-level `studio/` folder: its own `package.json` (`sanity`, `@sanity/vision`,
     `@sanity/icons`, `typescript`), own `node_modules`, own `sanity.config.ts` / `sanity.cli.ts`,
     and the schema (`studio/schemaTypes/`, `studio/structure.ts`). Run with `npm run dev` inside
     `studio/` (Vite, port 3333). No `basePath`, no `'use client'` — it's not mounted by Next.js
     anymore.
   - Repo root keeps being the web app as-is (no rename to `web/` — it already only holds pages,
     matching the spec's "a web workspace holds the Next.js pages"; renaming would churn every
     existing import and the already-committed home page/Clerk work for no functional gain).
   - Delete `app/studio/[[...tool]]/page.tsx` and the now-unused `sanity`/`@sanity/vision` deps from
     the root `package.json`. Keep `next-sanity` and `@sanity/image-url` at root (needed for
     fetching/rendering).
   - `sanity/env.ts` and `sanity/lib/*` stay at root (web-side fetch plumbing), and get a
     `SANITY_API_READ_TOKEN`-based server client added (see #4).
   - Both workspaces read the same `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET`
     from their own `.env` files (Studio's CLI config already does this via `process.env`, so
     `studio/.env` needs the same two vars, un-prefixed usage is fine since the Sanity CLI loads
     `.env` itself).
2. **Document types**: `course`, `lesson`, `instructor`, `category`. `module` is a reusable object
   type (not a document) embedded as an array on `course`, per AGENTS.md section 8's explicit
   instruction. No `video` document, no `agentContext` document, no `progress` document in this
   task — those are separate future tasks (sections 9, 10, and progress-tracking work).
3. **Field shapes**, filling in what AGENTS.md leaves to me, kept minimal (no overbuilding beyond
   what's named):
   - `category`: `title` (string, required), `slug` (slug from title, required, unique), `description`
     (text).
   - `instructor`: `name` (string, required), `slug` (slug from name, required, unique), `photo`
     (image, hotspot), `expertise` (array of strings — short tags like "React", "Backend"), `bio`
     (text).
   - `course`: `title` (string, required), `slug` (slug from title, required, unique), `summary`
     (text, for card/hero description), `coverImage` (image, hotspot, required), `level` (string,
     list: Beginner/Intermediate/Advanced, radio), `price` (number, required, min 0), `popular`
     (boolean, optional flag), `studentCount` (number, optional, display-only), `outcomes` (array of
     objects `{ icon: string (icon name/keyword, simple string field, not an image, since these are
     small UI icons not uploaded art), title: string, description: text }` for "what you'll learn"),
     `instructor` (reference to instructor, required), `category` (reference to category, required),
     `modules` (array of `module` objects, required, min 1).
   - `module` (object, not document): `title` (string, required), `summary` (text), `lessons` (array
     of `reference` to lesson, required, min 1). No stored numbering — module/lesson numbers are
     derived from array order in the frontend, per spec.
   - `lesson`: `title` (string, required), `slug` (slug from title, required, unique), `videoUrl`
     (url, required — this is what the future video ingestion pipeline keys off of), `poster` (image,
     hotspot, required), `duration` (string, e.g. "12:45" — matches how `course-card.tsx` /
     `lesson-card.tsx` already render duration as free text, not seconds), `freePreview` (boolean),
     `studentCount` (number, optional), `notes` (Portable Text array — the spec is explicit that
     lesson content is Portable Text, never markdown), `keyPoints` (array of strings, for "in this
     lesson you will"), `proTip` (text, optional), `resources` (array of objects
     `{ type: string (list: article/video/download/link), title: string, description: text, url:
     url }`).
   - No `course` reference stored on `lesson` (per spec: "derive the course with a reverse
     reference when you need it") — the reverse lookup is a GROQ query
     (`*[_type == "course" && references(^._id)][0]`-shaped) added to the data layer, not a schema
     field.
4. **Server-only read client and data layer**, in the web app:
   - Add `SANITY_API_READ_TOKEN` (server-only, no `NEXT_PUBLIC_` prefix) to `.env.local` (value
     supplied by you — I'll pause and ask you to paste a viewer token from manage.sanity.io if it's
     not already in your password manager) and to a new committed `.env.example` listing every var
     referenced anywhere in the repo (`NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`,
     `NEXT_PUBLIC_SANITY_API_VERSION`, `SANITY_API_READ_TOKEN`, plus the existing Clerk vars) with
     placeholder values.
   - Update `sanity/lib/client.ts` to pass the token so private-dataset reads work
     (`token: process.env.SANITY_API_READ_TOKEN`, `useCdn: false` when a token is present since
     authenticated requests bypass the CDN anyway).
   - Update `sanity/lib/live.ts`'s `defineLive` call to pass `serverToken`/`browserToken` per the
     skill's pattern (both set to `SANITY_API_READ_TOKEN` — there's no separate public/private split
     needed yet since nothing here is public content).
   - Render `<SanityLive />` in `app/layout.tsx` (not there yet), so Live Content API updates work
     once pages start fetching.
   - New `sanity/lib/queries.ts` (or split per type under `sanity/queries/`) with `defineQuery`-wrapped
     GROQ for: catalog list (course cards), single course by slug (with expanded instructor,
     category, modules→lessons), single lesson by slug (with derived parent course/module/lesson
     position via the reverse-reference query), instructor by slug (+ their courses), category by
     slug (+ its courses). These are exported for future pages to call — this task does not wire any
     page to them yet (pages stay on their current mock data; wiring the catalog/course/lesson pages
     to real data is a follow-up task once content exists to fetch).
   - Run `sanity typegen generate` (needs a `sanity-typegen.json` / config addition) once schema +
     queries exist, and commit the generated types so the data layer is fully typed.
5. **Icons**: every schema type gets an `@sanity/icons/<Name>` icon (e.g. `DocumentTextIcon` for
   lesson, `UserIcon` for instructor, `TagIcon` for category, `BookIcon`/`DocumentIcon` for course)
   per the schema skill's UX guidance.
6. **No content is seeded.** This task ships schema + Studio + data layer only; populating actual
   courses is a separate content-authoring step you'll do in the deployed Studio.

## Files expected to touch

Create:
- `studio/package.json`, `studio/tsconfig.json`, `studio/sanity.config.ts`, `studio/sanity.cli.ts`,
  `studio/.env` (gitignored, mirrors root's Sanity vars), `studio/schemaTypes/index.ts`,
  `studio/schemaTypes/course.ts`, `lesson.ts`, `instructor.ts`, `category.ts`, `module.ts` (object),
  `studio/structure.ts`.
- `.env.example` (repo root).
- `sanity/queries/course.ts`, `lesson.ts`, `instructor.ts`, `category.ts` (or one `queries.ts`,
  decided while writing based on size).
- `sanity-typegen.json` (root) and generated `sanity/types.ts` (or wherever TypeGen writes by
  convention) once queries exist.

Modify:
- `package.json` (root) — remove `sanity`, `@sanity/vision`; add a `typegen` script.
- `sanity/lib/client.ts`, `sanity/lib/live.ts` — add token.
- `app/layout.tsx` — render `<SanityLive />`.
- `.env.local` — add `SANITY_API_READ_TOKEN`.
- `.gitignore` — confirm `studio/node_modules` and `studio/.env` are covered (already covered by
  existing blanket `/node_modules` and `.env*` rules if those rules apply repo-wide; verify glob
  scope since `/node_modules` is root-anchored and `studio/node_modules` needs its own ignore, or
  the rule needs to change to `node_modules` unanchored).

Delete:
- `app/studio/[[...tool]]/page.tsx` (and the now-empty `app/studio/` dir).
- Root `sanity.config.ts`, `sanity.cli.ts` (superseded by the `studio/` copies).

## Requirements

- Studio runs standalone (`npm run dev` inside `studio/`, separate from `next dev`), with no
  Next.js coupling.
- Schema matches AGENTS.md section 8 exactly for the fixed relationships/fields; my additions
  (level options, resource types, etc.) are sensible defaults, not blockers — flag anything you want
  changed after reviewing.
- `module` is an object type, embedded only inside `course.modules`, never a standalone document.
- `lesson` has no field referencing its parent course.
- All document types are registered in `studio/schemaTypes/index.ts` and appear in Studio's default
  document list (`structure.ts` unchanged, using `S.documentTypeListItems()`).
- The web app's Sanity client and `sanityFetch`/`SanityLive` use a server-only read token; nothing
  token-bearing is imported into a client component.
- `.env.example` is the canonical list of every env var used anywhere in the repo, with placeholder
  (non-secret) values.
- Root `package.json` no longer depends on `sanity`/`@sanity/vision`.

## Security considerations

- `SANITY_API_READ_TOKEN` has no `NEXT_PUBLIC_` prefix and is only read inside `sanity/lib/client.ts`
  and `sanity/lib/live.ts`, both server-only modules (no `'use client'`); it must never be imported
  by a client component or leaked into a `NEXT_PUBLIC_*` var.
- `.env.local` and `studio/.env` stay gitignored; only `.env.example` (placeholders) is committed.
- The Studio's own auth (who can log in and edit content) is Sanity's project-member auth, which is
  separate from and unaffected by Clerk — Clerk continues to gate the Next.js app only, per AGENTS.md
  section 5 ("Auth is Clerk... Data access is a server only Sanity client").

## Acceptance criteria

- [ ] `cd studio && npm install && npm run dev` starts Sanity Studio standalone on its own port,
      independent of the Next.js app, showing Course / Lesson / Instructor / Category in the
      document list.
- [ ] Creating a course in Studio lets you add modules inline, each module lets you add an ordered
      list of lesson references, and lesson documents are created/selected independently.
- [ ] `app/studio/[[...tool]]/page.tsx` no longer exists; visiting `/studio` in the Next.js app
      returns a normal 404 rather than a mounted Studio.
- [ ] `npm run build` in Studio (`sanity build` or the workspace's build script) succeeds — required
      before the Context MCP will serve the dataset later.
- [ ] In the web app: `npm run lint` and a TypeScript check both pass with the new query/type files.
- [ ] `npm run build` in the web app succeeds (root `layout.tsx` and lib changes are build-relevant).
- [ ] The GROQ queries in `sanity/queries/*` type-check against TypeGen output with no `any`.
- [ ] No client component or bundle references `SANITY_API_READ_TOKEN`.

## Checks to run

- Studio workspace: `npm install`, `npx sanity schema deploy` (or the newer equivalent — verify
  current CLI command name against installed version), `npx sanity deploy` to publish the Studio
  application (required per AGENTS.md section 12 before the Context MCP can serve this dataset —
  even though search isn't built yet, doing this now avoids a surprise later).
- Web workspace (repo root): `npm run lint`, `npx tsc --noEmit` (or however the project's type check
  is invoked — confirm script name), `npm run build`.

## Manual test steps

1. `cd studio && npm install`.
2. `npm run dev` in `studio/` — confirm it opens Studio on localhost:3333 (or configured port) with
   no Next.js involved.
3. In Studio, create one Category, one Instructor, then a Course referencing both; add two modules,
   each with one or two Lesson references (creating the lessons inline or beforehand).
4. Confirm the Course document shows modules in the order you added them, and each module's lessons
   list preserves order (drag to reorder, confirm it persists).
5. Publish the documents.
6. `cd ..` (repo root), confirm `SANITY_API_READ_TOKEN` is set in `.env.local`, run `npm run dev` for
   the web app, and separately run the generated queries against the live dataset (e.g. temporarily
   log the result of the catalog query in a scratch script or the terminal via `sanity exec`/a Node
   script using `sanity/lib/client.ts`) to confirm the token-authenticated client can read the
   private dataset and the course/module/lesson/instructor/category shape comes back as expected.
7. Visit `/studio` on the Next.js dev server (localhost:3000) and confirm it 404s.
8. Run `npm run lint` and the type check in the web app; run the Studio's build command in `studio/`.
