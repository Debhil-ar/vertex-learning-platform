# Seed Sample Content (Categories, Instructors, Courses, Modules, Lessons)

## Goal

Populate the private Sanity dataset with realistic sample content so the catalog and cross-course
search have real data to work against: a handful of categories and instructors, and at least 10
courses spanning programming, web development, AI/ML, data, mobile, and cloud/DevOps — each with
several modules and several lessons per module. Relationships must be internally consistent: every
lesson created is referenced by exactly the module it belongs to (no orphan lessons, no lesson
referenced by more than one module), and every module referenced by a course lives in that course's
`modules` array (no dangling/duplicate references). This is a one-time authoring script, run offline
against the dataset — not part of the request path, per AGENTS.md section 5.

Out of scope: video documents/transcript ingestion (section 9), the agent context document (section
10), and progress records — none of that exists yet and none of it is needed for catalog/search
sample data.

## Skills / docs read

- `AGENTS.md` section 8 — the exact fixed shape: course (title, slug, summary, coverImage, level,
  price, popular?, studentCount?, outcomes[], instructor ref, category ref, modules[]); module is an
  **embedded object**, not a document (title, summary, ordered lesson refs); lesson is a document
  (title, slug, videoUrl, poster, duration, freePreview, studentCount?, Portable Text notes,
  keyPoints[], proTip?, resources[]), with **no back-reference to its course**; instructor (name,
  slug, photo, expertise, bio); category (title, slug, description).
- `AGENTS.md` section 12 — dataset is private, read token stays server-only; this script needs its
  own **write** token, which does not exist yet in `.env.local` (only `SANITY_API_READ_TOKEN` is
  present, documented as viewer/read-only in `.env.example`).
- `sanity-migration` skill (`references/general.md` guardrails, applied even though this isn't a
  cross-CMS migration): use deterministic `_id`s and `createOrReplace` so reruns converge instead of
  duplicating; create referenced documents before the documents that reference them (categories and
  instructors, then lessons, then courses); upload real Sanity image assets rather than pointing at
  external URLs; batch mutations in a transaction.
- `sanity-best-practices` — schema already follows `defineType`/`defineField` conventions (confirmed
  by reading the schema files below), nothing to change there; this task only writes content, not
  schema.

## Code inspected

- `studio/schemaTypes/course.ts`, `module.ts`, `lesson.ts`, `instructor.ts`, `category.ts` — confirmed
  exact field names/types match AGENTS.md section 8 (already built in the prior task). `coverImage`,
  `poster`, and (for instructor) no required image — `photo` is optional on instructor, but
  `coverImage` (course) and `poster` (lesson) are both `validation: required()`, so every course and
  lesson needs a real uploaded image asset, not a placeholder URL string.
- `studio/.env` — has `SANITY_STUDIO_PROJECT_ID`/`SANITY_STUDIO_DATASET` only (project `soq9evt7`,
  dataset `production`), no token.
- `.env.local` / `.env.example` — only `SANITY_API_READ_TOKEN` exists, explicitly documented as a
  Viewer (read-only) token. There is no write token anywhere in the repo yet.
- `studio/script/` — exists, empty, untracked. This is where the seed script belongs (keeps it in the
  Studio workspace, next to schema, not shipped with the Next.js app).
- `studio/package.json` — has `sanity`, `@sanity/vision`, `@sanity/icons`, no `@sanity/client` yet
  (needed for a standalone Node script) and no script runner (`tsx`) configured.
- Sanity MCP connector is unauthenticated in this session (confirmed via tool availability) and this
  is a non-interactive session that cannot complete the OAuth flow, so seeding must go through a
  script with `@sanity/client` and an API token, not through MCP content tools.

## Decisions / assumptions

1. **Needs a write token from you.** I don't have one and can't create one myself. Please add a
   token with write access (an **Editor** token is enough; a project **Administrator** token also
   works) from `manage.sanity.io` → your project → API → Tokens, as `SANITY_API_WRITE_TOKEN` in
   `.env.local` (and add the placeholder line to `.env.example`, no real value there). I will not
   proceed with running the script until this exists — I'll check for it and stop with a clear ask if
   it's missing when I get to the execute step.
2. **Script location & runner**: `studio/script/seed.ts`, run with `npx tsx studio/script/seed.ts`
   (adding `tsx` and `@sanity/client` as devDependencies/dependencies in `studio/package.json`, plus
   a `"seed": "tsx script/seed.ts"` script). Lives in `studio/` since it's authoring tooling for the
   content workspace, not app runtime code.
