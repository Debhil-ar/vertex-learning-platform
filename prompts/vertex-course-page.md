# Implement Vertex Course Detail Page

## Goal

Build `app/courses/[slug]/page.tsx` to match `design/vertex-course.png` exactly: breadcrumb, cover
tile, title/badge/meta with Continue Learning + Bookmark actions, a "What you'll learn" outcomes
grid, a "Course Content" module/lesson accordion list with a "Show all N modules" toggle, and a
sticky bottom progress bar. Wired to real Sanity content via the existing `getCourseBySlug` server
fetch and seeded catalog data — no mock data.

## Skills / docs read

- `AGENTS.md` (root) — section 3 (reproduce UI exactly, adapt responsively; no mobile reference
  given so I adapt sensibly), section 5 (pages are read-only, data access is the server-only Sanity
  client/fetch helper — this page is a Server Component that calls `getCourseBySlug`), section 7
  (module/lesson numbers like "Module 5" or "Lesson 5.1" are derived from array order, never
  stored; progress tracking and bookmarking are described as future features with their own server
  routes, not built here), section 8 (course/module/lesson field shapes — module has no stored
  duration, lesson duration is a display string).
- `sanity-best-practices` — confirmed the existing GROQ query/fetch/TypeGen pattern
  (`defineQuery` + `sanityFetch` + generated types in `sanity/types.ts`) is the one to reuse, not a
  new ad hoc query.

## Code inspected

- `design/vertex-course.png` (target).
- `sanity/queries/course.ts` — `COURSE_BY_SLUG_QUERY` already returns everything the page needs:
  title/slug/summary/coverImage/level/price/popular/studentCount, `outcomes[]`,
  `instructor->`, `category->`, and `modules[]{ title, summary, lessons[]->{ title, slug,
  duration, freePreview, poster } }`. No query changes needed.
- `sanity/lib/course.ts` — `getCourseBySlug(slug)` server helper, already used the same way
  `getCourses`/`getCourseSlugs` are meant to be consumed from a page.
- `sanity/types.ts` — `COURSE_BY_SLUG_QUERY_RESULT` shape, confirms `level`, `outcomes[].icon`
  (free-text keyword), lesson `duration` (`"mm:ss"` display string, not seconds).
- `studio/schemaTypes/course.ts`, `module.ts`, `lesson.ts` — confirms modules are embedded objects
  (no course-level or module-level stored duration/lesson-count; both are derived), lessons carry
  `duration` as a formatted string, no per-lesson "completed" state exists in the schema yet (no
  progress document/type exists anywhere in `studio/schemaTypes`).
- `studio/script/seed.ts` — confirms seeded courses (JavaScript Fundamentals, TypeScript for
  Application Developers, React & Next.js Masterclass, Node.js Backend Engineering, SQL & Database
  Design, Python for Data Science, Machine Learning Foundations, ...), each with 3 modules and a
  handful of lessons with `mm:ss` durations, and the exact vocabulary of `outcomes[].icon` keywords
  used across all seeded courses (`code`, `database`, `clock`, `function`, `shield`, `puzzle`,
  `settings`, `layout`, `route`, `server`, `lock`, `layers`, `table`, `search`, `gauge`, `chart`,
  `brain`, `trending-up`, `check-circle`, `activity`, `box`, `grid`, `link`, `message-square`,
  `navigation`, `smartphone`, `tool`, `upload`). There is no "Next.js for Production" / 12-module
  course seeded — the design's course name is a mock reference only; the page renders whatever
  real course the slug resolves to (I'll test against "react-and-next-js-masterclass" or whichever
  slug the seed actually produced).
- `components/ui/badge.tsx`, `button.tsx`, `breadcrumbs.tsx`, `progress-bar.tsx`,
  `status-indicator.tsx`, `course-card.tsx`, `lesson-card.tsx` — existing primitives. `Badge`
  already has a `popular` variant, `Breadcrumbs` takes a plain string list, `ProgressBar` already
  renders the exact bottom bar shape with `showLabel`. None of these are a drop-in for the outcome
  tiles or the module/lesson accordion rows, so those are new, page-local components.
