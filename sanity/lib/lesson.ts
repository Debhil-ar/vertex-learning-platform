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

/** Every lesson across every module of the course, in display order. */
function flattenLessons(course: NonNullable<LessonWithCourse['course']>) {
  return course.modules.flatMap((courseModule) => courseModule.lessons)
}

/**
 * The lesson immediately before and after the current one, across module
 * boundaries, for the sticky prev/next footer.
 */
export function getLessonNavigation(lesson: LessonWithCourse) {
  const course = lesson.course
  if (!course) return { previous: null, next: null }

  const flat = flattenLessons(course)
  const currentIndex = flat.findIndex((entry) => entry?._id === lesson._id)
  if (currentIndex === -1) return { previous: null, next: null }

  return {
    previous: flat[currentIndex - 1] ?? null,
    next: flat[currentIndex + 1] ?? null,
  }
}

export type LessonStatus = 'complete' | 'current' | 'upcoming'

/**
 * There is no persisted per-learner progress yet (see AGENTS.md section 7),
 * so completion is derived from position: every lesson before the one
 * being viewed, in flattened course order, is treated as complete. This
 * keeps the sidebar and the course percentage internally consistent as you
 * navigate between lessons without inventing unrelated numbers.
 */
export function getLessonSidebarData(lesson: LessonWithCourse) {
  const course = lesson.course
  if (!course) return null

  const flat = flattenLessons(course)
  const currentIndex = flat.findIndex((entry) => entry?._id === lesson._id)
  const totalLessons = flat.length

  const modules = course.modules.map((courseModule, moduleIndex) => {
    const lessons = courseModule.lessons.map((entry) => {
      const flatIndex = flat.findIndex((flatEntry) => flatEntry?._id === entry._id)
      const status: LessonStatus =
        flatIndex === currentIndex ? 'current' : flatIndex < currentIndex ? 'complete' : 'upcoming'
      return { ...entry, status }
    })

    const isActive = lessons.some((entry) => entry.status === 'current')
    const moduleStatus: LessonStatus = isActive
      ? 'current'
      : lessons.every((entry) => entry.status === 'complete')
        ? 'complete'
        : 'upcoming'

    return {
      key: courseModule._key,
      moduleNumber: moduleIndex + 1,
      title: courseModule.title,
      lessons,
      status: moduleStatus,
      isActive,
    }
  })

  const completedCount = currentIndex === -1 ? 0 : currentIndex
  const percentComplete =
    totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100)

  return {
    course,
    modules,
    percentComplete,
  }
}
