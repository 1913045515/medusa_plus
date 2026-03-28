import { Metadata } from "next"

import { getLocale } from "@lib/data/locale-actions"
import CoursesTemplate from "@modules/courses/templates"

export const metadata: Metadata = {
  title: "Courses",
  description: "Browse available courses.",
}

type Params = {
  params: Promise<{ countryCode: string }>
}

export default async function CoursesPage(props: Params) {
  await props.params
  const locale = await getLocale()

  return <CoursesTemplate locale={locale} />
}
