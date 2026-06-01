/**
 * 微信支付 APIv3 集成入口。
 *
 * 本目录只导出 PaymentProvider，配合 medusa-config.ts 中
 * @medusajs/payment 模块的 providers 数组注册。
 *
 * 不创建独立的 Medusa 模块/数据表 —— 微信支付的所有运行时数据
 * 都保存在 Medusa 标准 payment_session.data 字段里，
 * 静态配置完全由环境变量驱动 (./config.ts)。
 */
export { WechatPayPaymentProvider } from "./wechatpay-payment-provider"
export { WechatPayClient } from "./wechatpay-client"
export { loadWechatPayConfig, getWechatPayConfig } from "./config"
