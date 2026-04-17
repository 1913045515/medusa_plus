import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MenuService } from "../../../modules/menu/services/menu.service"

// GET /admin/menu-items?type=front|admin
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new MenuService(req.scope)
  const menuType = (req.query.type as string) || undefined
  const items = await svc.listItems(menuType)
  res.json({ menu_items: items })
}

// POST /admin/menu-items
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new MenuService(req.scope)
  const body = req.body as any
  const item = await svc.createItem({
    menu_type: body.menu_type || "front",
    title: body.title,
    href: body.href,
    icon: body.icon ?? null,
    parent_id: body.parent_id ?? null,
    sort_order: body.sort_order ?? 0,
    is_visible: body.is_visible !== undefined ? body.is_visible : true,
    target: body.target ?? "_self",
  })
  res.status(201).json({ menu_item: item })
}
