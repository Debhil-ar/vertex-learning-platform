import { defineQuery } from 'next-sanity'

import { imageFragment } from './fragments'

export const INSTRUCTOR_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "instructor" && slug.current == $slug][0]{
    _id,
    name,
    "slug": slug.current,
    photo { ${imageFragment} },
    expertise,
    bio,
    "courses": *[_type == "course" && references(^._id) && defined(slug.current)]{
      _id,
      title,
      "slug": slug.current,
      summary,
      coverImage { ${imageFragment} },
      level,
      price
    }
  }
`)
