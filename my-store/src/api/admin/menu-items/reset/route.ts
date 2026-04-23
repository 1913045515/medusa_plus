import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { randomUUID } from "crypto"
import { notifyStorefrontMenuRevalidate } from "../../_utils/notify-storefront"

function generateId(): string {
  return `mi_${Math.random().toString(36).slice(2, 11)}_${Date.now().toString(36)}`
}

const DEFAULT_FRONT_ITEMS = [
  { title: "Home",    href: "/",                  sort_order: 0, icon: null },
  { title: "Store",   href: "/store",             sort_order: 1, icon: null },
  { title: "Courses", href: "/courses",           sort_order: 2, icon: null },
  { title: "Blog",    href: "/blog",              sort_order: 3, icon: null },
  { title: "Account", href: "/account",           sort_order: 4, icon: null },
  { title: "Support", href: "/support/tickets",   sort_order: 5, icon: null },
]

const DEFAULT_ADMIN_ITEMS = [
  // ── Medusa built-in routes (top-level) ──
  { title: "Orders",    href: "/app/orders",    sort_order: 0, icon: "ShoppingCart", _key: "orders" },
  { title: "Products",  href: "/app/products",  sort_order: 1, icon: "Tag",          _key: "products" },
  { title: "Customers", href: "/app/customers", sort_order: 2, icon: "Users",        _key: "customers" },
]

// Extension items — grouped as children under a single "扩展设置" (Extensions) parent
const DEFAULT_ADMIN_EXTENSIONS = [
  { title: "homepageEditor.menuLabel",  href: "/app/homepage",             sort_order: 0,  icon: "Home" },
  { title: "courseEditor.menuLabel",    href: "/app/courses",              sort_order: 1,  icon: "AcademicCap" },
  { title: "blog.menuLabel",            href: "/app/blogs",                sort_order: 2,  icon: "ChatBubble" },
  { title: "blogCategory.menuLabel",    href: "/app/blog-categories",      sort_order: 3,  icon: null },
  { title: "blogTag.menuLabel",         href: "/app/blog-tags",            sort_order: 4,  icon: null },
  { title: "blogUserGroup.menuLabel",   href: "/app/blog-user-groups",     sort_order: 5,  icon: null },
  { title: "fileAssets.menuLabel",      href: "/app/file-assets",          sort_order: 6,  icon: "FolderOpen" },
  { title: "contentPages.menuLabel",    href: "/app/content-pages",        sort_order: 7,  icon: "DocumentText" },
  { title: "checkoutConfig.menuLabel",  href: "/app/checkout-field-config",sort_order: 8,  icon: "CreditCard" },
  { title: "siteAnalytics.menuLabel",   href: "/app/site-analytics",       sort_order: 9,  icon: "ChartBar" },
  { title: "tickets.menuLabel",         href: "/app/tickets",              sort_order: 10, icon: "InboxIn" },
  { title: "emailProxy.menuLabel",      href: "/app/email-proxy",          sort_order: 11, icon: "EnvelopeOpen" },
  { title: "emailTemplates.menuLabel",  href: "/app/email-templates",      sort_order: 12, icon: "DocumentText" },
  { title: "storeSettings.menuLabel",   href: "/app/store-settings",       sort_order: 13, icon: "Cog" },
  { title: "menuItems.menuLabel",       href: "/app/menu-items",           sort_order: 14, icon: "Bars" },
  { title: "paypalSettings.menuLabel",  href: "/app/settings/paypal",      sort_order: 15, icon: "CreditCard" },
]

// POST /admin/menu-items/reset
// Deletes all existing menu items and re-seeds defaults.
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const knex = req.scope.resolve(
    ContainerRegistrationKeys.PG_CONNECTION ?? "pg_connection"
  ) as any

  const now = new Date()

  await knex("menu_item").delete()

  // Build admin rows: top-level + a single "扩展设置" parent containing all extension children
  const extensionsParentId = generateId()
  const adminRows: any[] = [
    ...DEFAULT_ADMIN_ITEMS.map((i) => {
      const { _key, ...rest } = i as any
      return {
        id: generateId(),
        menu_type: "admin",
        is_visible: true,
        target: "_self",
        deleted_at: null,
        created_at: now,
        updated_at: now,
        parent_id: null,
        ...rest,
      }
    }),
    {
      id: extensionsParentId,
      menu_type: "admin",
      is_visible: true,
      target: "_self",
      deleted_at: null,
      created_at: now,
      updated_at: now,
      parent_id: null,
      title: "扩展设置",
      href: null,
      sort_order: 99,
      icon: "Cog",
    },
    ...DEFAULT_ADMIN_EXTENSIONS.map((i) => ({
      id: generateId(),
      menu_type: "admin",
      is_visible: true,
      target: "_self",
      deleted_at: null,
      created_at: now,
      updated_at: now,
      parent_id: extensionsParentId,
      ...i,
    })),
  ]

  const rows = [
    ...DEFAULT_FRONT_ITEMS.map((i) => ({
      id: generateId(),
      menu_type: "front",
      is_visible: true,
      target: "_self",
      deleted_at: null,
      created_at: now,
      updated_at: now,
      parent_id: null,
      ...i,
    })),
    ...adminRows,
  ]

  await knex("menu_item").insert(rows)

  notifyStorefrontMenuRevalidate()
  res.json({ success: true, count: rows.length })
}
