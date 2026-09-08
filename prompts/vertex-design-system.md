# Implement Vertex Design System

## Goal

Translate `design/vertex-designsystem.png` into the project's design tokens (Tailwind v4 `@theme`) and a
set of reusable, presentational UI primitives (buttons, inputs, badges, status indicators, progress bar,
cards, nav/breadcrumbs/pagination) that later pages (catalog, course, lesson, instructor, search) will be
built from. This is foundation work only — no pages, routes, Sanity schema, auth, or data fetching.

## Skills / docs read

- `AGENTS.md` (root) — overall app scope, workspace boundaries, "you do not design UI, reproduce exactly."
- `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md` — confirms `next/font/google` usage
  for self-hosted Google Fonts (Playfair Display, Inter), replacing the current Geist fonts.
- No Sanity/Clerk/PostHog skill applies — this task touches no schema, auth, or data.

## Code inspected

- `app/layout.tsx` — currently wires Geist Sans/Mono via `next/font/google`; sets `--font-geist-*` vars.
- `app/globals.css` — Tailwind v4 entry (`@import "tailwindcss"`), a `@theme inline` block mapping two
  color vars and two font vars, plus a `prefers-color-scheme: dark` override. This is create-next-app
  boilerplate, not yet touched by the project.
- `app/page.tsx` — default create-next-app boilerplate homepage. Not part of this task; left alone except
  that it stays buildable (no broken imports).
- `package.json` — Next 16.3.4, React 19.2.8, Tailwind v4 (`@tailwindcss/postcss`), no component/icon/
  utility libraries installed yet, no `components/` or `lib/` directory exists.
- `tsconfig.json` — path alias `@/*` → `./*`, so `@/components/...` and `@/lib/...` resolve from root.
- Confirmed no `web/`/`studio/` workspace split exists yet (still a single root Next.js app from
  create-next-app). Design system work does not depend on that split.

## Decisions / assumptions

1. **Scope of this task**: build tokens + primitive components + a `/design-system` demo route that
   renders every section of the reference image, so the system can be visually checked against the PNG
   before any real page consumes it. No catalog/course/lesson pages are built here.
2. **Workspace structure**: keep working in the current root app for now. The `web/` + Studio workspace
   split (AGENTS.md section 5) is a separate, larger decision to make once Sanity is introduced — it
   should not block or be bundled into design-token work. Flagging this as an assumption rather than
   silently deciding it.
3. **Fonts**: replace Geist Sans/Mono with `next/font/google` `Playfair_Display` (weight 700, for Display
   1/2) and `Inter` (variable, for everything else), per section 02 of the reference. Self-hosted via
   `next/font`, no external font requests.
4. **Dark mode**: the reference has one light theme only, no dark variant shown. Per "there is no mobile
   reference, but there is a desktop reference and it's the source of truth" logic, I'm not inventing a
   dark theme — removing the create-next-app `prefers-color-scheme: dark` override rather than guessing
   dark values for brand colors.
5. **Icons**: the reference specifies "24×24 grid, 2px stroke, rounded line caps, outline + filled
   styles" — this matches `lucide-react` directly (outline by default, `fill="currentColor"` for filled
   use). Proposing to add `lucide-react` as a dependency rather than hand-drawing ~10 SVG icons. Flagging
   this as a new dependency for approval.
6. **Utility libraries**: adding `clsx` + `tailwind-merge` behind a small `cn()` helper in
   `lib/utils.ts`, the standard pattern for conditionally composing Tailwind classes across variants
   (button/badge/status variants need this). This is infrastructure, not a feature.
7. **Component location**: `components/ui/*.tsx` at the repo root (alongside `app/`), consistent with the
   `@/*` path alias already in `tsconfig.json`. Each primitive is a server-renderable, presentational
   component (no data fetching, no client state beyond what's needed for e.g. a select's open state).
8. **Course/resource "icon" card art**: the Course Card in the reference shows a plain black rounded
   square with a letter avatar ("N") as a placeholder for missing cover art — reproducing that as the
   fallback state of the `CourseCard`, not a real image (no CMS content exists yet).
