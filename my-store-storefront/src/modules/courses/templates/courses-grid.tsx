import { listCourses } from "@lib/data/courses"
import { getCoursesDictionary } from "@lib/i18n/dictionaries"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function CoursesGrid({ locale }: { locale?: string | null }) {
  const courses = await listCourses(locale)
  const dict = getCoursesDictionary(locale)

  if (!courses.length) {
    return (
      <div className="text-ui-fg-subtle" data-testid="courses-empty">
        {dict.empty}
      </div>
    )
  }

  const levelLabel = (level: string) => {
    switch (level) {
      case "beginner": return dict.levelBeginner
      case "intermediate": return dict.levelIntermediate
      case "advanced": return dict.levelAdvanced
      default: return level
    }
  }

  return (
    <ul
      className="grid grid-cols-1 small:grid-cols-2 medium:grid-cols-3 gap-6"
      data-testid="courses-list"
    >
      {courses.map((c) => (
        <li
          key={c.id}
          className="border border-ui-border-base rounded-rounded overflow-hidden hover:shadow-md transition-shadow"
        >
          <LocalizedClientLink href={`/courses/${c.handle}`} className="block">
            <div className="aspect-video bg-ui-bg-subtle overflow-hidden">
              {c.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.thumbnail_url}
                  alt={c.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-grey-10" />
              )}
            </div>
            <div className="p-4">
              <h3 className="text-base-semi" data-testid="course-title">
                {c.title}
              </h3>
              <p className="text-ui-fg-subtle txt-small mt-2 line-clamp-2">
                {c.description}
              </p>
              <div className="flex gap-3 mt-3 text-ui-fg-muted txt-small flex-wrap">
                {c.level ? (
                  <span className="bg-grey-10 px-2 py-0.5 rounded-full">
                    {levelLabel(c.level)}
                  </span>
                ) : null}
                {typeof c.lessons_count === "number" ? (
                  <span className="bg-grey-10 px-2 py-0.5 rounded-full">
                    {c.lessons_count} {dict.lessonsUnit}
                  </span>
                ) : null}
              </div>
            </div>
          </LocalizedClientLink>
        </li>
      ))}
    </ul>
  )
}
