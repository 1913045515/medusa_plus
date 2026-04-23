import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useState, useEffect } from "react"

type MenuItem = {
  id: string
  title: string
  href: string
  parent_id: string | null
  sort_order: number
  is_visible: boolean
  target: string
  children?: MenuItem[]
}

// Medusa built-in core routes — handled by CoreRouteSection (nav:nth-of-type(1))
const CORE_HREFS = new Set([
  "/app/orders",
  "/app/products",
  "/app/inventory",
  "/app/customers",
  "/app/promotions",
  "/app/price-lists",
])

// Resolve i18n-style key like "blog.menuLabel" → friendly Chinese label
function resolveTitle(title: string): string {
  const knownLabels: Record<string, string> = {
    "homepageEditor.menuLabel": "首页编辑",
    "courseEditor.menuLabel": "课程",
    "blog.menuLabel": "博客",
    "blogCategory.menuLabel": "博客分类",
    "blogTag.menuLabel": "博客标签",
    "blogUserGroup.menuLabel": "用户组",
    "fileAssets.menuLabel": "文件管理",
    "contentPages.menuLabel": "内容页面",
    "checkoutConfig.menuLabel": "结账配置",
    "siteAnalytics.menuLabel": "站点分析",
    "tickets.menuLabel": "支持票务",
    "emailProxy.menuLabel": "邮件日志",
    "emailTemplates.menuLabel": "邮件模板",
    "storeSettings.menuLabel": "商店设置",
    "menuItems.menuLabel": "菜单管理",
    "paypalSettings.menuLabel": "PayPal 配置",
  }
  if (knownLabels[title]) return knownLabels[title]
  const m = title.match(/^([a-zA-Z][a-zA-Z0-9]*)\.[a-zA-Z][a-zA-Z0-9.]+$/)
  if (m) {
    const root = m[1]
    return root.charAt(0).toUpperCase() + root.slice(1).replace(/([A-Z])/g, " $1").trim()
  }
  return title
}

/**
 * Apply DB-driven ordering and visibility to Medusa's native admin sidebar.
 *
 * Medusa's sidebar has two <nav> sections inside <aside>:
 *   nav:nth-of-type(1) — CoreRouteSection  (Orders / Products / Customers …)
 *   nav:nth-of-type(2) — ExtensionRouteSection  (our custom routes)
 *
 * Both sections are `display:flex; flex-direction:column` containers whose
 * direct children are `<div class="px-3">` wrappers.  Setting `order: N`
 * on those wrappers reorders them visually without touching the DOM tree.
 *
 * We use the CSS :has() pseudo-class to target each wrapper by the href of
 * the link it contains.  :has() is supported in all modern browsers.
 */
function applySidebarCSS(allItems: MenuItem[]) {
  const rules: string[] = []

  // ── EXTENSION items: reorder by DB sort_order ─────────────────────────────
  // These are items whose href is NOT a core route and NOT a /settings/* path.
  const extItems = allItems
    .filter((i) => {
      if (!i.href || i.href === "#") return false
      if (CORE_HREFS.has(i.href)) return false
      if (i.href.startsWith("/app/settings")) return false
      return true
    })
    .sort((a, b) => a.sort_order - b.sort_order)

  extItems.forEach((item, idx) => {
    const safe = item.href.replace(/"/g, '\\"')
    if (item.is_visible) {
      // Reorder within ExtensionRouteSection's nav (nth-of-type(2))
      rules.push(
        `aside nav:nth-of-type(2) > div:has(a[href="${safe}"]) { order: ${idx}; }`
      )
    } else {
      // Hide from sidebar
      rules.push(
        `aside nav:nth-of-type(2) > div:has(a[href="${safe}"]) { display: none !important; }`
      )
    }
  })

  // ── CORE items: only handle visibility (cannot reorder these) ─────────────
  allItems
    .filter((i) => i.href && CORE_HREFS.has(i.href) && !i.is_visible)
    .forEach((item) => {
      const safe = item.href.replace(/"/g, '\\"')
      rules.push(
        `aside nav:nth-of-type(1) > div:has(a[href="${safe}"]) { display: none !important; }`
      )
    })

  // ── Inject / update the <style> element ───────────────────────────────────
  const styleId = "__admin_sidebar_ctrl"
  let style = document.getElementById(styleId) as HTMLStyleElement | null
  if (!style) {
    style = document.createElement("style")
    style.id = styleId
    document.head.appendChild(style)
  }
  style.textContent = rules.join("\n")
}

function AdminQuickNavWidget() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/admin/menu-items?type=admin", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const allItems: MenuItem[] = data.menu_items ?? []

        // Build tree for the quick-nav bar
        const roots = allItems
          .filter((i) => !i.parent_id && i.is_visible)
          .sort((a, b) => a.sort_order - b.sort_order)
        const tree = roots.map((root) => ({
          ...root,
          children: allItems
            .filter((i) => i.parent_id === root.id && i.is_visible)
            .sort((a, b) => a.sort_order - b.sort_order),
        }))
        setItems(tree)

        // Apply sidebar CSS overrides
        applySidebarCSS(allItems)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading || items.length === 0) return null

  return (
    <div className="mb-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle px-4 py-2">
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-xs text-ui-fg-muted font-medium shrink-0 mr-1">快捷导航:</span>
        {items.map((item) =>
          item.children && item.children.length > 0 ? (
            <details key={item.id} className="relative group">
              <summary className="cursor-pointer list-none inline-flex items-center gap-0.5 px-2.5 py-1 text-xs font-medium rounded-md border border-ui-border-base bg-white hover:bg-ui-bg-base transition-colors text-ui-fg-base">
                {resolveTitle(item.title)}
                <span className="text-ui-fg-muted">▾</span>
              </summary>
              <div className="absolute left-0 top-full mt-1 z-10 bg-white border border-ui-border-base rounded-md shadow-lg min-w-[140px] py-1">
                {item.children.map((child) => (
                  <a
                    key={child.id}
                    href={child.href}
                    target={child.target}
                    className="block px-3 py-1.5 text-xs text-ui-fg-base hover:bg-ui-bg-subtle transition-colors"
                  >
                    {resolveTitle(child.title)}
                  </a>
                ))}
              </div>
            </details>
          ) : (
            <a
              key={item.id}
              href={item.href}
              target={item.target}
              className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md border border-ui-border-base bg-white hover:bg-ui-bg-base transition-colors text-ui-fg-base"
            >
              {resolveTitle(item.title)}
            </a>
          )
        )}
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: [
    "order.list.before",
    "order.details.before",
    "product.list.before",
    "product.details.before",
    "customer.list.before",
    "customer.details.before",
    "customer_group.list.before",
    "promotion.list.before",
    "price_list.list.before",
    "sales_channel.list.before",
    "api_key.list.before",
    "user.list.before",
    "region.list.before",
    "tax.list.before",
    "location.list.before",
    "inventory_item.list.before",
    "store.details.before",
    "profile.details.before",
  ],
})

export default AdminQuickNavWidget
