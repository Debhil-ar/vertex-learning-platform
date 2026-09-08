import 'server-only'

import { INSTRUCTOR_BY_SLUG_QUERY } from '../queries/instructor'
import { sanityFetch } from './live'

export async function getInstructorBySlug(slug: string) {
  const { data } = await sanityFetch({ query: INSTRUCTOR_BY_SLUG_QUERY, params: { slug } })
  return data
}
