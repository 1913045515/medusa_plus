/**
 * Shared browser-only utility for injecting CSS that controls Medusa admin
 * sidebar item ordering and visibility.
 *
 * Used by:
 *  - admin-quick-nav-widget  (applies on every widget-zone page)
 *  - menu-items/page         (applies on load + after each save/reorder)
 */

// Core Medusa built-in route hrefs (rendered by React Router with /app base)
export const CORE_HREFS = new Set([
  "/app/orders",
  "/app/products",
  "/app/inventory",
  "/app/customers",
  "/app/promotions",
  "/app/price-lists",
])

export type SidebarItem = {
  href: string
  is_visible: boolean
  sort_order: number
  parent_id?: string | null
}

/**
 * Inject / refresh the <style id="__admin_sidebar_ctrl"> rule-set that
 * visually reorders and hides extension sidebar items via CSS `order`.
 *
 * The rule targets `aside nav > div:has(a[href="..."])` which matches the
 * <div class="px-3"> NavItem wrapper inside the flex-column <nav> inside
 * the RadixCollapsible extension section.
 */
export function applySidebarCSS(allItems: SidebarItem[]) {
  const rules: string[] = []

  // Extension items: reorder by DB sort_order (exclude core, settings, "#" placeholders)
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
      rules.push(`aside nav > div:has(a[href="${safe}"]) { order: ${idx}; }`)
    } else {
      rules.push(`aside nav > div:has(a[href="${safe}"]) { display: none !important; }`)
    }
  })

  // Core items: only hide if explicitly marked invisible
  allItems
    .filter((i) => i.href && CORE_HREFS.has(i.href) && !i.is_visible)
    .forEach((item) => {
      const safe = item.href.replace(/"/g, '\\"')
      rules.push(`aside nav > div:has(a[href="${safe}"]) { display: none !important; }`)
    })

  const styleId = "__admin_sidebar_ctrl"
  let style = document.getElementById(styleId) as HTMLStyleElement | null
  if (!style) {
    style = document.createElement("style")
    style.id = styleId
    document.head.appendChild(style)
  }
  style.textContent = rules.join("\n")
}

/**
 * Fetch admin menu items and immediately apply sidebar CSS.
 * Call this whenever items change (on page load, after reorder/save).
 */
export async function fetchAndApplySidebarCSS(): Promise<void> {
  try {
    const res = await fetch("/admin/menu-items?type=admin", { credentials: "include" })
    if (res.ok) {
      const data = await res.json()
      applySidebarCSS(data.menu_items ?? [])
    }
  } catch {
    // silent — sidebar will fall back to default order
  }
}
