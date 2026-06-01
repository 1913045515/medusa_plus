import { readFileSync } from "node:fs"

/**
 * 微信支付 APIv3 配置
 *
 * 所有配置项从环境变量读取，禁止写死在代码中。
 *
 * 必填项：
 *   WECHATPAY_APP_ID                       公众号 / 小程序 / 应用 APPID
 *   WECHATPAY_MCH_ID                       商户号
 *   WECHATPAY_API_V3_KEY                   APIv3 密钥 (32 字符) - 用于回调 AES-GCM 解密
 *   WECHATPAY_NOTIFY_URL                   支付结果回调 URL
 *   WECHATPAY_MERCHANT_PRIVATE_KEY         apiclient_key.pem 私钥内容 (PEM)
 *     或 WECHATPAY_MERCHANT_PRIVATE_KEY_PATH 私钥文件路径 (任选其一)
 *   WECHATPAY_MERCHANT_CERT_SERIAL_NO      apiclient_cert.pem 证书序列号 (大写十六进制)
 *
 * 平台验签 (APIv3 新版微信支付公钥，2024+ 商户优先使用)：
 *   WECHATPAY_PUBLIC_KEY_ID                微信支付公钥 ID，形如 PUB_KEY_ID_xxxx
 *   WECHATPAY_PUBLIC_KEY                   微信支付公钥 PEM 内容
 *     或 WECHATPAY_PUBLIC_KEY_PATH         微信支付公钥文件路径
 *
 * 可选：
 *   WECHATPAY_API_BASE_URL                 默认 https://api.mch.weixin.qq.com
 *   WECHATPAY_PAY_TYPE                     native (默认) | jsapi | h5 | app
 *   WECHATPAY_CURRENCY                     默认 CNY
 */
export interface WechatPayConfig {
  appId: string
  mchId: string
  apiV3Key: string
  notifyUrl: string
  merchantPrivateKey: string
  merchantCertSerialNo: string
  publicKeyId: string
  publicKey: string
  apiBaseUrl: string
  payType: "native" | "jsapi" | "h5" | "app"
  currency: string
}

function readEnvOrFile(envValue: string | undefined, envPath: string | undefined): string {
  if (envValue && envValue.trim().length > 0) {
    // Support escaped \n in env vars
    return envValue.includes("\\n") ? envValue.replace(/\\n/g, "\n") : envValue
  }
  if (envPath && envPath.trim().length > 0) {
    return readFileSync(envPath.trim(), "utf8")
  }
  return ""
}

export function loadWechatPayConfig(): WechatPayConfig {
  const cfg: WechatPayConfig = {
    appId: process.env.WECHATPAY_APP_ID ?? "",
    mchId: process.env.WECHATPAY_MCH_ID ?? "",
    apiV3Key: process.env.WECHATPAY_API_V3_KEY ?? "",
    notifyUrl: process.env.WECHATPAY_NOTIFY_URL ?? "",
    merchantPrivateKey: readEnvOrFile(
      process.env.WECHATPAY_MERCHANT_PRIVATE_KEY,
      process.env.WECHATPAY_MERCHANT_PRIVATE_KEY_PATH
    ),
    merchantCertSerialNo: process.env.WECHATPAY_MERCHANT_CERT_SERIAL_NO ?? "",
    publicKeyId: process.env.WECHATPAY_PUBLIC_KEY_ID ?? "",
    publicKey: readEnvOrFile(
      process.env.WECHATPAY_PUBLIC_KEY,
      process.env.WECHATPAY_PUBLIC_KEY_PATH
    ),
    apiBaseUrl:
      (process.env.WECHATPAY_API_BASE_URL ?? "https://api.mch.weixin.qq.com").replace(/\/$/, ""),
    payType: (process.env.WECHATPAY_PAY_TYPE as WechatPayConfig["payType"]) || "native",
    currency: process.env.WECHATPAY_CURRENCY || "CNY",
  }
  return cfg
}

export function assertWechatPayConfig(cfg: WechatPayConfig): void {
  const missing: string[] = []
  if (!cfg.appId) missing.push("WECHATPAY_APP_ID")
  if (!cfg.mchId) missing.push("WECHATPAY_MCH_ID")
  if (!cfg.apiV3Key) missing.push("WECHATPAY_API_V3_KEY")
  if (!cfg.notifyUrl) missing.push("WECHATPAY_NOTIFY_URL")
  if (!cfg.merchantPrivateKey)
    missing.push("WECHATPAY_MERCHANT_PRIVATE_KEY (或 _PATH)")
  if (!cfg.merchantCertSerialNo) missing.push("WECHATPAY_MERCHANT_CERT_SERIAL_NO")
  if (!cfg.publicKeyId) missing.push("WECHATPAY_PUBLIC_KEY_ID")
  if (!cfg.publicKey) missing.push("WECHATPAY_PUBLIC_KEY (或 _PATH)")

  if (cfg.apiV3Key && cfg.apiV3Key.length !== 32) {
    missing.push("WECHATPAY_API_V3_KEY 长度必须为 32 字符")
  }

  if (missing.length > 0) {
    throw new Error(
      `[WechatPay] 缺少必要配置: ${missing.join(", ")}。` +
        `请在环境变量中配置（参见 src/modules/wechatpay/config.ts 顶部注释）。`
    )
  }
}

let cached: WechatPayConfig | null = null
export function getWechatPayConfig(): WechatPayConfig {
  if (!cached) {
    cached = loadWechatPayConfig()
  }
  return cached
}
