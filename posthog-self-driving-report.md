# PostHog Self-driving setup report

## Summary

PostHog Self-driving is configured for Vertex. Session Replay and Error Tracking were already enabled; Support (Conversations) was enabled in this run. Health checks, error tracking, and Support signal sources are enabled, and two Replay Vision monitors will send corroborated visual findings to the Self-driving inbox.

Findings should start appearing in the [Self-driving inbox](https://eu.posthog.com/project/270426/inbox) within about 30 minutes.

## AI data processing

Approved by the organization-level setup gate.

## GitHub

Connected before this run through the PostHog GitHub App. GitHub Issues was not selected as a Self-driving source in this run.

## Products enabled

| Product | Status | Notes |
| --- | --- | --- |
| Session Replay | Already enabled | The Next.js `posthog-js` initialization preserves recording defaults; it does not disable session recording. |
| Error Tracking | Already enabled | The client initialization has `capture_exceptions: true`. |
| Support (Conversations) | Enabled | Tickets require an inbound email, inbox, or Slack channel before any arrive. |

## Signal sources

| Signal source | Action | Source configuration ID |
| --- | --- | --- |
| `health_checks` / `health_issue` | Enabled | `01a086fb-b523-7613-b896-506d5cf7afb8` |
| `error_tracking` / `issue_created` | Enabled | `01a086fb-b59d-79a0-b7ac-0ca63e6fd8f8` |
| `error_tracking` / `issue_reopened` | Enabled | `01a086fb-b5b4-7aa7-ad67-1243b9038416` |
| `error_tracking` / `issue_spiking` | Enabled | `01a086fb-b683-7baf-af25-d9deedd7202b` |
| `conversations` / `ticket` | Enabled | `01a086fb-b5b4-7c58-8c01-69ec8b99bba4` |
| `signals_scout` / `cross_source_issue` | Skipped — admitted by default and no opt-out row existed | — |
| Session replay responder | Skipped — covered by Replay Vision scanners below | — |

## Connected tools

No connected tools were selected. GitHub Issues, Linear, Jira, Sentry, and Zendesk were offered. No connected-tool responders were enabled.

## Scout troop

**Run budget:** 100 maximum runs/day, 0 used today, 100 remaining. Announcement: “Scouts are in early access. Each project gets up to 100 scout runs a day. Contact team-self-driving@posthog.com if you need more.”

### Active scouts (6)

| Scout | Why it is active |
| --- | --- |
| `signals-scout-general` | Cross-product patterns and otherwise-uncovered surfaces. |
| `signals-scout-product-analytics` | Product flows, conversion, retention, lifecycle, and engagement patterns. |
| `signals-scout-web-analytics` | Web traffic, attribution, landing-page health, and acquisition volume. |
| `signals-scout-health-checks` | Actionable PostHog setup and instrumentation health issues. |
| `signals-scout-search-to-learning` | Vertex search demand and search-to-learning activation. |
| `signals-scout-course-activation` | Vertex course discovery, catalog exploration, and lesson-start activation. |

### Disabled built-in scouts

Twenty-three built-in specialists remain disabled to keep the troop selective: AI observability, anomaly detection, APM, Conversations, CSP violations, customer analytics, data pipelines, data warehouse, experiments, feature flags, inbox validation, insight alerts, logs, MCP tool calls, observability gaps, Replay Vision trend analysis, revenue analytics, session replay, skills store, surveys, tasks, and web vitals. They are not currently evidenced by the repo or are covered by a dedicated route: error tracking by native sources and session replay by the monitors below. Enable a specialist later if that product becomes actively used.

## Custom scouts

Both proposed scouts were approved and created. Each runs daily by default, is enabled, and emits full reports to the inbox.

| Scout | What it watches | Discriminator and coverage rationale |
| --- | --- | --- |
| `signals-scout-search-to-learning` | Search submissions, course views, and lesson starts. | Reports a sustained drop from search to learning only when traffic stays healthy. It adds a domain-specific handoff and entry-volume view beyond the enabled generic product-analytics scout. |
| `signals-scout-course-activation` | Catalog browsing, filters, bookmarks, and lesson starts. | Reports a sustained catalog-to-lesson activation or entry-volume drop only when traffic is stable. It covers course-specific behavior that the generic scout does not name. |

The team does not currently collect a search-result count or an explicit empty-filter result event, so neither scout infers a zero-result defect. If either scout becomes noisy, set `emit: false` on its configuration in PostHog to change it to dry-run.

## Replay Vision scanners

A scanner is an LLM that watches individual session recordings on a schedule and pushes confirmed visual defects to the inbox. These are the only components in this setup that spend Replay Vision quota. Findings arrive at half weight and need independent corroboration before promotion to a report.

| Brief | Status | Scanner | Scope | Sampling | Estimated monthly spend |
| --- | --- | --- | --- | --- | --- |
| Breakage monitor | Created | Vertex course access breakage | Recordings with a URL containing `/courses/`; this covers the catalog and course-detail route where learners select and start lessons. | 0.5 | 0 credits for 0 estimated observations |
| Frustration monitor | Created | Vertex learner frustration | Recordings containing `$rageclick` only; no URL filter, avoiding a widened overlap with the breakage monitor. | 1.0 | 0 credits for 0 estimated observations |

No recordings were found during setup. The monitors are armed and will begin working when recordings arrive. The Replay Vision estimate/quota companion skill was not available in this project, so organization-wide remaining Replay Vision budget could not be independently verified; the created scanners currently estimate zero observations and zero credits.

## Files modified or created

- Created `posthog-self-driving-report.md`.
- No application source files were modified. Existing PostHog client initialization was inspected and already preserves Session Replay and Error Tracking defaults.

## Follow-ups

- [ ] Connect an inbound Support channel (email, inbox, or Slack) in PostHog so Conversations tickets can reach the enabled responder.
- [ ] Reauthorize the PostHog MCP connection with `property_definition:read` if you want direct event-schema verification for the custom scout queries.
- [ ] Consider adding explicit search-result-count and empty-filter-result instrumentation if detecting unmet catalog demand is important.

## What happens next

The scout coordinator picks up fresh configurations within about 30 minutes. Daily scout runs draw from the project’s 100-run early-access budget, findings cluster into reports in the inbox, and immediately actionable reports can begin coding tasks.
