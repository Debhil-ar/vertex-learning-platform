# Wire Home Page "All Courses" Preview to Sanity

## Goal

Replace the 3 hardcoded mock courses in `app/page.tsx`'s "All Courses" preview grid with real
seeded Sanity courses, fetched server-side, keeping the exact existing visual layout/`CourseCard`
styling. No other part of the home page (hero, search bar, decorative band) changes.

## Code inspected

- `app/page.tsx` — currently a client component (`"use client"`) because of the search form's
  `useState`/`useRouter`. The mock `courses` array feeds `CourseCard` with `title`, `description`,
  `level`, `duration`, `moduleCount`, `avatarLetter`, `avatarBg` — none of the last two exist in
  the Sanity schema.
- `sanity/queries/course.ts` — `COURSES_QUERY` already returns `title`, `slug`, `summary`, `level`,
  `popular`, `studentCount`, `moduleCount`, but no duration (course has no stored duration field;
  it's derived from summing lesson durations, same as the course detail page). It doesn't currently
  fetch lesson durations at all.
- `components/ui/course-card.tsx` — unchanged; still needs `avatarLetter`/`avatarBg` strings, which
  aren't Sanity fields.
- `app/courses/[slug]/page.tsx` (just built) — establishes the pattern for this: server-fetch via
  `sanity/lib/course.ts`, sum lesson `duration` strings with `parseDurationToSeconds`/
  `formatSecondsAsDuration` from `lib/utils.ts`.

## Decisions

1. **Split the page.** `app/page.tsx` becomes an `async` Server Component that calls
   `getCourses()` and renders the grid directly. The hero's search form (the only interactive
   part) moves into a new small client component, e.g. `components/ui/home-search.tsx`, so the
   page itself needs no `"use client"`.
2. **Extend `COURSES_QUERY`** to also fetch `modules[].lessons[]->{ duration }` (duration only, no
   other lesson fields) so total course duration can be computed the same way the course detail
   page does it. Existing callers of `getCourses()`/`COURSES_QUERY` (none yet outside this) are
   unaffected.
3. **Show the first 3 courses** from `getCourses()` (already ordered `title asc`) — no featured/
   popular filtering, since `CourseCard` doesn't surface the popular badge anyway and the section
   is a plain catalog preview, not a "featured" rail.
4. **`avatarLetter`/`avatarBg` are derived, not stored**: first letter of the course title,
   uppercased, and a background color picked from a small fixed Tailwind-class palette by cycling
   on the course's position in the result list (stable for a given query result, purely
   decorative — matches how the mock data used arbitrary per-course colors).
5. Cover image is available on `COURSES_QUERY` but `CourseCard` has no image slot today (it's a
   letter-avatar tile design) — not adding one, since that would go beyond what the reference
   home design shows here (already implemented and approved in the earlier home-page task).

## Files to touch

- `app/page.tsx` — convert to async Server Component, fetch `getCourses()`, render first 3.
- New: `components/ui/home-search.tsx` — client component wrapping just the search form
  (`useState` + `useRouter`, pushes to `/search?q=...`), extracted out of `page.tsx`.
- `sanity/queries/course.ts` — add lesson duration projection to `COURSES_QUERY`.
- `sanity/types.ts` — regenerate after the query change.

## Checks

- `npx tsc --noEmit`, `npm run lint`, `npm run build`, manual check with `npm run dev` that `/`
  shows 3 real seeded courses with correct level/duration/module count.

Proceed?