3. **Deterministic IDs**: every document gets a stable `_id` derived from a slug (e.g.
   `category-web-development`, `instructor-jane-doe`, `course-modern-javascript`,
   `lesson-modern-javascript-let-const-scope`), and the script uses `createOrReplace` for all of them
   so re-running it updates in place instead of duplicating content. This also makes wiring
   references trivial (no fetch-after-create round trip): lessons are created first with known ids,
   then modules embed reference objects `{ _type: 'reference', _ref: <lesson id> }` by id, then
   courses embed both the instructor/category reference and the modules array.
4. **Placeholder images**: `coverImage` (course) and `poster` (lesson) are required image fields.
   Rather than fetching external stock-photo URLs at seed time (network dependency, licensing
   ambiguity, and AGENTS.md doesn't call for real media here), the script generates a simple solid
   color + title-text SVG per course/lesson locally and uploads each as a real Sanity image asset via
   `client.assets.upload('image', buffer, { filename, contentType: 'image/svg+xml' })`, then
   references the returned asset `_id` in the `image` field. Every course gets one distinct-colored
   cover; every lesson reuses its parent course's color for visual grouping. Instructor `photo` is
   optional in the schema, so instructors are seeded without a photo.
5. **Content scope** — 6 categories, 6 instructors, 10 courses, 3 modules per course, 3 lessons per
   module (90 lessons total), covering programming fundamentals, web development, AI/ML, data
   science, mobile, and DevOps/cloud so cross-course search has real topical overlap (e.g. "React"
   and "state management" show up in more than one course; "Python" spans data science and ML).
   Courses:
   1. JavaScript Fundamentals (Programming Fundamentals)
   2. TypeScript for Application Developers (Programming Fundamentals)
   3. React & Next.js Masterclass (Web Development)
   4. Node.js Backend Engineering (Web Development)
   5. SQL & Database Design (Data Science)
   6. Python for Data Science (Data Science)
   7. Machine Learning Foundations (AI & Machine Learning)
   8. Prompt Engineering & LLM Applications (AI & Machine Learning)
   9. Docker & Kubernetes for Developers (DevOps & Cloud)
   10. React Native Mobile App Development (Mobile Development)

   Each course's 3 modules genuinely build on each other (e.g. JS Fundamentals: Syntax & Types →
   Functions & Scope → Async & the Event Loop) and each module's 3 lessons stay on that module's
   topic, per AGENTS.md section 7 ("content is coherent top to bottom... if lessons are unrelated to
   their module, search returns junk"). Lesson `notes` get 2-3 real Portable Text paragraphs (not
   filler lorem ipsum) written for that specific lesson topic; `keyPoints` are 3 short bullets on
   topic; one `resources` entry per lesson (an on-topic `link`-type resource with a plausible title,
   no fabricated real-world URLs — resource URLs point at the course's own site path, e.g.
   `https://vertex.dev/resources/<slug>`, since AGENTS.md forbids inventing real external claims but
   resources are just a UI list, not verified external links).
6. **Cross-references for search variety**: instructors are reused across 1-2 related courses each
   (e.g. the same instructor teaches both "React & Next.js" and "React Native") rather than a strict
   1:1 course:instructor mapping, since AGENTS.md doesn't require 1:1 and real catalogs don't work
   that way; categories are reused across their matching courses (2 courses per category on average).
7. **Idempotency / reruns**: because everything uses deterministic ids + `createOrReplace`, running
   the script twice converges to the same 6+6+90+10 = 112 documents, never duplicates. The script logs
   a summary count at the end (categories/instructors/lessons/courses created or updated).
8. **No stored counts to keep in sync**: module/lesson numbering is derived from array order in the
   frontend (already the design per AGENTS.md), so the script doesn't need to write any numbering
   field — consistency is guaranteed structurally by only ever putting a lesson's reference in the
   one module object that owns it, and never creating a lesson that isn't referenced anywhere.

## Files expected to touch

Create:
- `studio/script/seed.ts` — the seed script (data + upload + mutate logic).

Modify:
- `studio/package.json` — add `@sanity/client` (dependency) and `tsx` (devDependency), add a
  `"seed"` script.
- `.env.example` — add a placeholder `SANITY_API_WRITE_TOKEN` line with a comment that it needs
  Editor access and is used only by the offline seed script, never by the running app.

No app/web files change. No schema files change.

## Requirements

- Script reads `SANITY_STUDIO_PROJECT_ID`/`SANITY_STUDIO_DATASET` from `studio/.env` (already there)
  and `SANITY_API_WRITE_TOKEN` from the repo-root `.env.local` (loaded explicitly since the script
  runs from `studio/`) — if the token is missing, the script exits with a clear error before making
  any network calls, rather than failing mid-run.
