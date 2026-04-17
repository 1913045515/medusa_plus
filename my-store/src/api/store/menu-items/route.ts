import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MenuService } from "../../../modules/menu/services/menu.service"

// GET /store/menu-items?type=front|admin
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new MenuService(req.scope)
  const menuType = ((req.query.type as string) || "front")
  // Public endpoint: only return visible items as a tree
  const tree = await svc.listTree(menuType, true)
  res.json({ menu_items: tree })
}
