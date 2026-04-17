import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAYPAL_MODULE } from "../../../modules/paypal"
import PaypalModuleService, { encryptSecret, decryptSecret } from "../../../modules/paypal/service"

function maskSecret(encrypted: string): string {
  return "••••••••"
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve<PaypalModuleService>(PAYPAL_MODULE)

  const configs = await service.listPaypalConfigs()
  if (!configs || configs.length === 0) {
    return res.json({ paypal_config: null })
  }

  const config = configs[0]
  res.json({
    paypal_config: {
      id: config.id,
      client_id: config.client_id,
      client_secret: maskSecret(config.client_secret_encrypted),
      mode: config.mode,
      card_fields_enabled: config.card_fields_enabled,
    },
  })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve<PaypalModuleService>(PAYPAL_MODULE)
  const body = req.body as {
    client_id?: string
    client_secret?: string
    mode?: string
    card_fields_enabled?: boolean
  }

  // Validate required fields
  if (!body.client_id || !body.client_secret) {
    return res.status(400).json({
      message: "client_id and client_secret are required",
    })
  }

  if (body.mode && !["sandbox", "live"].includes(body.mode)) {
    return res.status(400).json({ message: "mode must be 'sandbox' or 'live'" })
  }

  let encryptedSecret: string
  try {
    encryptedSecret = encryptSecret(body.client_secret)
  } catch (err: any) {
    return res.status(500).json({
      message: "Failed to encrypt client secret: " + err.message,
    })
  }

  const configs = await service.listPaypalConfigs()

  if (configs && configs.length > 0) {
    const updated = await service.updatePaypalConfigs({
      id: configs[0].id,
      client_id: body.client_id,
      client_secret_encrypted: encryptedSecret,
      mode: body.mode || configs[0].mode,
      card_fields_enabled: body.card_fields_enabled ?? configs[0].card_fields_enabled,
    })
    return res.json({
      paypal_config: {
        id: updated.id,
        client_id: updated.client_id,
        client_secret: maskSecret(updated.client_secret_encrypted),
        mode: updated.mode,
        card_fields_enabled: updated.card_fields_enabled,
      },
    })
  }

  const created = await service.createPaypalConfigs({
    client_id: body.client_id,
    client_secret_encrypted: encryptedSecret,
    mode: body.mode || "sandbox",
    card_fields_enabled: body.card_fields_enabled ?? false,
  })

  return res.status(201).json({
    paypal_config: {
      id: created.id,
      client_id: created.client_id,
      client_secret: maskSecret(created.client_secret_encrypted),
      mode: created.mode,
      card_fields_enabled: created.card_fields_enabled,
    },
  })
}
