import 'server-only'

import { LESSON_BY_SLUG_QUERY } from '../queries/lesson'
import { sanityFetch } from './live'

export async function getLessonBySlug(slug: string) {
  const { data } = await sanityFetch({ query: LESSON_BY_SLUG_QUERY, params: { slug } })
  return data
}

type LessonWithCourse = NonNullable<Awaited<ReturnType<typeof getLessonBySlug>>>

/**
 * Module/lesson numbers (e.g. "Lesson 5.1") are derived from array order,
 * never stored. Finds this lesson's position within its parent course.
 */
export function getLessonPosition(lesson: LessonWithCourse) {
  const course = lesson.course
  if (!course) return null

  for (let moduleIndex = 0; moduleIndex < course.modules.length; moduleIndex++) {
    const courseModule = course.modules[moduleIndex]
    const lessonIndex = courseModule.lessons.findIndex((entry) => entry?._id === lesson._id)

    if (lessonIndex !== -1) {
      return {
        moduleNumber: moduleIndex + 1,
        moduleTitle: courseModule.title,
        lessonNumber: lessonIndex + 1,
        label: `Lesson ${moduleIndex + 1}.${lessonIndex + 1}`,
      }
    }
  }

  return null
}
