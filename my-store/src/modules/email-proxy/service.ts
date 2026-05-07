import nodemailer from "nodemailer"
import { SmtpConfig } from "./types"

class EmailProxyService {
  async sendMail(config: SmtpConfig, to: string, subject: string, html: string): Promise<void> {
    if (!config || !config.host || !config.user || !config.pass) {
      console.warn("[EmailProxy] SMTP 配置不完整，跳过邮件发送")
      return
    }

    const port = config.port || 465
    // Port 465 → implicit SSL (secure: true)
    // Port 587 / others → STARTTLS (secure: false + requireTLS: true)
    const isSecurePort = port === 465

    const transportOptions: nodemailer.TransportOptions = {
      host: config.host,
      port,
      secure: isSecurePort,
      requireTLS: !isSecurePort,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      // Relax TLS certificate verification & force IPv4 to avoid TLS socket drops on IPv6
      tls: {
        rejectUnauthorized: false,
      },
      // Force IPv4 — IPv6 stack on many VPS/Docker hosts causes TLS handshake failures
      family: 4,
      // Generous timeouts to survive high-latency networks
      connectionTimeout: 30000,
      greetingTimeout: 20000,
      socketTimeout: 45000,
    } as any

    const transporter = nodemailer.createTransport(transportOptions)

    await transporter.sendMail({
      from: `"${config.fromName || "商店通知"}" <${config.user}>`,
      to,
      subject,
      html,
    })
  }

  async testConnection(config: SmtpConfig): Promise<void> {
    if (!config || !config.host || !config.user || !config.pass) {
      throw new Error("SMTP 配置不完整，请先填写所有必填参数")
    }

    await this.sendMail(
      config,
      config.user,
      "邮件代理测试",
      `<p>您好！这是来自商店的测试邮件，发送时间：${new Date().toLocaleString("zh-CN")}</p><p>如果您收到此邮件，说明 SMTP 配置正确。</p>`
    )
  }
}

export default EmailProxyService

