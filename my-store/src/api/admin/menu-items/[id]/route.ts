import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MenuService } from "../../../../modules/menu/services/menu.service"

// PUT /admin/menu-items/:id
export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new MenuService(req.scope)
  const { id } = req.params
  const body = req.body as any
  const item = await svc.updateItem(id, {
    title: body.title,
    href: body.href,
    icon: body.icon,
    parent_id: body.parent_id,
    sort_order: body.sort_order,
    is_visible: body.is_visible,
    target: body.target,
  })
  res.json({ menu_item: item })
}

// DELETE /admin/menu-items/:id
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new MenuService(req.scope)
  const { id } = req.params
  await svc.deleteItem(id)
  res.json({ id, deleted: true })
}
