import { Text } from "@medusajs/ui"
import type { HomepageHighlightItem } from "types/homepage"

const HomepageHighlights = ({ highlights }: { highlights: HomepageHighlightItem[] }) => {
  return (
    <section className="content-container py-16 small:py-20">
      <div className="grid gap-4 small:grid-cols-3">
        {highlights.map((item, index) => (
          <article
            key={item.id}
            className="rounded-[24px] border border-ui-border-base bg-[#f6f5ef] p-6 small:p-8 text-[#1f2937]"
          >
            <Text className="text-xs uppercase tracking-[0.24em] text-[#6b7280]">
              {String(index + 1).padStart(2, "0")}
            </Text>
            <Text className="mt-4 text-2xl leading-8 font-medium">{item.title}</Text>
            <Text className="mt-4 text-base leading-7 text-[#4b5563]">{item.description}</Text>
          </article>
        ))}
      </div>
    </section>
  )
}

export default HomepageHighlights