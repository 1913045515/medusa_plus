import {
  AbstractPaymentProvider,
  PaymentSessionStatus,
  MedusaError,
} from "@medusajs/framework/utils"
import type {
  InitiatePaymentInput,
  InitiatePaymentOutput,
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  ProviderWebhookPayload,
  WebhookActionResult,
} from "@medusajs/types"
import type { Logger } from "@medusajs/framework/types"
import { randomBytes } from "node:crypto"
import { assertWechatPayConfig, loadWechatPayConfig } from "./config"
import { WechatPayClient } from "./wechatpay-client"

type InjectedDependencies = {
  logger: Logger
  [key: string]: unknown
}

interface WechatPaySessionData extends Record<string, unknown> {
  out_trade_no?: string
  code_url?: string
  prepay_id?: string
  amount_fen?: number
  currency?: string
  description?: string
  trade_state?: string
  transaction_id?: string
  error?: string
}

/**
 * 微信支付 Medusa 支付提供方（APIv3 / Native 扫码）。
 *
 * 配置通过环境变量加载，详见 ./config.ts
 *
 * 流程：
 *   1. initiatePayment：生成商户订单号 out_trade_no（不调用微信接口，避免 cart 阶段重复下单）
 *   2. 前端调用 /store/wechat-pay/qrcode 取得 code_url 并展示二维码
 *   3. 用户扫码支付 → 微信回调 /weixin-pay → 我方校验签名 + 解密 → 标记 captured
 *   4. authorizePayment：前端轮询订单状态成功后由前端触发 placeOrder()
 */
export class WechatPayPaymentProvider extends AbstractPaymentProvider<Record<string, unknown>> {
  static identifier = "wechat"

  private logger: Logger
  private client: WechatPayClient | null = null

  constructor(container: InjectedDependencies, config: Record<string, unknown> = {}) {
    super(container as any, config)
    this.logger = container.logger as Logger
  }

  private getClient(): WechatPayClient {
    if (!this.client) {
      const cfg = loadWechatPayConfig()
      assertWechatPayConfig(cfg)
      this.client = new WechatPayClient(cfg)
    }
    return this.client
  }

  private getSessionData(input: { data?: Record<string, unknown> }): WechatPaySessionData {
    return (input.data || {}) as WechatPaySessionData
  }

