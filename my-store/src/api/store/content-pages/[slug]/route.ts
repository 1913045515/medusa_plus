import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContentPageService } from "../../../../modules/content-pages/services/content-page.service"

function getService(req: MedusaRequest) {
  return new ContentPageService(req.scope)
}

// GET /store/content-pages/:slug
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = getService(req)
  const page = await svc.getBySlug(req.params.slug)

  if (!page || page.status !== "published") {
    return res.status(404).json({ message: "Content page not found" })
  }

  res.json({
    content_page: {
      title: page.title,
      body: page.body,
      seo_title: page.seo_title,
      seo_description: page.seo_description,
      slug: page.slug,
      published_at: page.published_at,
    },
  })
}
