import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { loadWechatPayConfig, assertWechatPayConfig } from "../../../../modules/wechatpay/config"
import { WechatPayClient } from "../../../../modules/wechatpay/wechatpay-client"

const WECHAT_PROVIDER_IDS = ["pp_wechat_wechat", "wechat"]

/**
 * GET /store/wechat-pay/query?cart_id=xxx
 * 前端轮询订单支付状态。
 * 出参: { trade_state, transaction_id?, paid: boolean }
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const cartId = (req.query.cart_id as string | undefined) ?? ""
  if (!cartId) {
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
      "payment_collection.payment_sessions.id",
      "payment_collection.payment_sessions.provider_id",
      "payment_collection.payment_sessions.currency_code",
      "payment_collection.payment_sessions.amount",
      "payment_collection.payment_sessions.data",
    ],
    filters: { id: cartId },
  })
  const cart = (r?.data ?? [])[0]
  const session = cart?.payment_collection?.payment_sessions?.find((s: any) =>
    WECHAT_PROVIDER_IDS.includes(s.provider_id)
  )
  if (!session) {
    return res.status(404).json({ message: "未找到微信支付 session" })
  }

  const sessionData = (session.data || {}) as Record<string, any>
  const outTradeNo: string | undefined = sessionData.out_trade_no
  if (!outTradeNo) {
    return res.json({ trade_state: "NOTPAY", paid: false })
  }

  try {
    const client = new WechatPayClient(cfg)
    const order = await client.queryByOutTradeNo(outTradeNo)
    const paid = order.trade_state === "SUCCESS"

    const paymentService = req.scope.resolve(Modules.PAYMENT) as any
    await paymentService.updatePaymentSession({
      id: session.id,
      currency_code: session.currency_code,
      amount: session.amount as any,
      data: {
        ...sessionData,
        trade_state: order.trade_state,
        transaction_id: order.transaction_id,
      },
    })

    return res.json({
      trade_state: order.trade_state,
      transaction_id: order.transaction_id,
      paid,
    })
  } catch (err: any) {
    return res.status(500).json({ message: err.message })
  }
}
