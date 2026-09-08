import { defineQuery } from 'next-sanity'

import { imageFragment } from './fragments'

export const CATEGORY_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "category" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    description,
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

export const CATEGORIES_QUERY = defineQuery(/* groq */ `
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    description
  }
`)
