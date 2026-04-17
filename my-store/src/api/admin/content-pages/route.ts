import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContentPageService } from "../../../modules/content-pages/services/content-page.service"

function getService(req: MedusaRequest) {
  return new ContentPageService(req.scope)
}

// GET /admin/content-pages
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = getService(req)
  const query = req.query as Record<string, string>
  const result = await svc.list({
    status: query.status,
    show_in_footer: query.show_in_footer === "true" ? true : query.show_in_footer === "false" ? false : undefined,
    q: query.q,
    page: query.page ? parseInt(query.page, 10) : 1,
    limit: query.limit ? parseInt(query.limit, 10) : 50,
  })
  res.json(result)
}

// POST /admin/content-pages
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = getService(req)
  const body = req.body as any

  if (!body?.title || !body?.slug) {
    return res.status(400).json({ message: "title and slug are required" })
  }

  const slugTaken = await svc.isSlugTaken(body.slug)
  if (slugTaken) {
    return res.status(409).json({ message: `Slug "${body.slug}" is already in use` })
  }

  const page = await svc.create(body)
  res.status(201).json({ content_page: page })
}
