import { Metadata } from "next"

import { getLocale } from "@lib/data/locale-actions"
import CourseDetailTemplate from "@modules/courses/templates/course-detail"

export const metadata: Metadata = {
  title: "Course",
}

type Params = {
  params: Promise<{ countryCode: string; handle: string }>
}

export default async function CourseDetailPage(props: Params) {
  const { countryCode, handle } = await props.params
  const locale = await getLocale()
  return <CourseDetailTemplate countryCode={countryCode} handle={handle} locale={locale} />
}
