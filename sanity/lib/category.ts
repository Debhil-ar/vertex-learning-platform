import 'server-only'

import { CATEGORIES_QUERY, CATEGORY_BY_SLUG_QUERY } from '../queries/category'
import { sanityFetch } from './live'

/** Fetches all categories for category listings. */
export async function getCategories() {
  const { data } = await sanityFetch({ query: CATEGORIES_QUERY })
  return data
}

/** Fetches a category and its courses by slug. */
export async function getCategoryBySlug(slug: string) {
  const { data } = await sanityFetch({ query: CATEGORY_BY_SLUG_QUERY, params: { slug } })
  return data
}
