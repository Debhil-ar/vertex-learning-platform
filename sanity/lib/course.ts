import 'server-only'

import { COURSES_QUERY, COURSE_BY_SLUG_QUERY, COURSE_SLUGS_QUERY } from '../queries/course'
import { sanityFetch } from './live'

export async function getCourses() {
  const { data } = await sanityFetch({ query: COURSES_QUERY })
  return data
}

export async function getCourseBySlug(slug: string) {
  const { data } = await sanityFetch({ query: COURSE_BY_SLUG_QUERY, params: { slug } })
  return data
}

export async function getCourseSlugs() {
  const { data } = await sanityFetch({
    query: COURSE_SLUGS_QUERY,
    perspective: 'published',
    stega: false,
  })
  return data
}
