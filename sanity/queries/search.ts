import { defineQuery } from 'next-sanity'

import { plainTextFragment } from './fragments'

// Re-fetches the exact lessons the search agent chose, straight from
// Sanity, by id. This is what grounds search results — the LLM only ever
// picks which lesson ids match; every field a card shows comes from here,
// never from the model's own text.
export const SEARCH_LESSONS_BY_IDS_QUERY = defineQuery(/* groq */ `
  *[_type == "lesson" && _id in $ids]{
    _id,
    title,
    "slug": slug.current,
    duration,
    freePreview,
    studentCount,
    keyPoints,
    ${plainTextFragment('notes')},
    "course": *[_type == "course" && references(^._id)][0]{
      _id,
      title,
      "slug": slug.current,
      modules[]{
        _key,
        title,
        lessons[]->{ _id }
      }
    }
  }
`)