- `components/ui/nav.tsx` — shared header, already supports a `current` prop; course page isn't
  "courses" or "my-learning" so no nav item is highlighted (matches the reference, where neither
  link is orange on this page).
- `app/page.tsx`, `app/layout.tsx`, `app/globals.css` — confirms container width (`max-w-[1440px]`
  , `px-6`), type scale tokens (`display-1/2`, `heading-1/2/3`, `body-lg/body/small`), and that
  `getCourseBySlug` / Server Components are not yet used anywhere in `app/` (this is the first page
  wired to Sanity — home page still uses inline mock data, out of scope to change here).
- `sanity/lib/image.ts` — `urlFor()` builder for the cover image and poster thumbnails.
- `proxy.ts` (Clerk middleware) — no route protection configured; course pages stay public browsing
  per section 5/7, matching the nav being visible without sign-in.

## Decisions / assumptions

1. **Route is `app/courses/[slug]/page.tsx`**, an async Server Component. Fetches via
   `getCourseBySlug(slug)`; calls Next's `notFound()` on a miss. No client-side fetching.
2. **"All Courses" breadcrumb links to `/courses`.** That catalog route doesn't exist yet (out of
   scope), so the link will 404 until it's built — consistent with how `Nav`'s own "Courses" link
   already points there today.
3. **Derived numbers, nothing stored:** module number = 1-based index in `modules[]`; lesson label
   "Lesson {moduleNumber}.{lessonNumber}" = 1-based index within that module's `lessons[]`; module
   duration = sum of its lessons' `mm:ss` durations, formatted back to `Xh Ym` or `Xm`; course total
   duration = sum of all lessons across all modules, same formatting; "12 modules • 18h 24m" header
   line = `modules.length` + that total. Student count and price/level come straight from the
   course document.
4. **Outcome icons**: a small local `Record<string, LucideIcon>` map in the new outcomes component,
   covering the exact keyword vocabulary the seed data uses (listed above), each mapped to the
   closest existing `lucide-react` icon (e.g. `layers` → `Layers`, `database` → `Database`, `gauge`
   → `Gauge`, `clock` → `Clock`), with a generic fallback icon (`Sparkles`) for any keyword outside
   that set, since `icon` is free-text in the schema and authors can type anything.
5. **Accordion module list**: each module row is collapsible (expand/collapse via a small client
   component — `<details>`-based or `useState`, no external library), closed by default, showing
   its lesson list (index, title, duration, a lock/play icon per `freePreview`) when open. "Show
   all 12 modules" in the reference is a **show-more-modules** toggle (the row list itself, not
   each accordion), not pagination — I'm reading it the same way: collapse to the first 6 modules
   with a "Show all N modules" button that reveals the rest, since the reference shows exactly 6
   module rows collapsed plus that control. This needs one client component
   (`components/ui/course-content.tsx` or similar); the rest of the page stays server-rendered.
6. **Progress bar, "Continue Learning", and "Bookmark" are presentational only.** No progress
   schema/document and no server write route exist anywhere in the codebase yet (section 8 defines
   progress as future per-learner state keyed by Clerk user id, written only through a server
   route — building that is a separate task). So: the bottom sticky progress bar renders a fixed
   placeholder percentage (e.g. 0%, or omitted "35%" from the mock since there's no real data to
   show), "Continue Learning" links to the first lesson of the course (best real destination
   available), and "Bookmark" is a non-functional button (no click handler / local UI state only).
   Flagging this clearly in the report rather than inventing a fake progress backend.
