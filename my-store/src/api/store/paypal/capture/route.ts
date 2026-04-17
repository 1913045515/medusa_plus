import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAYPAL_MODULE } from "../../../../modules/paypal"
import PaypalModuleService, { decryptSecret } from "../../../../modules/paypal/service"
import { PayPalClient } from "../../../../modules/paypal/paypal-client"

/**
 * POST /store/paypal/capture
 *
 * Called by the Storefront after PayPal popup is approved.
 * Captures the PayPal order and updates the Medusa payment session.
 * Returns no sensitive data — the Storefront then calls placeOrder().
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const body = req.body as {
    paypal_order_id?: string
    cart_id?: string
  }

  if (!body.paypal_order_id) {
    return res.status(400).json({ message: "paypal_order_id is required" })
  }

  const service = req.scope.resolve<PaypalModuleService>(PAYPAL_MODULE)
  const configs = await service.listPaypalConfigs()

  if (!configs || configs.length === 0) {
    return res.status(500).json({ message: "PayPal is not configured" })
  }

  const config = configs[0]
  let secret: string
  try {
    secret = decryptSecret(config.client_secret_encrypted)
  } catch {
    return res.status(500).json({ message: "PayPal configuration error" })
  }

  const client = new PayPalClient(
    config.client_id,
    secret,
    config.mode as "sandbox" | "live"
  )

  try {
    const capture = await client.captureOrder(body.paypal_order_id)
    if (capture.status !== "COMPLETED") {
      return res.status(400).json({
        message: `PayPal capture returned status: ${capture.status}`,
      })
    }
    return res.json({ success: true, status: capture.status })
  } catch (err: any) {
    return res.status(400).json({ message: err.message })
  }
}
