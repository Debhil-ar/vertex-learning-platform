# Lesson page

## Goal

Build the lesson page (`/lessons/[slug]`) from `design/vertex-lesson.png`, wired to the seeded
Sanity content, with the lesson's video actually playing on the page through its provider embed
(YouTube, per the seed data).

## Skills read

- AGENTS.md (root) — sections 5 (server/client boundaries), 7 (decisions: provider embed only, no
  custom player, PostHog moments, progress is real state but some surfaces are presentational-only),
  8 (lesson/course/module shape), 12 (pitfalls).
- No other skill applies directly (no Sanity schema change, no search/MCP work, no migration). I did
  not invoke sanity-best-practices since the schema already exists and isn't changing.

## Code inspected

- `app/courses/[slug]/page.tsx` — course detail page: layout shell, `Nav`, `Breadcrumbs`, sticky
  bottom bar pattern, how `sanity/lib/*` + `urlFor` + `formatSecondsAsDuration` are used.
- `sanity/queries/lesson.ts` / `sanity/lib/lesson.ts` — `LESSON_BY_SLUG_QUERY` already fetches the
  lesson plus its parent course via reverse reference, and `getLessonPosition()` already derives
  `Lesson 5.1`-style labels from array order. The course's `modules[].lessons[]` are currently
  projected as `_id` only (just enough for position lookup) — too thin for the sidebar and
  prev/next nav, so this needs widening.
- `sanity/queries/course.ts`, `sanity/queries/fragments.ts` — projection patterns to copy
  (`imageFragment`, module/lesson shape identical to what the sidebar needs).
- `studio/schemaTypes/lesson.ts`, `module.ts`, `course.ts` — confirmed exact field names or
  `videoUrl` (a plain URL — seed data uses real YouTube watch URLs), `poster`, `duration` (`"mm:ss"`
  string), `freePreview`, `notes` (Portable Text), `keyPoints` (string array), `proTip` (text),
  `resources[]` (`type`/`title`/`description`/`url`), and that a lesson has no stored link to its
  module or course.
- `components/ui/*` — `course-content.tsx` (accordion pattern for modules/lessons, currently used on
  the course page, not reusable as-is because the lesson-page sidebar needs per-lesson status icons,
  an always-visible active module, and a different compact visual style), `status-indicator.tsx`,
  `resource-card.tsx`, `lesson-card.tsx` (confirmed unused anywhere yet — it's the future search
  result card from section 11, not for this page, so leaving it untouched), `badge.tsx`,
  `button.tsx`, `progress-bar.tsx`, `breadcrumbs.tsx`, `course-actions.tsx` (PostHog capture
  pattern), `course-outcomes.tsx` (free-text icon-keyword → Lucide icon map pattern, reused for
  resource type icons), `nav.tsx`, `page-view-tracker.tsx`.
- `lib/utils.ts` — `parseDurationToSeconds` / `formatSecondsAsDuration`, `cn`.
- `app/globals.css`, `app/layout.tsx` — type scale, color tokens, fonts, confirms `ClerkProvider`
  and `SanityLive` are already wired at the root.
- `package.json` — confirmed `@portabletext/react` is not yet installed (needed to render
  `lesson.notes`); no video/progress schema or API routes exist yet anywhere in the repo.

## Decisions and assumptions

- **Progress is stubbed visually, not persisted** (confirmed with you). No `progress` schema, no
  server route, no Clerk-keyed writes in this task. The sidebar's checkmarks/now-playing dot and the
  course "% complete" figure are *derived* from the current lesson's position in the course (every
  lesson before it in flattened module order counts as complete, the current lesson is "now
  playing", everything after is not started) — not hardcoded numbers, so they stay internally
  consistent as you navigate between seeded lessons. Real per-learner progress becomes its own later
  task per AGENTS.md section 7.
- **Video stays on the provider's own player.** AGENTS.md section 7 explicitly forbids a custom
  player, even though the mockup's control bar (scrubber/speed/CC/gear/fullscreen) looks custom —
  that chrome is reproduced by YouTube's own iframe controls, not rebuilt. The lesson page embeds a
  standard YouTube iframe (`enablejsapi=1` so we can listen to state changes for analytics — see
  below — not to replace controls) sized/positioned like the mockup's video box. Seed data is all
  YouTube; Vimeo/Bunny embed cases aren't implemented since AGENTS.md section 9 says a provider
  isn't "supported" until both ingestion and playback exist, and no Vimeo/Bunny content exists yet.
