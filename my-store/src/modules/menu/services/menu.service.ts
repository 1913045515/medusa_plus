import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

function generateId(): string {
  return `mi_${Math.random().toString(36).slice(2, 11)}_${Date.now().toString(36)}`
}

export class MenuService {
  constructor(private readonly scope: any) {}

  private get knex() {
    const knex = this.scope.resolve(
      ContainerRegistrationKeys.PG_CONNECTION ?? "pg_connection"
    )
    if (!knex) throw new Error("Could not resolve 'pg_connection' from request scope")
    return knex
  }

  async listItems(menuType?: string) {
    let query = this.knex("menu_item").whereNull("deleted_at").orderBy([
      { column: "sort_order", order: "asc" },
      { column: "created_at", order: "asc" },
    ])
    if (menuType) query = query.where("menu_type", menuType)
    return query.select("*")
  }

  async listTree(menuType: string, visibleOnly = false) {
    let query = this.knex("menu_item").where("menu_type", menuType).whereNull("deleted_at")
    if (visibleOnly) query = query.where("is_visible", true)
    const items = await query.orderBy([
      { column: "sort_order", order: "asc" },
      { column: "created_at", order: "asc" },
    ]).select("*")

    // Build tree: root items with children
    const roots = items.filter((i: any) => !i.parent_id)
    return roots.map((root: any) => ({
      ...root,
      children: items.filter((i: any) => i.parent_id === root.id),
    }))
  }

  async createItem(data: {
    menu_type: string
    title: string
    href: string
    icon?: string | null
    parent_id?: string | null
    sort_order?: number
    is_visible?: boolean
    target?: string
  }) {
    // Validate: parent must be a root item (no nesting beyond level 2)
    if (data.parent_id) {
      const parent = await this.knex("menu_item")
        .where("id", data.parent_id)
        .whereNull("deleted_at")
        .first()
      if (!parent) throw new Error("Parent menu item not found")
      if (parent.parent_id) throw new Error("Cannot nest more than 2 levels deep")
    }

    const id = generateId()
    const now = new Date()
    await this.knex("menu_item").insert({
      id,
      menu_type: data.menu_type,
      title: data.title,
      href: data.href,
      icon: data.icon ?? null,
      parent_id: data.parent_id ?? null,
      sort_order: data.sort_order ?? 0,
      is_visible: data.is_visible !== undefined ? data.is_visible : true,
      target: data.target ?? "_self",
      created_at: now,
      updated_at: now,
    })
    return this.knex("menu_item").where("id", id).first()
  }

  async updateItem(
    id: string,
    data: {
      title?: string
      href?: string
      icon?: string | null
      parent_id?: string | null
      sort_order?: number
      is_visible?: boolean
      target?: string
    }
  ) {
    // Validate parent if changing
    if (data.parent_id !== undefined && data.parent_id !== null) {
      const parent = await this.knex("menu_item")
        .where("id", data.parent_id)
        .whereNull("deleted_at")
        .first()
      if (!parent) throw new Error("Parent menu item not found")
      if (parent.parent_id) throw new Error("Cannot nest more than 2 levels deep")
      if (parent.id === id) throw new Error("Cannot set item as its own parent")
    }

    await this.knex("menu_item")
      .where("id", id)
      .whereNull("deleted_at")
      .update({ ...data, updated_at: new Date() })
    return this.knex("menu_item").where("id", id).first()
  }

  async reorderItems(items: Array<{ id: string; parent_id: string | null; sort_order: number }>) {
    await this.knex.transaction(async (trx: any) => {
      for (const item of items) {
        await trx("menu_item").where("id", item.id).update({
          parent_id: item.parent_id ?? null,
          sort_order: item.sort_order,
          updated_at: new Date(),
        })
      }
    })
  }

  async deleteItem(id: string) {
    const now = new Date()
    // Soft-delete children first
    await this.knex("menu_item").where("parent_id", id).update({ deleted_at: now, updated_at: now })
    // Soft-delete the item itself
    await this.knex("menu_item").where("id", id).update({ deleted_at: now, updated_at: now })
  }
}