9. Illegible/likely-typo value in the image, resolved by pattern-matching neighboring swatches:
   Neutral 700 is printed as `#33415S` — reading as `#334155` (consistent with a Tailwind-slate-style
   ramp and the only hex that isn't a valid hex code as printed).

## Tokens to implement (Tailwind v4 `@theme` in `app/globals.css`)

**Colors**
- Primary: `500 #F97316` `400 #FB923C` `300 #FDBA74` `200 #FED7AA` `100 #FFEEE5`
- Neutral: `900 #0F172A` `700 #334155` `500 #64748B` `300 #CBD5E1` `200 #E2E8F0` `100 #F1F5F9`
  `50 #FAFAFC` `White #FFFFFF`

**Typography** — `Playfair Display` for Display 1/2, `Inter` for everything else:
| Token | Size/Line-height | Weight |
|---|---|---|
| display-1 | 48/56 | Bold |
| display-2 | 36/44 | Bold |
| heading-1 | 28/36 | Semibold |
| heading-2 | 22/30 | Semibold |
| heading-3 | 18/26 | Medium |
| body-lg | 16/24 | Regular |
| body | 14/20 | Regular |
| small | 12/16 | Regular |

**Spacing** — base unit 4px: 4, 8, 12, 16, 24, 32, 40, 48, 64 (align to Tailwind's existing scale, don't
invent a parallel one — these already match Tailwind's default spacing steps 1,2,3,4,6,8,10,12,16).

**Radius**: `xs 4px` `sm 8px` `md 12px` `lg 16px` `xl 24px` `full` (circle).

**Shadows**:
- sm: `0 1px 2px 0 rgba(15,23,42,0.05)`
- md: `0 4px 12px -2px rgba(15,23,42,0.08)`
- lg: `0 12px 24px -4px rgba(15,23,42,0.10)`
- xl: `0 20px 40px -8px rgba(15,23,42,0.12)`

## Components to build

- `components/ui/button.tsx` — `Button` with variants `primary | secondary | tertiary | text`, states
  default/hover/disabled (disabled via native `disabled` + faded styling, no separate prop needed), and
  an optional trailing icon slot (external-link icon for secondary/tertiary, play icon for text). Height
  44px, radius `md` (12px), Inter Medium 14–16px, horizontal padding 16px (lg) / 12px (md) per spec.
- `components/ui/input.tsx` — `SearchInput`/text input: left search icon, placeholder, right-aligned
  `⌘K` shortcut hint, height 44px, radius `md`, border `1px solid neutral-200`, focus border
  `primary-400`.
- `components/ui/select.tsx` — simple styled `<select>` (native element, styled to match — no headless
  UI dependency needed for a single-purpose sort dropdown), same field specs as the input.
- `components/ui/badge.tsx` — `Badge` with variants `video | lesson | popular` matching the tag colors
  shown.
- `components/ui/status-indicator.tsx` — `in-progress | completed | now-playing | locked`, icon + label.
- `components/ui/progress-bar.tsx` — track + fill + optional "% complete" label, takes a `value` 0–100.
- `components/ui/course-card.tsx`, `components/ui/lesson-card.tsx` (video and lesson variants via a
  `kind` prop), `components/ui/resource-card.tsx` — presentational cards taking typed props for all
  visible fields (title, description, meta, thumbnail/icon, action).
- `components/ui/nav.tsx` — top nav: logo + wordmark, `Courses` / `My Learning` links (plain `<a>`/`Link`,
  no auth-aware state yet — that comes with Clerk later).
- `components/ui/breadcrumbs.tsx`, `components/ui/pagination.tsx` — per the reference layout.
- `lib/utils.ts` — `cn()` helper (`clsx` + `tailwind-merge`).
- `app/design-system/page.tsx` — demo page rendering every section above (mirroring the numbered
  sections in the reference image) so it can be checked side-by-side with the PNG. Dev/reference route
  only, not linked from any real nav.

## Requirements

- Match the reference exactly: colors, type scale, spacing, radius, shadow values, button/input specs,
  card contents and layout. No restyling or "improving" beyond it.
- Responsive: the demo page's card grids and nav should reflow sensibly on mobile (stack/wrap), since
  there's no mobile reference and section 3 of AGENTS.md requires sensible mobile adaptation.
- All components are presentational only — no data fetching, no server/client boundary violations, no
  Sanity/Clerk/PostHog imports. Purely `components/ui`.
- Reuse Tailwind's arbitrary-value escape hatch only where a token doesn't already cover it; prefer the
  new `@theme` tokens (e.g. `bg-primary-500`, `text-heading-1`, `shadow-md`, `rounded-md`) over inline
  hex/px.

## Security considerations

None — no data fetching, no secrets, no user input persisted, no external network calls beyond
self-hosted Google Fonts via `next/font` (no runtime request to Google).

## Files expected to touch

- `app/globals.css` (theme tokens, remove dark-mode override)
- `app/layout.tsx` (swap Geist → Playfair Display + Inter)
- `package.json` / `package-lock.json` (add `lucide-react`, `clsx`, `tailwind-merge`)
- New: `lib/utils.ts`
- New: `components/ui/button.tsx`, `input.tsx`, `select.tsx`, `badge.tsx`, `status-indicator.tsx`,
  `progress-bar.tsx`, `course-card.tsx`, `lesson-card.tsx`, `resource-card.tsx`, `nav.tsx`,
  `breadcrumbs.tsx`, `pagination.tsx`
- New: `app/design-system/page.tsx`

## Acceptance criteria

- `/design-system` renders all 14 sections of the reference (colors, typography, type scale, spacing,
  radius/shadows, icons, buttons incl. states, inputs, badges, status indicators, progress bar, cards,
  nav/breadcrumbs/pagination) visually matching the PNG.
- Button disabled state is unclickable and visually faded; hover states work via CSS, not JS.
- Type check, lint, and production build all pass.
- No console errors/warnings in the browser on `/design-system`.

## Checks to run

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `npm run dev` and visually diff `/design-system` against `design/vertex-designsystem.png`

## Manual test steps

1. `npm run dev`, open `http://localhost:3000/design-system`.
2. Compare each numbered section against `design/vertex-designsystem.png` side by side.
3. Hover and tab-focus each button variant; confirm hover state changes and disabled buttons don't
   respond to click/hover.
4. Resize the browser to a mobile width (375px) and confirm card grids and the nav reflow without
   horizontal scroll or overlap.
5. Confirm `⌘K` hint renders in the search input and the select shows "Most Relevant".
