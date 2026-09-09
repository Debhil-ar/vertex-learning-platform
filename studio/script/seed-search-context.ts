/**
 * One-time offline script that creates the Sanity Context document used by
 * the search agent. Run with `npx tsx script/seed-search-context.ts` from
 * `studio/`.
 *
 * The `@sanity/context` Studio plugin isn't installed (it requires
 * `sanity: ^6`, this Studio runs `^5.31.2` — see AGENTS.md section 12), so
 * there's no Studio UI form for this document. It's created directly via a
 * raw mutation instead, using the exact `sanity.agentContext` field names
 * from the plugin's schema (version, name, slug, groqFilter, instructions).
 *
 * Uses a deterministic `_id` + `createOrReplace` so re-running converges
 * instead of duplicating. Never run from the Next.js app.
 */
import path from 'node:path'
import { createClient, type SanityClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET
const token = process.env.SANITY_API_WRITE_TOKEN
const slug = process.env.SANITY_CONTEXT_SLUG || 'vertex-search'

if (!projectId || !dataset) {
  console.error('Missing SANITY_STUDIO_PROJECT_ID / SANITY_STUDIO_DATASET in studio/.env')
  process.exit(1)
}
if (!token) {
  console.error(
    'Missing SANITY_API_WRITE_TOKEN in .env.local. Add an Editor-scope token from ' +
      'manage.sanity.io -> your project -> API -> Tokens before running this script.',
  )
  process.exit(1)
}

const client: SanityClient = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2026-09-08',
  useCdn: false,
})

const INSTRUCTIONS = `### Rules
- A lesson has no reference back to its course. Find it with: *[_type == "course" && references(^._id)]
- "Module N" and "Lesson N.M" numbers are never stored — derive them from position in course.modules[] and modules[].lessons[]

### Schema notes
- lesson.notes is Portable Text (an array of blocks). Text-match its plain projection, e.g. "notes": pt::text(notes), never the raw array.
- lesson.keyPoints is a plain array of strings and can be matched directly with match / wildcards.
- lesson.freePreview is a display label only, not an access filter — ignore it when filtering search results.

### Query patterns
- Lessons matching a topic: *[_type == "lesson" && (title match "*term*" || pt::text(notes) match "*term*" || keyPoints[] match "*term*")]
- Lesson's parent course + module position: for a matched lesson _id, fetch *[_type == "course" && references($id)][0]{ modules[]{ title, lessons[]->{ _id } } } and find the lesson's index

### Known limitations
- There is no video document, chapter, or transcript data yet — only search lessons and courses by their own fields (title, notes, keyPoints, summary). Never invent a video timestamp or a video-only result.`

async function main() {
  const doc = {
    _id: `sanity.agentContext.${slug}`,
    _type: 'sanity.agentContext',
    version: '1',
    name: 'Vertex Search',
    slug: { _type: 'slug', current: slug },
    groqFilter: '_type in ["course", "lesson", "instructor", "category"]',
    instructions: INSTRUCTIONS,
  }

  await client.createOrReplace(doc)
  console.log(`Wrote sanity.agentContext "${slug}" (${doc._id}).`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