7. **Free preview lessons** get a small visual affordance (unlocked/play icon) per `freePreview`;
   non-preview lessons show a lock icon — presentational only, no gating (section 7: "free preview
   is a label, not access control").
8. **Images**: cover tile uses `urlFor(coverImage).width(...).url()` via existing `next/image` +
   `sanity/lib/image.ts` pattern (need to confirm `next.config.ts` allows the Sanity CDN image
   domain — will check/add `images.remotePatterns` if missing).
9. **Mobile**: two-column header (cover image + title block) stacks to one column; outcome grid
   goes from 2 columns to 1; module content rows stay full width; the sticky bottom progress bar
   remains fixed but stacks label/bar/button if needed at very narrow widths.

## Files expected to touch

- New: `app/courses/[slug]/page.tsx` — the page itself (Server Component).
- New: `components/ui/course-outcomes.tsx` (or similar) — the "What you'll learn" tile grid +
  icon map.
- New: `components/ui/course-content.tsx` — client component for the module accordion + show-more
  toggle.
- `next.config.ts` — add Sanity CDN `images.remotePatterns` if not already present.
- Possibly `components/ui/badge.tsx` / `progress-bar.tsx` — only if a small prop is missing for
  the exact page usage (e.g. a "POPULAR" badge without lowercase transform); otherwise reused as
  is.

## Requirements

- Pixel-faithful to `design/vertex-course.png` on desktop: colors, spacing, type, icons, badge/
  button styles, accordion row layout, sticky progress bar.
- All content (title, summary, level, price, student count, outcomes, modules, lessons, durations,
  instructor) comes from the real Sanity document via `getCourseBySlug`, not hardcoded strings.
- `generateStaticParams` via `getCourseSlugs()` so course pages are statically known at build time
  (matches the existing `COURSE_SLUGS_QUERY` helper's stated purpose).
- Sensible `<title>`/meta via `generateMetadata` using the course title/summary.
- Responsive down to mobile per section 3.
- No client-side data fetching, no exposed tokens; only the module accordion is a client component,
  and it receives already-fetched data as props.

## Security considerations

- Server-only Sanity client/token stays server-side (already enforced by `sanity/lib/live.ts` /
  `'server-only'` import in `sanity/lib/course.ts` — no change needed).
- No user input on this page (no forms), so no injection surface beyond the dynamic `[slug]`
  route param, which is passed straight into the existing parameterized GROQ query (`$slug`), not
  string-interpolated.

## Acceptance criteria

- Visiting `/courses/<a-real-seeded-slug>` renders the page with that course's real title, cover
  image, level, price, student count, outcomes, and full module/lesson list, matching the design's
  layout.
- Module numbers, lesson labels, module durations, and total course duration are computed from the
  real data, not hardcoded.
- Expanding a module reveals its real lessons with correct per-lesson duration and free-preview/
  lock state.
- "Show all N modules" reveals the remaining modules when the course has more than the initial
  visible count.
- Visiting an unknown slug renders Next's not-found page.
- Layout adapts correctly at mobile width (stacked header, single-column outcomes grid).

## Checks to run

- In root (web workspace): `npm run lint`, `npx tsc --noEmit` (or the project's type-check
  script), `npm run build` (route + server code added), and manual verification with `npm run dev`.

## Manual test steps

1. `npm run dev` (root) and, if the dataset needs seeding, confirm `studio/script/seed.ts` has
   already been run (per the `feat/seed-sample-content` branch this repo is on).
2. Find a real seeded course slug (Studio at `studio/` → Course documents, or query
   `getCourseSlugs()`), e.g. visit `/courses/react-and-next-js-masterclass` (exact slug TBC from
   seed output).
3. Confirm the header, breadcrumb, cover tile, title, POPULAR badge (if `popular: true` on that
   course), level/duration/modules/students meta row, and Continue Learning/Bookmark buttons match
   the reference layout.
4. Confirm "What you'll learn" shows that course's real `outcomes[]` (icon, title, description) in
   a 2-column grid.
5. Confirm "Course Content" lists real modules in order with derived numbers and durations; click a
   module row to expand/collapse its lessons; click "Show all N modules" if the course has more
   than the initially visible set.
6. Resize the browser to a mobile width and confirm the header stacks and the outcomes grid drops
   to one column, with no horizontal scroll.
7. Visit `/courses/does-not-exist` and confirm the not-found page renders.
