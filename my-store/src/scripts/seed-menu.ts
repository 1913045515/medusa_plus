import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

function generateId(prefix = "mi"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}_${Date.now().toString(36)}`
}

export default async function seedMenu({ container }: ExecArgs) {
  const knex = container.resolve(
    ContainerRegistrationKeys.PG_CONNECTION ?? "pg_connection"
  ) as any

  // Check if already seeded
  const existing = await knex("menu_item").whereNull("deleted_at").count("id as count").first()
  if (existing && parseInt(existing.count, 10) > 0) {
    console.log("✓ Menu items already seeded, skipping.")
    return
  }

  const now = new Date()

  // ─── Front Menu ─────────────────────────────────────────────────────────────
  const frontItems = [
    { id: generateId(), menu_type: "front", title: "Home", href: "/", sort_order: 0, is_visible: true, target: "_self", icon: null, parent_id: null },
    { id: generateId(), menu_type: "front", title: "Store", href: "/store", sort_order: 1, is_visible: true, target: "_self", icon: null, parent_id: null },
    { id: generateId(), menu_type: "front", title: "Courses", href: "/courses", sort_order: 2, is_visible: true, target: "_self", icon: null, parent_id: null },
    { id: generateId(), menu_type: "front", title: "Blog", href: "/blog", sort_order: 3, is_visible: true, target: "_self", icon: null, parent_id: null },
    { id: generateId(), menu_type: "front", title: "Account", href: "/account", sort_order: 4, is_visible: true, target: "_self", icon: null, parent_id: null },
    { id: generateId(), menu_type: "front", title: "Support", href: "/support/tickets", sort_order: 5, is_visible: true, target: "_self", icon: null, parent_id: null },
  ]

  // ─── Admin Menu ──────────────────────────────────────────────────────────────
  // Titles use i18n translation keys so the UI can resolve them in any language.
  // Medusa built-in routes (orders, products, customers etc.) are top-level.
  // All extension routes are grouped under a single "扩展设置" parent.
  const extensionsParentId = generateId()
  const adminItems = [
    // ── Medusa built-in routes (top-level) ──
    { id: generateId(), menu_type: "admin", title: "Orders",    href: "/app/orders",    sort_order: 0, is_visible: true, target: "_self", icon: "ShoppingCart", parent_id: null },
    { id: generateId(), menu_type: "admin", title: "Products",  href: "/app/products",  sort_order: 1, is_visible: true, target: "_self", icon: "Tag",          parent_id: null },
    { id: generateId(), menu_type: "admin", title: "Customers", href: "/app/customers", sort_order: 2, is_visible: true, target: "_self", icon: "Users",        parent_id: null },
    // ── "扩展设置" parent (groups all extension routes) ──
    { id: extensionsParentId, menu_type: "admin", title: "扩展设置", href: "#", sort_order: 99, is_visible: true, target: "_self", icon: "Cog", parent_id: null },
    // ── Custom admin routes (children of 扩展设置, title = i18n key) ──
    { id: generateId(), menu_type: "admin", title: "homepageEditor.menuLabel",  href: "/app/homepage",             sort_order: 0,  is_visible: true, target: "_self", icon: "Home",         parent_id: extensionsParentId },
    { id: generateId(), menu_type: "admin", title: "courseEditor.menuLabel",    href: "/app/courses",              sort_order: 1,  is_visible: true, target: "_self", icon: "AcademicCap",  parent_id: extensionsParentId },
    { id: generateId(), menu_type: "admin", title: "blog.menuLabel",            href: "/app/blogs",                sort_order: 2,  is_visible: true, target: "_self", icon: "ChatBubble",   parent_id: extensionsParentId },
    { id: generateId(), menu_type: "admin", title: "blogCategory.menuLabel",    href: "/app/blog-categories",      sort_order: 3,  is_visible: true, target: "_self", icon: null,           parent_id: extensionsParentId },
    { id: generateId(), menu_type: "admin", title: "blogTag.menuLabel",         href: "/app/blog-tags",            sort_order: 4,  is_visible: true, target: "_self", icon: null,           parent_id: extensionsParentId },
    { id: generateId(), menu_type: "admin", title: "blogUserGroup.menuLabel",   href: "/app/blog-user-groups",     sort_order: 5,  is_visible: true, target: "_self", icon: null,           parent_id: extensionsParentId },
    { id: generateId(), menu_type: "admin", title: "fileAssets.menuLabel",      href: "/app/file-assets",          sort_order: 6,  is_visible: true, target: "_self", icon: "FolderOpen",   parent_id: extensionsParentId },
    { id: generateId(), menu_type: "admin", title: "contentPages.menuLabel",    href: "/app/content-pages",        sort_order: 7,  is_visible: true, target: "_self", icon: "DocumentText", parent_id: extensionsParentId },
    { id: generateId(), menu_type: "admin", title: "checkoutConfig.menuLabel",  href: "/app/checkout-field-config",sort_order: 8,  is_visible: true, target: "_self", icon: "CreditCard",   parent_id: extensionsParentId },
    { id: generateId(), menu_type: "admin", title: "siteAnalytics.menuLabel",   href: "/app/site-analytics",       sort_order: 9,  is_visible: true, target: "_self", icon: "ChartBar",     parent_id: extensionsParentId },
    { id: generateId(), menu_type: "admin", title: "tickets.menuLabel",         href: "/app/tickets",              sort_order: 10, is_visible: true, target: "_self", icon: "InboxIn",      parent_id: extensionsParentId },
    { id: generateId(), menu_type: "admin", title: "emailProxy.menuLabel",      href: "/app/email-proxy",          sort_order: 11, is_visible: true, target: "_self", icon: "EnvelopeOpen", parent_id: extensionsParentId },
    { id: generateId(), menu_type: "admin", title: "emailTemplates.menuLabel",  href: "/app/email-templates",      sort_order: 12, is_visible: true, target: "_self", icon: "DocumentText", parent_id: extensionsParentId },
    { id: generateId(), menu_type: "admin", title: "storeSettings.menuLabel",   href: "/app/store-settings",       sort_order: 13, is_visible: true, target: "_self", icon: "Cog",          parent_id: extensionsParentId },
    { id: generateId(), menu_type: "admin", title: "menuItems.menuLabel",       href: "/app/menu-items",           sort_order: 14, is_visible: true, target: "_self", icon: "Bars",         parent_id: extensionsParentId },
    { id: generateId(), menu_type: "admin", title: "paypalSettings.menuLabel",  href: "/app/settings/paypal",      sort_order: 15, is_visible: true, target: "_self", icon: "CreditCard",   parent_id: extensionsParentId },
  ]

  const allItems = [...frontItems, ...adminItems].map((item) => ({
    ...item,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  }))

  await knex("menu_item").insert(allItems)
  console.log(`✓ Seeded ${allItems.length} menu items (${frontItems.length} front + ${adminItems.length} admin)`)
}