  /**
   * 微信支付 total 是「分」整数。Medusa 输入金额需转换。
   * 这里假定 amount 已经是货币基本单位（CNY 元，浮点）—— 如 9.90，需 *100。
   * 若你的店铺以 BigNumber 形式传入元，则直接 *100；以分传入则不需要。
   */
  private toFen(amount: unknown): number {
    const n = Number(amount)
    if (!Number.isFinite(n) || n <= 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `[WechatPay] 无效金额: ${amount}`
      )
    }
    return Math.round(n * 100)
  }

  private genOutTradeNo(): string {
    // 商户订单号：6-32 位字母数字，建议带商户业务前缀
    const ts = Date.now().toString()
    const rand = randomBytes(6).toString("hex")
    return `MS${ts}${rand}`.slice(0, 32)
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    try {
      // 校验配置但不立即下单（避免支付方法切换、金额变化重复下单）
      assertWechatPayConfig(loadWechatPayConfig())
      const outTradeNo = this.genOutTradeNo()
      const amountFen = this.toFen(input.amount)
      return {
        id: outTradeNo,
        data: {
          out_trade_no: outTradeNo,
          amount_fen: amountFen,
          currency: (input.currency_code || "CNY").toUpperCase(),
          trade_state: "NOTPAY",
        } satisfies WechatPaySessionData,
        status: PaymentSessionStatus.PENDING,
      }
    } catch (err: any) {
      this.logger.error("[WechatPay] initiatePayment failed:", err.message)
      return {
        id: `wechat_error_${Date.now()}`,
        data: { error: err.message },
        status: PaymentSessionStatus.ERROR,
      }
    }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    const session = this.getSessionData(input)
    // 金额变化时刷新 amount_fen
    try {
      const newFen = this.toFen(input.amount)
      return {
        data: { ...session, amount_fen: newFen, currency: (input.currency_code || session.currency || "CNY").toUpperCase() },
        status: PaymentSessionStatus.PENDING,
      }
    } catch {
      return { data: input.data, status: PaymentSessionStatus.PENDING }
    }
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const session = this.getSessionData(input)
    if (!session.out_trade_no) {
      return {
        data: { ...session, error: "Missing out_trade_no" },
        status: PaymentSessionStatus.ERROR,
      }
    }
    try {
      const client = this.getClient()
      const order = await client.queryByOutTradeNo(session.out_trade_no)
      const merged: WechatPaySessionData = {
        ...session,
        trade_state: order.trade_state,
        transaction_id: order.transaction_id,
      }
      if (order.trade_state === "SUCCESS") {
        return { data: merged, status: PaymentSessionStatus.AUTHORIZED }
      }
      if (order.trade_state === "CLOSED" || order.trade_state === "REVOKED" || order.trade_state === "PAYERROR") {
        return { data: merged, status: PaymentSessionStatus.ERROR }
      }
      return { data: merged, status: PaymentSessionStatus.PENDING }
    } catch (err: any) {
      this.logger.error("[WechatPay] authorizePayment query failed:", err.message)
      return { data: { ...session, error: err.message }, status: PaymentSessionStatus.ERROR }
    }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    // 微信支付 Native / JSAPI 默认即时扣款；这里再次确认订单状态
    const session = this.getSessionData(input)
    if (!session.out_trade_no) {
      return { data: { ...session, error: "Missing out_trade_no" } }
    }
    try {
      const client = this.getClient()
      const order = await client.queryByOutTradeNo(session.out_trade_no)
      return {
        data: {
          ...session,
          trade_state: order.trade_state,
          transaction_id: order.transaction_id,
        },
      }
    } catch (err: any) {
      this.logger.error("[WechatPay] capturePayment failed:", err.message)
      return { data: { ...session, error: err.message } }
    }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    const session = this.getSessionData(input)
    if (!session.out_trade_no) {
      return { data: { ...session, trade_state: "CLOSED" } }
    }
    try {
      const client = this.getClient()
      await client.closeOrder(session.out_trade_no)
      return { data: { ...session, trade_state: "CLOSED" } }
    } catch (err: any) {
      this.logger.error("[WechatPay] cancelPayment failed:", err.message)
      return { data: { ...session, error: err.message } }
    }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const session = this.getSessionData(input)
    if (!session.out_trade_no || !session.amount_fen) {
      return { data: { ...session, error: "Missing out_trade_no / amount" } }
    }
    try {
      const client = this.getClient()
      const refundFen = this.toFen(input.amount)
      const outRefundNo = `R${session.out_trade_no}_${Date.now().toString().slice(-6)}`.slice(0, 64)
      const r = await client.refund({
        outTradeNo: session.out_trade_no,
        outRefundNo,
        refundFen,
        totalFen: session.amount_fen,
      })
      return {
        data: {
          ...session,
          trade_state: "REFUND",
          refund_id: r.refund_id,
          refund_status: r.status,
        } as Record<string, unknown>,
      }
    } catch (err: any) {
      this.logger.error("[WechatPay] refundPayment failed:", err.message)
      return { data: { ...session, error: err.message } }
    }
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    return { data: input.data }
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const session = this.getSessionData(input)
    const state = session.trade_state
    switch (state) {
      case "SUCCESS":
        return { status: PaymentSessionStatus.CAPTURED }
      case "REFUND":
        return { status: PaymentSessionStatus.CAPTURED }
      case "CLOSED":
      case "REVOKED":
        return { status: PaymentSessionStatus.CANCELED }
      case "PAYERROR":
        return { status: PaymentSessionStatus.ERROR }
      case "NOTPAY":
      case "USERPAYING":
      default:
        if (session.error) return { status: PaymentSessionStatus.ERROR }
        return { status: PaymentSessionStatus.PENDING }
    }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: input.data }
  }

  async getWebhookActionAndData(
    _payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    // 回调由 /store/wechat-pay/notify 路由专门处理（需访问原始 body 校验签名）
    return { action: "not_supported" as any }
  }
}

export const services = [WechatPayPaymentProvider]