- **`?t=<seconds>` query param sets the YouTube start time**, matching the contract AGENTS.md
  section 7 describes for future search result links ("a start seconds query param... starts at that
  second using the provider's own start parameter"). Free to add now, nothing else depends on it
  yet.
- **PostHog instrumentation**: AGENTS.md section 7 explicitly lists "a video play and how far it is
  watched" and "a lesson completed" as required moments, plus lesson views generally. I'll capture
  `lesson_viewed` on mount (mirrors `course_viewed`), `video_played` the first time playback starts,
  and `video_progress` (with a `percent_watched` figure) on pause/unmount/tab-hide — using the
  YouTube IFrame Player API's state-change events, which is listening to the provider's own player,
  not building one. If `percent_watched` crosses 90% I fire `lesson_completed` once. This is
  analytics only — it does not write any progress record.
- **Notes tab is presentational only** per AGENTS.md section 7's explicit list. It renders a plain,
  non-persisted textarea placeholder ("Add your notes while you watch...") — no save action, no
  backend.
- **Resources**: `resource-card.tsx` is currently unused elsewhere, so I'll adjust it in place
  (not fork a new component) to match the mockup — optional `icon` prop (defaults to `FileText`),
  optional `meta` (currently required; the mockup shows none), external-link glyph top right. Icon
  chosen per lesson page by `resource.type` (`article`/`download` → `FileText`, `video` →
  `PlayCircle`, `link` → `Github` when the URL host is `github.com`, else `Link2`), same free-text
  → icon mapping style as `course-outcomes.tsx`.
- Sidebar course thumbnail uses the course's real `coverImage` (small square, `object-cover`), not a
  fabricated letter badge, since real data is available and AGENTS.md says pages show only stored
  data.
- Breadcrumb reads **All Courses > course title > module title > lesson title**, matching the
  mockup's four segments.

## Files expected to touch

Modify:
- `sanity/queries/lesson.ts` — widen `course.modules[].lessons[]->` to the same shape as
  `COURSE_BY_SLUG_QUERY` (`_id, title, slug, duration, freePreview`), add `course.level` and
  `course.coverImage`.
- `sanity/lib/lesson.ts` — add `getLessonNavigation(lesson)` (previous/next lesson across the
  flattened module order) and `getLessonSidebarData(lesson)` (per-module/per-lesson derived
  status: `complete` / `current` / `upcoming`, plus the course's overall stub percent-complete),
  built on the same flattening `getLessonPosition` already does.
- `components/ui/resource-card.tsx` — optional `icon`/`meta` props as described above.
- `package.json` — add `@portabletext/react`.

Create:
- `app/lessons/[slug]/page.tsx` — the page itself (server component): breadcrumbs, header
  (badge/title/description/meta row/bookmark button), video player, tabs, lesson content
  (overview via Portable Text, key points, pro tip, resources), sticky prev/next footer. Reuses
  `Nav`, `Breadcrumbs`, `Badge`, `Button`, `ProgressBar`, `ResourceCard`.
- `components/ui/lesson-sidebar.tsx` — client component, the left rail: course card + progress bar,
  accordion of modules (active module expanded by default, others toggle open/closed), lessons
  listed with status icon (`CheckCircle2` complete / filled dot "now playing" with `PlayCircle` /
  empty circle upcoming), each lesson a link to `/lessons/[slug]`.
- `components/ui/lesson-tabs.tsx` — client component, "Lesson Content" / "Notes" tab switcher; takes
  the already-rendered content for each tab as props/children so the underlying content stays a
  server-rendered tree.
- `components/ui/video-player.tsx` — client component wrapping the YouTube iframe + IFrame Player
  API listener for the PostHog events above.
- `lib/video.ts` — `getYouTubeVideoId(url)` / `getYouTubeEmbedUrl(url, { startSeconds })` helpers.

## Requirements

- Route reads the slug, fetches via `getLessonBySlug`, 404s via `notFound()` if missing, matching
  the course page's pattern.
- `generateMetadata` sets title/description from the lesson.
- Video actually plays in the browser (real YouTube embed of the seeded `videoUrl`), starting at
  `?t=` seconds when present.
- Sidebar, tabs, header meta, resources, pro tip, key points all render from real Sanity fields —
  nothing invented. If a lesson has no `proTip`/`resources`/`keyPoints`, that section is omitted
  (same "only what's returned" discipline used on the course page for `outcomes`).
- Notes are rendered with `@portabletext/react` (no more `markdown`, per AGENTS.md section 8).
- Responsive: sidebar collapses above the video on mobile (stacked), matching AGENTS.md section 3's
  "no mobile reference, adapt sensibly" instruction; desktop matches the mockup's two-column layout
  exactly.
- Server/client boundary preserved: only the sidebar toggle, tab switch, video player analytics, and
  bookmark button are client components; everything else (page shell, Portable Text render,
  resources, meta) stays server-rendered.

## Security considerations

- No new secrets. Sanity read token stays server-side via the existing `sanityFetch` helper; nothing
  new is exposed to the browser.
- The YouTube iframe `src` is built from a validated, extracted video id (not the raw stored URL
  interpolated directly) to avoid the embed URL carrying anything unexpected.
- `?t=` is parsed as an integer and clamped to `>= 0` before being used as the YouTube `start` param.

## Acceptance criteria

- [ ] Visiting a seeded lesson URL shows the exact mockup layout at desktop width: breadcrumbs,
      lesson badge/title/description/meta row, playing video, tabs, overview/key
      points/pro-tip/resources, sidebar with course progress + module/lesson accordion, sticky
      prev/next footer.
- [ ] The video is the real seeded YouTube video and plays inline with YouTube's own controls.
- [ ] Sidebar shows the current lesson highlighted "now playing", earlier lessons (in flattened
      course order) checked off, later lessons unmarked, current module expanded, and the course
      progress bar reflects that same derived fraction.
- [ ] Clicking a different lesson in the sidebar, or Previous/Next in the footer, navigates and the
      page updates correctly (badge label, status states, prev/next targets) for at least 3 lessons
      across 2 different modules in one seeded course.
- [ ] Lessons with no `proTip`/`resources` render without empty/broken sections.
- [ ] Notes tab shows a plain, non-persisted placeholder; no console errors, no network calls to
      save anything.
- [ ] Mobile width (375px) stacks sidebar below/above content sensibly, no horizontal overflow.
- [ ] `lesson_viewed`, `video_played`, and (after scrubbing near the end) `lesson_completed` fire in
      the PostHog debug panel / network tab.

## Checks to run

- `npm run lint`
- `npx tsc --noEmit` (or the project's type-check script)
- `npm run build`
- `npm run dev` and manually exercise the test steps below.

## Manual test steps

1. `npm run dev`, open `/courses`, click into any seeded course, click "Continue Learning" (or a
   lesson row) to land on `/lessons/<slug>`.
2. Confirm the video loads and plays with sound/controls (click play).
3. Confirm sidebar: current lesson has the "now playing" mark, earlier lessons in the course are
   checked, the module containing the current lesson is expanded, course % complete matches
   `completed / total lessons` for that course.
4. Click a different lesson in the sidebar; confirm the page navigates and all of the above updates.
5. Use the sticky footer's Next Lesson / Previous Lesson buttons; confirm they navigate to the
   correct adjacent lesson and are hidden/disabled at the first/last lesson of the course.
6. Switch to the "Notes" tab; type in the placeholder textarea; refresh the page and confirm nothing
   persisted (expected — it's presentational only).
7. Resize to a mobile width; confirm no horizontal scroll and the layout stacks sensibly.
8. Append `?t=120` to a lesson URL; confirm the embedded video starts at 2:00.
9. Open the browser devtools network tab (or PostHog live events) and confirm `lesson_viewed` fires
   on load, `video_played` fires on first play, and `lesson_completed` fires once you scrub near the
   end of the video.
