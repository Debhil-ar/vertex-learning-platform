import 'server-only'

import { SEARCH_LESSONS_BY_IDS_QUERY } from '../queries/search'
import { sanityFetch } from './live'

export async function getLessonsByIds(ids: string[]) {
  if (ids.length === 0) return []
  const { data } = await sanityFetch({ query: SEARCH_LESSONS_BY_IDS_QUERY, params: { ids } })
  return data
}

export type SearchLesson = NonNullable<Awaited<ReturnType<typeof getLessonsByIds>>>[number]

/** Same derivation as sanity/lib/lesson.ts's getLessonPosition, for search result cards. */
export function getSearchLessonModuleLabel(lesson: SearchLesson) {
  const course = lesson.course
  if (!course) return null

  for (const courseModule of course.modules) {
    const found = courseModule.lessons.some((entry) => entry?._id === lesson._id)
    if (found) return courseModule.title
  }

  return null
}

export function getSearchLessonModuleNumber(lesson: SearchLesson) {
  const course = lesson.course
  if (!course) return null

  for (let moduleIndex = 0; moduleIndex < course.modules.length; moduleIndex++) {
    const found = course.modules[moduleIndex].lessons.some((entry) => entry?._id === lesson._id)
    if (found) return moduleIndex + 1
  }

  return null
}
