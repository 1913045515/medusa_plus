import { listCollections } from "@lib/data/collections"
import { getFooterContentPages } from "@lib/data/content-pages"
import { getMenuItems } from "@lib/data/menu-items"
import { Text } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

const DEFAULT_FOOTER_LINKS = [
  { id: "store", title: "Shop", href: "/store", target: "_self", is_visible: true },
  { id: "courses", title: "Courses", href: "/courses", target: "_self", is_visible: true },
  { id: "blog", title: "Journal", href: "/blog", target: "_self", is_visible: true },
  { id: "account", title: "Account", href: "/account", target: "_self", is_visible: true },
]

export default async function Footer() {
  const [{ collections }, contentPages, menuItems] = await Promise.all([
    listCollections({ fields: "*products" }),
    getFooterContentPages(),
    getMenuItems("front"),
  ])
  const footerLinks = (menuItems.length ? menuItems : DEFAULT_FOOTER_LINKS)
    .filter((item) => item.is_visible && item.href !== "/")
    .slice(0, 5)
  const featuredCollections = collections.slice(0, 4)
  const supportLinks = contentPages.length
    ? contentPages
    : [
        { slug: "contact", title: "Contact", footer_label: "Contact" },
        { slug: "faq", title: "FAQ", footer_label: "FAQ" },
        { slug: "support", title: "Support", footer_label: "Support" },
      ]

  return (
    <footer className="mt-14 w-full border-t border-[#ddd1bf] bg-[#f8f3ec] text-[#3d3024]">
      <div className="content-container flex flex-col gap-8 py-8 md:py-10">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_repeat(2,minmax(0,1fr))]">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#846b50]">
              Cross Stand
            </p>
            <Text className="max-w-md text-sm leading-6 text-[#6b5947]">
              Physical products and digital goods in a simpler storefront shell.
            </Text>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5c4935]">
              Browse
            </h3>
            <div className="flex flex-col gap-2 text-sm text-[#3d3024]">
              {footerLinks.map((item) => (
                <LocalizedClientLink
                  key={item.id}
                  href={item.href}
                  target={item.target}
                  className="transition-colors hover:text-[#7a6146]"
                >
                  {item.title}
                </LocalizedClientLink>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5c4935]">
              Support
            </h3>
            <div className="flex flex-col gap-2 text-sm text-[#3d3024]">
              {supportLinks.map((page) => (
                <LocalizedClientLink
                  key={page.slug}
                  href={`/content/${page.slug}`}
                  className="transition-colors hover:text-[#7a6146]"
                >
                  {page.footer_label || page.title}
                </LocalizedClientLink>
              ))}
              {featuredCollections[0] && (
                <LocalizedClientLink
                  href={`/collections/${featuredCollections[0].handle}`}
                  className="transition-colors hover:text-[#7a6146]"
                >
                  {featuredCollections[0].title}
                </LocalizedClientLink>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#e4d9ca] pt-4 md:flex-row md:items-center md:justify-between">
          <Text className="text-xs uppercase tracking-[0.18em] text-[#7a6651]">
            © {new Date().getFullYear()} Cross Stand. All rights reserved.
          </Text>
          <Text className="text-xs text-[#8a735d]">
            Simple navigation, secure checkout, and direct access after purchase.
          </Text>
        </div>
      </div>
    </footer>
  )
}
