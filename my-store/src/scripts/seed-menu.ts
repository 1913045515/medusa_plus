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
    { id: generateId(), menu_type: "front", title: "首页", href: "/", sort_order: 0, is_visible: true, target: "_self", icon: null, parent_id: null },
    { id: generateId(), menu_type: "front", title: "商店", href: "/store", sort_order: 1, is_visible: true, target: "_self", icon: null, parent_id: null },
    { id: generateId(), menu_type: "front", title: "课程", href: "/courses", sort_order: 2, is_visible: true, target: "_self", icon: null, parent_id: null },
    { id: generateId(), menu_type: "front", title: "博客", href: "/blog", sort_order: 3, is_visible: true, target: "_self", icon: null, parent_id: null },
    { id: generateId(), menu_type: "front", title: "账户", href: "/account", sort_order: 4, is_visible: true, target: "_self", icon: null, parent_id: null },
  ]

  // ─── Admin Menu ──────────────────────────────────────────────────────────────
  const adminItems = [
    { id: generateId(), menu_type: "admin", title: "仪表盘", href: "/a", sort_order: 0, is_visible: true, target: "_self", icon: "ChartBar", parent_id: null },
    { id: generateId(), menu_type: "admin", title: "订单管理", href: "/a/orders", sort_order: 1, is_visible: true, target: "_self", icon: "ShoppingCart", parent_id: null },
    { id: generateId(), menu_type: "admin", title: "商品管理", href: "/a/products", sort_order: 2, is_visible: true, target: "_self", icon: "Tag", parent_id: null },
    { id: generateId(), menu_type: "admin", title: "课程管理", href: "/a/courses", sort_order: 3, is_visible: true, target: "_self", icon: "AcademicCap", parent_id: null },
    { id: generateId(), menu_type: "admin", title: "博客管理", href: "/a/blogs", sort_order: 4, is_visible: true, target: "_self", icon: "DocumentText", parent_id: null },
    { id: generateId(), menu_type: "admin", title: "客户管理", href: "/a/customers", sort_order: 5, is_visible: true, target: "_self", icon: "Users", parent_id: null },
    { id: generateId(), menu_type: "admin", title: "系统设置", href: "/a/store-settings", sort_order: 6, is_visible: true, target: "_self", icon: "Cog", parent_id: null },
    { id: generateId(), menu_type: "admin", title: "菜单管理", href: "/a/menu-items", sort_order: 7, is_visible: true, target: "_self", icon: "Bars3", parent_id: null },
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
