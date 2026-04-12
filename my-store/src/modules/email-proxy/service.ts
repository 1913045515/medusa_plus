import nodemailer from "nodemailer"
import { SmtpConfig } from "./types"

class EmailProxyService {
  async sendMail(config: SmtpConfig, to: string, subject: string, html: string): Promise<void> {
    if (!config || !config.host || !config.user || !config.pass) {
      console.warn("[EmailProxy] SMTP 配置不完整，跳过邮件发送")
      return
    }

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port || 465,
      secure: (config.port || 465) === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    })

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

