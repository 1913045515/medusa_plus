import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DEFAULT_EMAIL_TEMPLATES } from "../../../../../modules/store-settings/email-template-defaults"

export const GET = async (_req: MedusaRequest, res: MedusaResponse) => {
  res.json({ email_templates: DEFAULT_EMAIL_TEMPLATES })
}
