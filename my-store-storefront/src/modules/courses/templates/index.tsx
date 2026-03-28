import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import CoursesGrid from "./courses-grid"
import { getCoursesDictionary } from "@lib/i18n/dictionaries"

export default function CoursesTemplate({ locale }: { locale?: string | null }) {
  const dict = getCoursesDictionary(locale)
  return (
    <div className="content-container py-6">
      <div className="mb-8">
        <h1 className="text-2xl-semi" data-testid="courses-page-title">
          {dict.pageTitle}
        </h1>
        <p className="text-ui-fg-subtle">
          {dict.pageSubtitle}
        </p>
      </div>

      <Suspense fallback={<SkeletonProductGrid />}>
        <CoursesGrid locale={locale} />
      </Suspense>
    </div>
  )
}
