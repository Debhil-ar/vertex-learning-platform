# Implement Vertex Home Page

## Goal

Build the `/` route to match `design/vertex-home.png` exactly: header nav, hero (badge, headline,
subhead, CTA, search bar), an "All Courses" preview grid of 3 cards, and a decorative closing
band (divider line, "new content" note, gradient bar-chart art). This is a presentational page —
no Sanity fetch, no auth, no search wiring. Course data is mock/static, matching how the design
system demo already stands in for real content until Sanity exists.

## Skills / docs read

- `AGENTS.md` (root) — section 3 (reproduce UI exactly, adapt responsively), section 5 (pages are
  read-only, no page fetches data itself yet since no Sanity schema exists), section 7 (search is a
  full results page, not a widget — so the home search bar only needs to *look* right and route to
  `/search?q=...` on submit, no live query here).
- No Sanity/Clerk/PostHog skill applies — no schema, auth, or analytics in this task.

## Code inspected

- `design/vertex-home.png` (target) and `design/vertex-search.png` (to confirm the header nav is
  shared/identical across pages — it is: same logo, links, bell, avatar, just an active-link color
  change on Courses).
- `components/ui/nav.tsx` — current shared nav has logo + Courses/My Learning links only, no bell,
  no avatar, no active-link state. The reference shows a notification bell icon and a circular user
  photo on every page, and an active (primary-colored) nav link on non-home pages.
- `components/ui/button.tsx`, `input.tsx`, `course-card.tsx`, `badge.tsx` — existing primitives;
  `Button` variants and `CourseCard` (letter-avatar tile, level/duration/module meta row) map
  directly to the hero CTA and the "All Courses" cards.
- `app/page.tsx`, `app/layout.tsx`, `app/globals.css` — current home is unmodified
  create-next-app boilerplate; fonts (Inter + Playfair Display) and tokens are already wired from
  the design-system task.
- `public/` — only create-next-app placeholder SVGs (next/vercel/globe/file/window). No user photo,
  no Next.js/Docker/TypeScript logo assets, no decorative art exist yet.

## Decisions / assumptions

1. **Shared `Nav` gets extended, not forked.** Since the search screenshot shows the identical
   header (logo, links, bell, avatar) with only an active-link color difference, I'm adding a bell
   icon button and an avatar slot to `components/ui/nav.tsx` plus a `current?: "courses" |
   "my-learning"` prop for the orange active state, rather than building a one-off header for this
   page. Every future page reuses this.
2. **No real user photo or brand logos exist yet (Clerk/CMS not wired).** I'll add two small local
   placeholder assets under `public/`:
   - `public/avatar-placeholder.svg` — a simple neutral circular silhouette avatar for the nav,
     swapped for the real Clerk user image later.
   - Course tiles reuse the existing `CourseCard` letter-avatar pattern (already black-square +
     letter, matching the "N" tile exactly). For Docker/TypeScript tiles I'm extending `CourseCard`
     with an optional `avatarBg` (Tailwind class) prop instead of hardcoding `bg-neutral-900`, so
     the TypeScript tile can use its brand blue and Docker its brand blue — still a letter/glyph
     tile, not a pixel-accurate logo, since no logo assets exist. Flagging this as the one visible
     deviation from the reference (illustrated Docker whale vs. a plain glyph tile).
3. **Course content is inline mock data** in `app/page.tsx` (3 courses: Next.js for Production,
   Docker Essentials, TypeScript Deep Dive, with the exact title/description/level/duration/module
   count text from the image). No fetching layer, no types shared with a future Sanity schema —
   this route gets rewired once the course schema and GROQ queries exist.
4. **Search bar is presentational only here.** It's a controlled `<form>` that pushes to
   `/search?q=<value>` on submit (route doesn't exist yet, so this will 404 until the search page
   ships — acceptable for this task since AGENTS.md scopes search as separate work). No `⌘K`
   keyboard-shortcut listener is wired (the visible `⌘K` is just the existing `SearchInput` hint
   affordance) — adding a global keydown handler is out of scope for a static home page.
5. **"Explore Courses" button links to `/courses`** (per section 5's catalog page), and "View all
   courses" likewise — both routes 404 for now since the catalog page isn't built yet; only this
   page is in scope.
6. **Decorative bottom band** (divider rule, star + "New courses and lessons added every week",
   and the fading orange bar-chart art) is built as plain CSS: a flex row of `div`s with varying
   heights and a `linear-gradient` (primary-400 → transparent) background, `overflow-hidden` on the
   section so it "bleeds" off the page edge like the reference. Pure decoration, no chart library.
7. **Mobile**: hero text/CTA/search stay centered and stack full-width; the 3-card grid collapses
   to 1 column below `sm`; nav's link labels stay visible (no hamburger in the reference at any
   breakpoint, and none is specified for mobile, so links wrap/shrink rather than collapsing into a
   menu).

## Files expected to touch

- `app/page.tsx` — full rewrite (currently create-next-app boilerplate).
- `components/ui/nav.tsx` — add bell icon, avatar slot, `current` active-link prop.
- New: `components/ui/hero.tsx` or keep hero markup inline in `app/page.tsx` (leaning inline, single
  consumer, per "don't add abstraction beyond what's needed").
- `components/ui/course-card.tsx` — add optional `avatarBg` prop (default `bg-neutral-900`, no
  behavior change for existing usages).
- New: `public/avatar-placeholder.svg`.

## Requirements

- Match the reference: badge pill copy/style, headline (Playfair Display, two-line centered),
  subhead copy, primary button with trailing arrow, search bar with `⌘K` hint, "All Courses"
  section header with "View all courses" link, 3 course cards with exact copy/meta, closing divider
  band with star icon and copy, gradient bar art.
- Responsive down to mobile per section 3 (no mobile reference given).
- No data fetching, no auth, no analytics, no MCP/LLM calls — purely presentational, reusing
  existing `components/ui/*` primitives wherever they already fit.

## Security considerations

None — static/presentational page, no secrets, no external network calls, no user input persisted
(the search form only navigates, it doesn't submit anywhere).

## Acceptance criteria

- `/` visually matches `design/vertex-home.png` at desktop width (headline, badge, CTA, search bar,
  3 course cards with exact text, divider band, bar art).
- Reflows sensibly at mobile width (375px): no horizontal scroll, cards stack, hero stays centered.
- Nav shows bell + avatar placeholder on every page that renders it (verify on `/` and
  `/design-system`).
- Typing in the search bar and pressing Enter navigates to `/search?q=<encoded value>`.
- "Explore Courses" and "View all courses" link to `/courses`.
- Type check, lint, and production build all pass.

## Checks to run

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `npm run dev` and visually diff `/` against `design/vertex-home.png`

## Manual test steps

1. `npm run dev`, open `http://localhost:3000/`.
2. Compare hero, course grid, and bottom band against `design/vertex-home.png` side by side at full
   desktop width.
3. Resize to 375px wide; confirm no horizontal scroll, cards stack to 1 column, hero stays
   centered and legible.
4. Type a query into the search bar, press Enter, confirm the URL becomes
   `/search?q=<your query>` (page itself 404s — expected, out of scope).
5. Click "Explore Courses" and "View all courses"; confirm both navigate to `/courses` (404s —
   expected, out of scope).
6. Open `/design-system` and confirm the nav there now also shows the bell icon and avatar
   placeholder with no visual regression to the rest of that page.
