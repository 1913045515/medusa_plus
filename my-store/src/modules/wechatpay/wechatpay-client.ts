import {
  createSign,
  createVerify,
  createDecipheriv,
  randomBytes,
} from "node:crypto"
import type { WechatPayConfig } from "./config"

/**
 * 微信支付 APIv3 客户端
 * 严格按官方文档实现：
 *   https://pay.weixin.qq.com/wiki/doc/apiv3/wechatpay/wechatpay4_0.shtml
 *
 * 签名算法：SHA256-WITH-RSA (商户私钥)
 * 验签算法：SHA256-WITH-RSA (微信支付平台公钥 / 平台证书)
 * 回调解密：AEAD_AES_256_GCM (APIv3 密钥)
 */

export interface NativeOrderResponse {
  code_url: string
}

export interface JsapiOrderResponse {
  prepay_id: string
}

export interface QueryOrderResponse {
  appid: string
  mchid: string
  out_trade_no: string
  transaction_id?: string
  trade_type?: string
  // SUCCESS / REFUND / NOTPAY / CLOSED / REVOKED / USERPAYING / PAYERROR
  trade_state:
    | "SUCCESS"
    | "REFUND"
    | "NOTPAY"
    | "CLOSED"
    | "REVOKED"
    | "USERPAYING"
    | "PAYERROR"
  trade_state_desc?: string
  bank_type?: string
  success_time?: string
  amount?: { total: number; payer_total?: number; currency: string }
}

export interface NotifyResource {
  algorithm: string // AEAD_AES_256_GCM
  ciphertext: string // base64
  associated_data?: string
  nonce: string
  original_type?: string
}

export interface NotifyEnvelope {
  id: string
  create_time: string
  event_type: string // TRANSACTION.SUCCESS / REFUND.SUCCESS ...
  resource_type: string
  summary: string
  resource: NotifyResource
}

export interface DecryptedTransaction {
  appid: string
  mchid: string
  out_trade_no: string
  transaction_id: string
  trade_type: string
  trade_state: QueryOrderResponse["trade_state"]
  trade_state_desc: string
  bank_type?: string
  attach?: string
  success_time?: string
  payer?: { openid: string }
  amount: { total: number; payer_total: number; currency: string; payer_currency: string }
}

export class WechatPayClient {
  constructor(private readonly cfg: WechatPayConfig) {}

  // ──────────────────── 签名 ────────────────────

  /** 生成 Authorization 头部 */
  private buildAuthorization(
    method: string,
    urlPath: string,
    body: string
  ): string {
    const nonceStr = randomBytes(16).toString("hex")
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const message = `${method}\n${urlPath}\n${timestamp}\n${nonceStr}\n${body}\n`

    const signer = createSign("RSA-SHA256")
    signer.update(message, "utf8")
    const signature = signer.sign(this.cfg.merchantPrivateKey, "base64")

    return (
      `WECHATPAY2-SHA256-RSA2048 ` +
      `mchid="${this.cfg.mchId}",` +
      `nonce_str="${nonceStr}",` +
      `timestamp="${timestamp}",` +
      `serial_no="${this.cfg.merchantCertSerialNo}",` +
      `signature="${signature}"`
    )
  }

  /** 验证微信支付应答 / 回调签名 */
  verifySignature(
    timestamp: string,
    nonce: string,
    body: string,
    signature: string,
    serial: string
  ): boolean {
    // 当响应/回调 Wechatpay-Serial 与已配置的微信支付公钥 ID 匹配时，使用该公钥验签
    if (serial && this.cfg.publicKeyId && serial !== this.cfg.publicKeyId) {
      // 序列号不匹配，可能微信使用了平台证书模式或公钥已轮换
      // 当前实现只支持公钥模式，记录但不放行
      return false
    }
    const message = `${timestamp}\n${nonce}\n${body}\n`
    const verifier = createVerify("RSA-SHA256")
    verifier.update(message, "utf8")
    return verifier.verify(this.cfg.publicKey, signature, "base64")
  }

  // ──────────────────── HTTP ────────────────────

