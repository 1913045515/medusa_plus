import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { loadWechatPayConfig, assertWechatPayConfig } from "../../../../modules/wechatpay/config"
import { WechatPayClient } from "../../../../modules/wechatpay/wechatpay-client"

interface CartGraphRow {
  id: string
  display_id?: number
  items?: { id: string }[]
  payment_collection?: {
    id: string
    payment_sessions?: Array<{
      id: string
      provider_id: string
      currency_code: string
      amount: number | string
      data?: Record<string, any>
    }>
  } | null
}

const WECHAT_PROVIDER_IDS = ["pp_wechat_wechat", "wechat"]

/**
 * POST /store/wechat-pay/qrcode
 * 入参: { cart_id: string, description?: string }
 * 出参: { code_url, out_trade_no, amount_fen }
 *
 * 调用微信「Native 支付下单」接口，得到二维码链接 (code_url)。
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const body = (req.body || {}) as { cart_id?: string; description?: string }
  if (!body.cart_id) {
    return res.status(400).json({ message: "cart_id 必填" })
  }

  let cfg
  try {
    cfg = loadWechatPayConfig()
    assertWechatPayConfig(cfg)
  } catch (err: any) {
    return res.status(500).json({ message: err.message })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as any
  const r = await query.graph({
    entity: "cart",
    fields: [
      "id",
      "display_id",
      "items.id",
      "payment_collection.id",
      "payment_collection.payment_sessions.id",
      "payment_collection.payment_sessions.provider_id",
      "payment_collection.payment_sessions.currency_code",
      "payment_collection.payment_sessions.amount",
      "payment_collection.payment_sessions.data",
    ],
    filters: { id: body.cart_id },
  })
  const cart = (r?.data ?? [])[0] as CartGraphRow | undefined
  if (!cart) return res.status(404).json({ message: "Cart not found" })

  const session = cart.payment_collection?.payment_sessions?.find((s) =>
    WECHAT_PROVIDER_IDS.includes(s.provider_id)
  )
  if (!session) {
    return res.status(400).json({ message: "未找到微信支付 session" })
  }

  const sessionData = (session.data || {}) as Record<string, any>
  const outTradeNo: string | undefined = sessionData.out_trade_no
  const amountFen: number | undefined = sessionData.amount_fen
  if (!outTradeNo || !amountFen) {
    return res.status(400).json({ message: "支付 session 缺少 out_trade_no / amount_fen" })
  }

  const description =
    body.description ||
    `Order #${cart.display_id ?? cart.id.slice(-8)} (${cart.items?.length ?? 0} items)`

  try {
    const client = new WechatPayClient(cfg)
    const order = await client.createNativeOrder({
      outTradeNo,
      totalFen: amountFen,
      description: description.slice(0, 127),
      attach: cart.id,
    })

    const paymentService = req.scope.resolve(Modules.PAYMENT) as any
    await paymentService.updatePaymentSession({
      id: session.id,
      currency_code: session.currency_code,
      amount: session.amount as any,
      data: { ...sessionData, code_url: order.code_url, trade_state: "NOTPAY" },
    })

    return res.json({
      code_url: order.code_url,
      out_trade_no: outTradeNo,
      amount_fen: amountFen,
    })
  } catch (err: any) {
    return res.status(500).json({ message: err.message })
  }
}
