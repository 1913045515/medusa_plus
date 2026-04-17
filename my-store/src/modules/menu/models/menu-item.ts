import { model } from "@medusajs/framework/utils"

const MenuItem = model.define("menu_item", {
  id: model.id().primaryKey(),
  menu_type: model.text().default("front"), // 'front' | 'admin'
  title: model.text(),
  href: model.text(),
  icon: model.text().nullable(),
  parent_id: model.text().nullable(),
  sort_order: model.number().default(0),
  is_visible: model.boolean().default(true),
  target: model.text().default("_self"), // '_self' | '_blank'
})

export default MenuItem