  private async request<T>(
    method: "GET" | "POST",
    urlPath: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const bodyString = body ? JSON.stringify(body) : ""
    const authorization = this.buildAuthorization(method, urlPath, bodyString)
    const url = `${this.cfg.apiBaseUrl}${urlPath}`

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: authorization,
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "medusa-wechatpay-v3/1.0",
        // 声明本次请求希望以「微信支付公钥」模式接收应答（让 Wechatpay-Serial 返回公钥 ID）
        "Wechatpay-Serial": this.cfg.publicKeyId,
      },
      body: method === "POST" ? bodyString : undefined,
    })

    const text = await res.text()
    if (!res.ok) {
      let detail = text
      try {
        const j = JSON.parse(text) as { code?: string; message?: string }
        detail = `[${j.code ?? res.status}] ${j.message ?? text}`
      } catch {
        /* ignore */
      }
      throw new Error(`[WechatPay] ${method} ${urlPath} 失败 (${res.status}): ${detail}`)
    }

    if (!text) return {} as T

    // 校验响应签名（生产环境建议开启）
    const sigTs = res.headers.get("Wechatpay-Timestamp") ?? ""
    const sigNonce = res.headers.get("Wechatpay-Nonce") ?? ""
    const sigVal = res.headers.get("Wechatpay-Signature") ?? ""
    const sigSerial = res.headers.get("Wechatpay-Serial") ?? ""
    if (sigTs && sigNonce && sigVal) {
      const ok = this.verifySignature(sigTs, sigNonce, text, sigVal, sigSerial)
      if (!ok) {
        throw new Error(
          `[WechatPay] 响应签名验证失败 (path=${urlPath}, serial=${sigSerial})`
        )
      }
    }

    return JSON.parse(text) as T
  }

  // ──────────────────── 业务接口 ────────────────────

  /** Native 扫码支付下单：返回 code_url */
  async createNativeOrder(params: {
    outTradeNo: string
    description: string
    totalFen: number
    attach?: string
  }): Promise<NativeOrderResponse> {
    return this.request<NativeOrderResponse>("POST", "/v3/pay/transactions/native", {
      appid: this.cfg.appId,
      mchid: this.cfg.mchId,
      description: params.description,
      out_trade_no: params.outTradeNo,
      notify_url: this.cfg.notifyUrl,
      attach: params.attach,
      amount: { total: params.totalFen, currency: this.cfg.currency },
    })
  }

  /** 按商户订单号查询订单 */
  async queryByOutTradeNo(outTradeNo: string): Promise<QueryOrderResponse> {
    const path = `/v3/pay/transactions/out-trade-no/${encodeURIComponent(
      outTradeNo
    )}?mchid=${encodeURIComponent(this.cfg.mchId)}`
    return this.request<QueryOrderResponse>("GET", path)
  }

  /** 关闭订单 */
  async closeOrder(outTradeNo: string): Promise<void> {
    const path = `/v3/pay/transactions/out-trade-no/${encodeURIComponent(
      outTradeNo
    )}/close`
    await this.request<unknown>("POST", path, { mchid: this.cfg.mchId })
  }

  /** 申请退款 */
  async refund(params: {
    outTradeNo: string
    outRefundNo: string
    refundFen: number
    totalFen: number
    reason?: string
  }): Promise<{ refund_id: string; status: string }> {
    return this.request<{ refund_id: string; status: string }>(
      "POST",
      "/v3/refund/domestic/refunds",
      {
        out_trade_no: params.outTradeNo,
        out_refund_no: params.outRefundNo,
        reason: params.reason,
        notify_url: this.cfg.notifyUrl,
        amount: {
          refund: params.refundFen,
          total: params.totalFen,
          currency: this.cfg.currency,
        },
      }
    )
  }

  // ──────────────────── 回调解密 ────────────────────

  /**
   * 解密微信支付回调的 resource 字段。
   * 采用 AEAD_AES_256_GCM，APIv3 密钥作为 key。
   */
  decryptResource(resource: NotifyResource): DecryptedTransaction {
    if (resource.algorithm !== "AEAD_AES_256_GCM") {
      throw new Error(
        `[WechatPay] 不支持的回调加密算法: ${resource.algorithm}`
      )
    }
    const key = Buffer.from(this.cfg.apiV3Key, "utf8")
    if (key.length !== 32) {
      throw new Error("[WechatPay] APIv3 密钥长度必须为 32 字节")
    }

    const cipherBuf = Buffer.from(resource.ciphertext, "base64")
    // 后 16 字节为 authTag
    const authTag = cipherBuf.subarray(cipherBuf.length - 16)
    const data = cipherBuf.subarray(0, cipherBuf.length - 16)
    const iv = Buffer.from(resource.nonce, "utf8")

    const decipher = createDecipheriv("aes-256-gcm", key, iv)
    decipher.setAuthTag(authTag)
    if (resource.associated_data) {
      decipher.setAAD(Buffer.from(resource.associated_data, "utf8"))
    }
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()])
    return JSON.parse(decrypted.toString("utf8")) as DecryptedTransaction
  }
}
