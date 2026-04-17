import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAYPAL_MODULE } from "../../../../modules/paypal"
import PaypalModuleService, { decryptSecret } from "../../../../modules/paypal/service"
import { PayPalClient } from "../../../../modules/paypal/paypal-client"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve<PaypalModuleService>(PAYPAL_MODULE)

  const configs = await service.listPaypalConfigs()
  if (!configs || configs.length === 0) {
    return res.json({
      success: false,
      error: "No PayPal configuration found. Please save your credentials first.",
    })
  }

  const config = configs[0]
  let secret: string
  try {
    secret = decryptSecret(config.client_secret_encrypted)
  } catch {
    return res.json({
      success: false,
      error: "Failed to decrypt client secret. Check PAYPAL_CONFIG_ENCRYPTION_KEY.",
    })
  }

  const client = new PayPalClient(
    config.client_id,
    secret,
    config.mode as "sandbox" | "live"
  )

  try {
    await client.testConnection()
    res.json({ success: true, environment: config.mode })
  } catch (err: any) {
    res.json({ success: false, error: err.message })
  }
}
