import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { loadWechatPayConfig, assertWechatPayConfig } from "../../../../modules/wechatpay/config"
import {
  WechatPayClient,
  type NotifyEnvelope,
} from "../../../../modules/wechatpay/wechatpay-client"

const WECHAT_PROVIDER_IDS = ["pp_wechat_wechat", "wechat"]

/**
 * POST /store/wechat-pay/notify
 *
 * 微信支付回调（APIv3）。
 * 必须使用「原始字符串 body」校验签名（不能用解析对象重新序列化）。
 *
 * 响应：
 *   成功 200 { code: "SUCCESS", message: "成功" }
 *   失败 4xx/5xx { code: "FAIL", message: "失败原因" }
 *
 * 回调要求幂等：多次接收同一通知需返回相同结果。
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  let cfg
  try {
    cfg = loadWechatPayConfig()
    assertWechatPayConfig(cfg)
  } catch (err: any) {
    logger.error(`[WechatPay] 回调配置缺失: ${err.message}`)
    return res.status(500).json({ code: "FAIL", message: "配置缺失" })
  }

  const timestamp = (req.headers["wechatpay-timestamp"] as string) || ""
  const nonce = (req.headers["wechatpay-nonce"] as string) || ""
  const signature = (req.headers["wechatpay-signature"] as string) || ""
  const serial = (req.headers["wechatpay-serial"] as string) || ""

  // 原始 body：Medusa 默认在 json 中间件中存为 req.rawBody
  const rawBody =
    (req as any).rawBody?.toString?.("utf8") ??
    (typeof (req as any).rawBody === "string" ? (req as any).rawBody : "") ??
    (req.body ? JSON.stringify(req.body) : "")

  if (!timestamp || !nonce || !signature || !rawBody) {
    return res.status(400).json({ code: "FAIL", message: "缺少签名信息" })
  }

  const client = new WechatPayClient(cfg)

  if (!client.verifySignature(timestamp, nonce, rawBody, signature, serial)) {
    logger.warn(`[WechatPay] 回调签名验证失败 (serial=${serial})`)
    return res.status(401).json({ code: "FAIL", message: "签名验证失败" })
  }

  let envelope: NotifyEnvelope
  try {
    envelope = JSON.parse(rawBody) as NotifyEnvelope
  } catch {
    return res.status(400).json({ code: "FAIL", message: "无效 JSON" })
  }

  let tx
  try {
    tx = client.decryptResource(envelope.resource)
  } catch (err: any) {
    logger.error(`[WechatPay] 回调解密失败: ${err.message}`)
    return res.status(400).json({ code: "FAIL", message: "解密失败" })
  }

  logger.info(
    `[WechatPay] 收到回调 event=${envelope.event_type} out_trade_no=${tx.out_trade_no} state=${tx.trade_state}`
  )

  if (envelope.event_type !== "TRANSACTION.SUCCESS" || tx.trade_state !== "SUCCESS") {
    return res.json({ code: "SUCCESS", message: "OK" })
  }

  try {
    const cartId = tx.attach
    if (cartId) {
      const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as any
      const paymentService = req.scope.resolve(Modules.PAYMENT) as any
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
      const session = cart?.payment_collection?.payment_sessions?.find(
        (s: any) =>
          WECHAT_PROVIDER_IDS.includes(s.provider_id) &&
          (s.data as any)?.out_trade_no === tx.out_trade_no
      )
      if (session) {
        const data = { ...(session.data as Record<string, any>) }
        await paymentService.updatePaymentSession({
          id: session.id,
          currency_code: session.currency_code,
          amount: session.amount as any,
          data: {
            ...data,
            trade_state: "SUCCESS",
            transaction_id: tx.transaction_id,
            paid_at: tx.success_time,
          },
        })
      }
    }
  } catch (err: any) {
    logger.error(`[WechatPay] 更新 payment session 失败: ${err.message}`)
  }

  return res.json({ code: "SUCCESS", message: "OK" })
}
