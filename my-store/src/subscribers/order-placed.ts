import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import crypto from "crypto"
import { EMAIL_PROXY_MODULE } from "../modules/email-proxy"
import EmailProxyService from "../modules/email-proxy/service"
import { SmtpConfig } from "../modules/email-proxy/types"
import {
  DEFAULT_EMAIL_TEMPLATES,
  EmailTemplatesConfig,
} from "../modules/store-settings/email-template-defaults"
import { STORE_SETTINGS_MODULE } from "../modules/store-settings"
import StoreSettingsModuleService from "../modules/store-settings/service"

// ─── 工具函数 ────────────────────────────────────────────────

function generateRandomPassword(): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lower = "abcdefghijklmnopqrstuvwxyz"
  const digits = "0123456789"
  const all = upper + lower + digits
  const bytes = crypto.randomBytes(12)
  let password =
    upper[bytes[0] % upper.length] +
    lower[bytes[1] % lower.length] +
    digits[bytes[2] % digits.length]
  for (let i = 3; i < 10; i++) {
    password += all[bytes[i] % all.length]
  }
  return password
    .split("")
    .sort(() => crypto.randomBytes(1)[0] - 128)
    .join("")
}

function renderTemplate(html: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (result, [key, val]) => result.split(`{{${key}}}`).join(val),
    html
  )
}

function formatAmount(amount: number | null | undefined): string {
  if (amount == null) return "0.00"
  return (amount / 100).toFixed(2)
}

