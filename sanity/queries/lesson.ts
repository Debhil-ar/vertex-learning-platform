import { defineQuery } from 'next-sanity'

import { imageFragment } from './fragments'

// A lesson document has no reference back to its course, so the parent
// course is found with a reverse reference and returned alongside the
// lesson. Module/lesson numbering is derived from array order in
// application code (see sanity/lib/lesson.ts), not stored here.
export const LESSON_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "lesson" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    videoUrl,
    poster { ${imageFragment} },
    duration,
    freePreview,
    studentCount,
    notes,
    keyPoints,
    proTip,
    resources[]{ type, title, description, url },
    "course": *[_type == "course" && references(^._id)][0]{
      _id,
      title,
      "slug": slug.current,
      level,
      coverImage { ${imageFragment} },
      modules[]{
        _key,
        title,
        lessons[]->{
          _id,
          title,
          "slug": slug.current,
          duration,
          freePreview
        }
      }
    }
  }
`)