- All writes go through `createOrReplace` with deterministic ids; referenced documents (categories,
  instructors, lessons) are created before the documents that reference them (courses), consistent
  with the sanity-migration skill's ordering guardrail.
- Every module's `lessons` array references only lessons created in this same run for that module;
  every course's `modules` array contains only modules built from that course's own lessons. No
  lesson id is reused across two different modules.
- Every required field in the schema (course: title/slug/summary/coverImage/level/price/instructor/
  category/modules; lesson: title/slug/videoUrl/poster/duration; module: title/lessons) is populated
  — nothing left blank to dodge validation.
- `videoUrl` values are real, working YouTube URLs (using a small set of genuinely public,
  well-known educational YouTube video ids so the lesson page will have something playable later) —
  not fabricated ids. [I will use a short reused pool of real YouTube watch URLs across lessons; they
  don't need to match the lesson topic exactly since real transcript ingestion is a separate future
  task, but I'll pick generically relevant public tech-talk/tutorial videos.]
- Mutations are batched (one `transaction()` per logical group — e.g. all lessons for a course in one
  transaction, then that course) to keep round trips reasonable, not 112 sequential single writes.

## Security considerations

- `SANITY_API_WRITE_TOKEN` is never committed; only a placeholder is added to `.env.example`. It's
  read only inside `studio/script/seed.ts`, a standalone Node script — never imported by the Next.js
  app or any client code.
- The script only writes to the dataset named in `studio/.env` (`production`) — I'll confirm with you
  before running if that's actually intended as the working dataset (vs. a separate seed/dev
  dataset), since AGENTS.md doesn't mention a staging dataset and there's only one configured.
- No external network fetches for images (avoids depending on/trusting third-party URLs at seed
  time); placeholder images are generated locally as SVGs and uploaded directly to Sanity's asset
  pipeline.

## Acceptance criteria

- [ ] `SANITY_API_WRITE_TOKEN` exists in `.env.local` before the script runs (blocking prerequisite).
- [ ] Running `npm run seed` in `studio/` creates exactly 6 categories, 6 instructors, 90 lessons, and
      10 courses (112 documents total) in the `production` dataset, all published (not drafts).
- [ ] Every course's `modules` array has 3 module objects, each with a `lessons` array of 3 lesson
      references, and every referenced lesson document exists and resolves in Studio (no broken
      refs).
- [ ] No lesson is referenced by more than one module; no orphan lesson exists that isn't referenced
      by any module.
- [ ] Every course and lesson has a real, resolvable image asset in `coverImage`/`poster`
      (uploaded, not a dangling reference).
- [ ] Re-running `npm run seed` produces the same 112 documents (no duplicates), verified by
      `_id`-based `count()` in a GROQ check before/after.
- [ ] Content is topically coherent: a manual spot check of 2-3 courses shows each module's 3 lessons
      genuinely relate to that module's stated topic (per AGENTS.md section 7).
- [ ] `studio/package.json` still installs and `npm run build` (Studio build) still succeeds with
      the new deps added.

## Checks to run

- `cd studio && npm install` (after adding `@sanity/client`/`tsx`).
- `npm run seed` (the actual seed run) — report real output (document counts / any errors).
- A GROQ sanity check via the Sanity CLI or a short one-off script: `count(*[_type in ["course",
  "lesson","instructor","category"]])` should equal 112, and
  `*[_type=="lesson" && count(*[_type=="course" && references(^._id)]) == 0]` should be empty (no
  orphaned lessons with zero referencing courses) — actually simplest as
  `*[_type=="course"]{ "brokenLessonRefs": modules[].lessons[]->{ _id } }` to eyeball resolution.
- `npm run build` in `studio/` (confirms adding deps didn't break the Studio build — required before
  the Context MCP will serve the dataset later, per AGENTS.md section 12).

## Manual test steps

1. Add `SANITY_API_WRITE_TOKEN` (Editor-scope) to `.env.local`.
2. `cd studio && npm install`.
3. `npm run seed` — watch the console summary (counts created/updated).
4. `npm run dev` in `studio/`, open Studio, confirm: 6 Categories, 6 Instructors, 10 Courses, 90
   Lessons appear in the document lists.
5. Open 2 courses in Studio: confirm each shows 3 modules, each module expands to show 3 lesson
   titles in order, and clicking through a lesson reference opens the real lesson document with
   notes/key points/resources filled in and a poster image visible.
6. Open one lesson directly from the Lesson list (not via a course) and confirm it still renders
   correctly (proves it's a normal document, not an orphaned fragment).
7. Re-run `npm run seed` a second time; confirm document counts in Studio are unchanged (idempotent).
8. `npm run build` in `studio/` — confirm it still succeeds.
