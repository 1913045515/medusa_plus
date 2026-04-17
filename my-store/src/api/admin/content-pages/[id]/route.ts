import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContentPageService } from "../../../../modules/content-pages/services/content-page.service"

function getService(req: MedusaRequest) {
  return new ContentPageService(req.scope)
}

// GET /admin/content-pages/:id
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = getService(req)
  const page = await svc.getById(req.params.id)
  if (!page) {
    return res.status(404).json({ message: "Content page not found" })
  }
  res.json({ content_page: page })
}

// PUT /admin/content-pages/:id
export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = getService(req)
  const body = req.body as any

  const existing = await svc.getById(req.params.id)
  if (!existing) {
    return res.status(404).json({ message: "Content page not found" })
  }

  if (body.slug && body.slug !== existing.slug) {
    const slugTaken = await svc.isSlugTaken(body.slug, req.params.id)
    if (slugTaken) {
      return res.status(409).json({ message: `Slug "${body.slug}" is already in use` })
    }
  }

  const updated = await svc.update(req.params.id, body)
  res.json({ content_page: updated })
}

// DELETE /admin/content-pages/:id
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = getService(req)
  const existing = await svc.getById(req.params.id)
  if (!existing) {
    return res.status(404).json({ message: "Content page not found" })
  }
  await svc.delete(req.params.id)
  res.json({ deleted: true, id: req.params.id })
}
