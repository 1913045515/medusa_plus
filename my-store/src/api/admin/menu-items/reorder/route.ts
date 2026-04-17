import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MenuService } from "../../../../modules/menu/services/menu.service"

// POST /admin/menu-items/reorder
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new MenuService(req.scope)
  const body = req.body as any
  const items: Array<{ id: string; parent_id: string | null; sort_order: number }> = body.items || []
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ message: "items array is required" })
    return
  }
  await svc.reorderItems(items)
  res.json({ success: true })
}
