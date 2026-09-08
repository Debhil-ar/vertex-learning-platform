# Implement All Courses Catalog Page

## Goal

Build `/courses`, the catalog page every "Courses" nav link and "View all courses" / "Explore
Courses" link on the home page already points to. No design reference exists for this page
(`design/` only has home, course detail, lesson, search, design-system), so per the user's
instruction this is built simple and consistent: reuse existing components and tokens exactly,
add nothing new visually.

## Code inspected

- `design/` — confirmed no catalog-page mockup exists.
- `app/design-system/page.tsx` — shows the intended reuse: `CourseCard` in a responsive grid,
  `Select` for a sort/filter control, `Breadcrumbs`, `Pagination` — all already built for exactly
  this kind of listing page.
- `sanity/lib/course.ts` / `queries/course.ts` — `getCourses()` returns every course with
  `level`, `category->`, `moduleCount`, etc. Only 10 courses are seeded today.
- `sanity/lib/category.ts` / `queries/category.ts` — `getCategories()` returns all categories,
  already used nowhere in `app/` yet.
- `components/ui/nav.tsx` — `current="courses"` prop already exists and highlights this exact
  link; unused until now.
- `app/page.tsx` (home) — establishes the pattern for this task: async Server Component,
  `getCourses()`, derive duration/moduleCount, `CourseCard` wrapped in a `Link` to
  `/courses/[slug]`.

## Decisions (no design to defer to, so keeping this minimal per your instruction)

1. **Plain server-rendered page, no client JS.** Category and level filters are `<select>`s inside
   a native GET `<form>` that navigates to `/courses?category=...&level=...`, read via
   `searchParams` — same "read only page, no client state" shape as the rest of the site, avoids
   adding a client component for something a form handles natively.
2. **Filtering happens in the page**, not in GROQ: `getCourses()` already fetches everything
   needed, and 10 seeded courses is too small a dataset to justify a parameterized query — filter/
   match in plain JS server-side.
3. **No pagination.** `Pagination` stays unused for now — 10 courses fit on one page, and adding
   paging logic that never triggers would be the opposite of "simple." Revisit once catalog size
   warrants it.
4. **No sort control.** AGENTS.md ties the "Most Relevant" sort specifically to the search results
   page (section 11); a plain catalog browse doesn't need it. Cards render in the existing
   `getCourses()` order (title asc).
5. **Header**: page title "All Courses" (matches `Nav`'s label and the breadcrumb text already
   used on the course detail page) plus a result count ("10 courses"), category filter, level
   filter, "Clear filters" link when a filter is active, and an empty state ("No courses match
   these filters" + a clear-filters link) if the combination matches nothing.
6. **Card grid**: identical `CourseCard` usage/grid classes already used on the home page
   (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, same avatar-letter/color derivation, same duration
   computation), each wrapped in a `Link` to `/courses/[slug]`.

## Files to touch

- New: `app/courses/page.tsx` — the catalog page (async Server Component).
- Possibly a tiny shared helper if the avatar-letter/color/duration derivation used on both the
  home page and this page is worth deduplicating (`lib/course-preview.ts` or similar) rather than
  copy-pasting it — will decide while implementing, low risk either way.

## Checks

`npx tsc --noEmit`, `npm run lint`, `npm run build`, manual check with `npm run dev`:
`/courses` lists all 10 seeded courses; filtering by category and by level narrows the grid
correctly via URL params; clearing filters restores the full list; nav's "Courses" link is
highlighted on this page.

Proceed?