function buildOrderItemsHtml(items: any[]): string {
  if (!items || items.length === 0) return "<p>（无商品信息）</p>"
  const rows = items
    .map(
      (item) => `
    <tr>
      <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6">${item.title ?? item.product_title ?? "商品"}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6;text-align:center">${item.quantity ?? 1}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6;text-align:right">${formatAmount(item.unit_price)}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6;text-align:right">${formatAmount(item.subtotal ?? (item.unit_price ?? 0) * (item.quantity ?? 1))}</td>
    </tr>`
    )
    .join("")

  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:20px 0">
    <thead>
      <tr style="background:#f3f4f6">
        <th style="text-align:left;padding:8px 10px;font-size:13px;color:#6b7280">商品 / Item</th>
        <th style="text-align:center;padding:8px 10px;font-size:13px;color:#6b7280">数量 / Qty</th>
        <th style="text-align:right;padding:8px 10px;font-size:13px;color:#6b7280">单价 / Price</th>
        <th style="text-align:right;padding:8px 10px;font-size:13px;color:#6b7280">小计 / Total</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`
}

function buildPasswordSection(password: string, storeUrl: string): string {
  return `
  <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:6px;padding:16px;margin:20px 0">
    <p style="margin:0 0 8px;font-weight:bold">🔐 您的账号已自动创建 / Your account has been created:</p>
    <p style="margin:4px 0">🔑 临时密码 / Temporary Password:
      <span style="font-size:20px;letter-spacing:2px;font-weight:bold;color:#4f46e5"> ${password}</span>
    </p>
    <p style="margin:8px 0 0;font-size:13px;color:#92400e">
      请登录后尽快修改密码 / Please change your password after logging in.<br>
      <a href="${storeUrl}/account" style="color:#4f46e5">立即登录 / Login Now</a>
    </p>
  </div>`
}

function getSmtpConfig(setting: any): SmtpConfig | null {
  if (!setting?.email_proxy_config) return null
  try {
    const config: SmtpConfig = JSON.parse(setting.email_proxy_config)
    if (process.env.QQ_SMTP_PASS) config.pass = process.env.QQ_SMTP_PASS
    return config
  } catch {
    return null
  }
}

function getEmailTemplates(setting: any): EmailTemplatesConfig {
  if ((setting as any)?.email_templates_config) {
    try {
      const stored = JSON.parse((setting as any).email_templates_config)
      const merged: EmailTemplatesConfig = {
        guest_register: { ...DEFAULT_EMAIL_TEMPLATES.guest_register },
        order_placed: { ...DEFAULT_EMAIL_TEMPLATES.order_placed },
      }

      // guest_register 模板必须包含 {{email}} 和 {{password}}，否则使用默认模板
      if (stored.guest_register?.html && stored.guest_register?.subject) {
        const html = stored.guest_register.html as string
        if (html.includes("{{email}}") && html.includes("{{password}}")) {
          merged.guest_register = stored.guest_register
        } else {
          console.warn(
            "[EmailTemplates] guest_register 模板缺少 {{email}} 或 {{password}} 变量，已回退到默认模板"
          )
        }
      }

      // order_placed 模板直接使用存储版本（password_section 是动态注入的 HTML 片段）
      if (stored.order_placed?.html && stored.order_placed?.subject) {
        merged.order_placed = stored.order_placed
      }

      return merged
    } catch {
      // fall through
    }
  }
  return DEFAULT_EMAIL_TEMPLATES
}

// ─── Subscriber ──────────────────────────────────────────────

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data.id

  try {
    // 1. 获取存储设置（SMTP + 模板）
    const settingsService =
      container.resolve<StoreSettingsModuleService>(STORE_SETTINGS_MODULE)
    const settings = await settingsService.listStoreSettings()
    const setting = settings[0] ?? null

    const smtpConfig = getSmtpConfig(setting)
    if (!smtpConfig) {
      console.warn("[OrderPlaced] SMTP 未配置，跳过邮件发送")
      return
    }

    const templates = getEmailTemplates(setting)
    const storeUrl =
      process.env.NEXT_PUBLIC_BASE_URL || process.env.STORE_URL || ""
    const emailService =
      container.resolve<EmailProxyService>(EMAIL_PROXY_MODULE)

    // 2. 获取订单详情（含商品）
    const orderService = container.resolve(Modules.ORDER)
    const order = await orderService.retrieveOrder(orderId, {
      relations: ["items"],
    })

    const email = order.email
    if (!email) {
      console.warn("[OrderPlaced] 订单无邮箱，跳过邮件发送")
      return
    }

    // 3. 检查是否需要创建游客账号
    // 判断依据：是否已有 emailpass 登录身份（auth identity）
    // 仅检查 customer 记录不够：Medusa 在下单流程中可能已自动关联 customer，
    // 但该 customer 并没有登录密码，仍属于需要初始化账号的新用户。
    let password: string | null = null
    let isNewAccount = false

    const authModuleService = container.resolve(Modules.AUTH)
    const existingIdentities = await authModuleService.listAuthIdentities({
      provider_identities: { provider: "emailpass", entity_id: email },
    })

    if (existingIdentities.length === 0) {
      // 没有 emailpass 登录身份 → 生成随机密码、确保 customer 存在、创建 auth identity
      password = generateRandomPassword()

      const customerModuleService = container.resolve(Modules.CUSTOMER)
      const existingCustomers = await customerModuleService.listCustomers({ email })

      let customerId: string
      if (existingCustomers.length === 0) {
        const customer = await customerModuleService.createCustomers({ email })
        customerId = customer.id
      } else {
        customerId = existingCustomers[0].id
      }

      await authModuleService.createAuthIdentities({
        provider_identities: [
          {
            provider: "emailpass",
            entity_id: email,
            provider_metadata: { password },
          },
        ],
        app_metadata: { customer_id: customerId },
      })

      isNewAccount = true
      console.log(`[OrderPlaced] 游客账号已创建（auth identity）: ${email}`)

      // 4a. 发送注册成功邮件
      try {
        const regHtml = renderTemplate(templates.guest_register.html, {
          email,
          password,
          store_url: storeUrl,
        })
        const regSubject = renderTemplate(templates.guest_register.subject, {
          email,
          password,
          store_url: storeUrl,
        })
        await emailService.sendMail(smtpConfig, email, regSubject, regHtml)
        console.log(`[OrderPlaced] 注册成功邮件已发送至: ${email}`)
      } catch (e) {
        console.error("[OrderPlaced] 注册邮件发送失败:", e)
      }
    } else {
      console.log(`[OrderPlaced] 邮箱 ${email} 已有登录身份，跳过账号创建`)
    }

    // 5. 构建订单商品 HTML
    const orderItemsHtml = buildOrderItemsHtml(order.items ?? [])
    const rawTotal = order.total ?? order.item_total
    const orderTotal = formatAmount(typeof rawTotal === "string" ? parseFloat(rawTotal) : (rawTotal as number | null | undefined))
    const currency = (order.currency_code ?? "").toUpperCase()
    const orderIdDisplay = order.display_id
      ? String(order.display_id)
      : order.id.substring(0, 8)

    const passwordSection =
      isNewAccount && password
        ? buildPasswordSection(password, storeUrl)
        : ""

    // 6. 发送订单确认邮件（始终发送）
    try {
      const orderSubject = renderTemplate(templates.order_placed.subject, {
        order_id: orderIdDisplay,
        email,
        order_total: orderTotal,
        currency,
        store_url: storeUrl,
        order_items_html: "",
        password_section: "",
      })
      const orderHtml = renderTemplate(templates.order_placed.html, {
        order_id: orderIdDisplay,
        email,
        order_items_html: orderItemsHtml,
        order_total: orderTotal,
        currency,
        store_url: storeUrl,
        password_section: passwordSection,
      })
      await emailService.sendMail(smtpConfig, email, orderSubject, orderHtml)
      console.log(`[OrderPlaced] 订单确认邮件已发送至: ${email}`)
    } catch (e) {
      console.error("[OrderPlaced] 订单确认邮件发送失败:", e)
    }
  } catch (err) {
    console.error("[OrderPlaced] 处理失败（不影响订单）:", err)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
