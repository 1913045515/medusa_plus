import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContentPageService } from "../../../modules/content-pages/services/content-page.service"

function getService(req: MedusaRequest) {
  return new ContentPageService(req.scope)
}

// GET /store/content-pages
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = getService(req)
  const query = req.query as Record<string, string>

  const result = await svc.list({
    status: "published",
    show_in_footer: query.show_in_footer === "true" ? true : undefined,
    page: 1,
    limit: 100,
  })

  // Return only the fields needed for footer/navigation
  const pages = result.content_pages.map((p: any) => ({
    title: p.title,
    footer_label: p.footer_label,
    slug: p.slug,
    sort_order: p.sort_order,
  }))

  res.json({ content_pages: pages, count: pages.length })
}
