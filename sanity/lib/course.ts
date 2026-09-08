import 'server-only'

import { COURSES_QUERY, COURSE_BY_SLUG_QUERY, COURSE_SLUGS_QUERY } from '../queries/course'
import { sanityFetch } from './live'

/** Fetches all courses for the catalog. */
export async function getCourses() {
  const { data } = await sanityFetch({ query: COURSES_QUERY })
  return data
}

/** Fetches a course and its curriculum by slug. */
export async function getCourseBySlug(slug: string) {
  const { data } = await sanityFetch({ query: COURSE_BY_SLUG_QUERY, params: { slug } })
  return data
}

/** Fetches published course slugs for static route generation. */
export async function getCourseSlugs() {
  const { data } = await sanityFetch({
    query: COURSE_SLUGS_QUERY,
    perspective: 'published',
    stega: false,
  })
  return data
}
