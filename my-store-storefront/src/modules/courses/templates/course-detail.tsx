import { getCourseByHandle } from "@lib/data/courses"
import { getCourseLessons } from "@lib/data/lessons"
import { getCoursesDictionary } from "@lib/i18n/dictionaries"
import LessonPlayer from "@modules/courses/components/lesson-player"

export default async function CourseDetailTemplate({
  countryCode,
  handle,
  locale,
}: {
  countryCode: string
  handle: string
  locale?: string | null
}) {
  const course = await getCourseByHandle(handle, locale)
  const dict = getCoursesDictionary(locale)

  if (!course) {
    return (
      <div className="content-container py-6">
        <p className="text-ui-fg-subtle">{dict.notFound}</p>
      </div>
    )
  }

  const lessons = await getCourseLessons(course.id, locale)

  if (!lessons.length) {
    return (
      <div className="content-container py-6">
        <h1 className="text-2xl-semi mb-2">{course.title}</h1>
        <p className="text-ui-fg-subtle" data-testid="lessons-empty">{dict.noLessons}</p>
      </div>
    )
  }

  return (
    <div className="content-container py-6">
      <LessonPlayer course={course} lessons={lessons} dict={dict} />
    </div>
  )
}
