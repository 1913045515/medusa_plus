import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAYPAL_MODULE } from "../../../../modules/paypal"
import PaypalModuleService from "../../../../modules/paypal/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve<PaypalModuleService>(PAYPAL_MODULE)

  let configs: any[]
  try {
    configs = await service.listPaypalConfigs()
  } catch {
    return res.json({ enabled: false })
  }

  if (!configs || configs.length === 0) {
    return res.json({ enabled: false })
  }

  const config = configs[0]

  // Only return public fields — never return client_secret_encrypted
  res.json({
    enabled: true,
    client_id: config.client_id,
    mode: config.mode,
    card_fields_enabled: config.card_fields_enabled,
  })
}
