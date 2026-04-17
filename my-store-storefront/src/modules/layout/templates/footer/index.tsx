import { listCollections } from "@lib/data/collections"
import { getFooterContentPages } from "@lib/data/content-pages"
import { Text } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const [{ collections }, contentPages] = await Promise.all([
    listCollections({ fields: "*products" }),
    getFooterContentPages(),
  ])

  return (
    <footer className="border-t border-ui-border-base w-full">
      <div className="content-container flex flex-col w-full">
        <div className="flex w-full mb-16 mt-8 justify-between text-ui-fg-muted">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} wolzq. All rights reserved.
          </Text>
          {contentPages.length > 0 && (
            <div className="flex gap-4">
              {contentPages.map((page) => (
                <LocalizedClientLink
                  key={page.slug}
                  href={`/content/${page.slug}`}
                  className="txt-compact-small hover:text-ui-fg-base transition-colors"
                >
                  {page.footer_label || page.title}
                </LocalizedClientLink>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
