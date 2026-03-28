import Link from "next/link"
import { ArrowUpRightMini } from "@medusajs/icons"
import { Text } from "@medusajs/ui"
import type { HomepageFeaturedCourseItem } from "types/homepage"

const HomepageFeaturedCourses = ({
  featuredCourses,
}: {
  featuredCourses: HomepageFeaturedCourseItem[]
}) => {
  return (
    <section className="content-container py-16 small:py-24">
      <div className="flex flex-col small:flex-row small:items-end small:justify-between gap-4 mb-8">
        <div>
          <Text className="text-xs uppercase tracking-[0.24em] text-ui-fg-muted mb-3">
            Featured learning offers
          </Text>
          <h2 className="text-3xl small:text-5xl leading-tight tracking-[-0.03em]">
            Run the homepage like an operating surface, not a static banner.
          </h2>
        </div>
        <Text className="max-w-xl text-ui-fg-subtle leading-7">
          Curate a small set of lessons or offers from admin, then let the storefront render them as a clean editorial grid.
        </Text>
      </div>

      <div className="grid gap-5 small:grid-cols-2">
        {featuredCourses.map((item, index) => (
          <Link
            key={item.id}
            href={item.href}
            className="group overflow-hidden rounded-[28px] border border-ui-border-base bg-white"
          >
            <div className="relative h-64 overflow-hidden bg-[#dbeafe]">
              {item.image_url ? (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
                  style={{ backgroundImage: `url(${item.image_url})` }}
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute left-5 top-5 inline-flex rounded-full bg-white/90 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#0f172a]">
                {item.badge || `Spotlight ${index + 1}`}
              </div>
            </div>
            <div className="p-6 small:p-7">
              <div className="flex items-start justify-between gap-4">
                <Text className="text-2xl leading-8 text-ui-fg-base">{item.title}</Text>
                <ArrowUpRightMini className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
              <Text className="mt-4 text-ui-fg-subtle leading-7">{item.description}</Text>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default HomepageFeaturedCourses