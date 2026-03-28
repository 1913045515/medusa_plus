import { Metadata } from "next"

import { listCollections } from "@lib/data/collections"
import Hero from "@modules/home/components/hero"
import FeaturedProducts from "@modules/home/components/featured-products"
import HomepageFeaturedCourses from "@modules/home/components/homepage-featured-courses"
import HomepageHighlights from "@modules/home/components/homepage-highlights"
import HomepageTemplate from "@modules/home/components/homepage-template"
import { getHomepageContent } from "@lib/data/homepage"
import { isStaticHomepageContent } from "@lib/data/homepage"
import { getRegion } from "@lib/data/regions"
import { getLocale } from "@lib/data/locale-actions"

export const metadata: Metadata = {
  title: "AI Cross-Stand",
  description:
    "Admin-managed storefront homepage for courses and commerce.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const locale = await getLocale()
  const homepage = await getHomepageContent(countryCode, locale)

  const [regionResult, collectionsResult] = await Promise.allSettled([
    getRegion(countryCode),
    listCollections({ fields: "*products" }),
  ])

  const region = regionResult.status === "fulfilled" ? regionResult.value : null
  const collections =
    collectionsResult.status === "fulfilled"
      ? collectionsResult.value.collections
      : []

  return (
    <>
      {isStaticHomepageContent(homepage) ? (
        <HomepageTemplate template={homepage} />
      ) : (
        <>
          <Hero hero={homepage.hero} />
          <HomepageHighlights highlights={homepage.highlights} />
          <HomepageFeaturedCourses featuredCourses={homepage.featured_courses} />
          {region && collections.length ? (
            <ul>
              <FeaturedProducts collections={collections} region={region} />
            </ul>
          ) : null}
        </>
      )}
    </>
  )
}
