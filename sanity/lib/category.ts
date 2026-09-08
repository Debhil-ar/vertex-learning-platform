import 'server-only'

import { CATEGORIES_QUERY, CATEGORY_BY_SLUG_QUERY } from '../queries/category'
import { sanityFetch } from './live'

export async function getCategories() {
  const { data } = await sanityFetch({ query: CATEGORIES_QUERY })
  return data
}

export async function getCategoryBySlug(slug: string) {
  const { data } = await sanityFetch({ query: CATEGORY_BY_SLUG_QUERY, params: { slug } })
  return data
}
