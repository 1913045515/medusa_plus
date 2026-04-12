import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { EMAIL_OTP_MODULE } from "../../../../../modules/email-otp"
import EmailOtpService from "../../../../../modules/email-otp/service"

const ERROR_MESSAGES: Record<string, { zh: string; en: string }> = {
  OTP_NOT_FOUND:     { zh: "验证码不存在，请重新发送", en: "OTP not found, please resend" },
  OTP_EXPIRED:       { zh: "验证码已过期，请重新发送", en: "OTP expired, please resend" },
  OTP_MAX_ATTEMPTS:  { zh: "验证次数超限，请重新发送", en: "Too many attempts, please resend" },
  OTP_INVALID:       { zh: "验证码错误，请重新输入",   en: "Invalid OTP, please try again" },
}

// POST /store/auth/email-otp/verify
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { email, otp } = req.body as { email?: string; otp?: string }

  if (!email || !otp) {
    return res.status(400).json({ message: "email 和 otp 不能为空 / email and otp are required" })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const jwtSecret = process.env.JWT_SECRET || "supersecret"

  const otpService = req.scope.resolve<EmailOtpService>(EMAIL_OTP_MODULE)

  try {
    const verifiedToken = otpService.verifyOtp(normalizedEmail, otp, jwtSecret)
    return res.json({ success: true, verified_token: verifiedToken })
  } catch (err: any) {
    const msg = ERROR_MESSAGES[err.message]
    if (msg) {
      return res.status(422).json({
        message: `${msg.zh} / ${msg.en}`,
        code: err.message,
      })
    }
    throw err
  }
}
