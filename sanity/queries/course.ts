import { defineQuery } from 'next-sanity'

import { categorySummaryFragment, imageFragment, instructorSummaryFragment } from './fragments'

// Catalog listing — one card's worth of fields per course.
export const COURSES_QUERY = defineQuery(/* groq */ `
  *[_type == "course" && defined(slug.current)] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    summary,
    coverImage { ${imageFragment} },
    level,
    price,
    popular,
    studentCount,
    instructor->{ ${instructorSummaryFragment} },
    category->{ ${categorySummaryFragment} },
    "moduleCount": count(modules),
    "lessonCount": count(modules[].lessons)
  }
`)

// Single course detail — full modules/lessons tree for the course page.
export const COURSE_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "course" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    summary,
    coverImage { ${imageFragment} },
    level,
    price,
    popular,
    studentCount,
    outcomes[]{ icon, title, description },
    instructor->{ ${instructorSummaryFragment}, expertise, bio },
    category->{ ${categorySummaryFragment} },
    modules[]{
      _key,
      title,
      summary,
      lessons[]->{
        _id,
        title,
        "slug": slug.current,
        duration,
        freePreview,
        poster { ${imageFragment} }
      }
    }
  }
`)

// Every course slug, for generateStaticParams. Use with useCdn: false /
// perspective: 'published' at the call site.
export const COURSE_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "course" && defined(slug.current)]{ "slug": slug.current }
`)
