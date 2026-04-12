import crypto from "crypto"
import { OtpEntry } from "./types"

const OTP_TTL_MS = 10 * 60 * 1000          // 10 分钟
const COOLDOWN_MS = 60 * 1000               // 60 秒重发冷却
const MAX_ATTEMPTS = 5                       // 最多验证 5 次
const VERIFIED_TOKEN_TTL_MS = 5 * 60 * 1000 // verifiedToken 有效 5 分钟

class EmailOtpService {
  /** email → OtpEntry */
  private store = new Map<string, OtpEntry>()

  // ─── 生成 OTP ───────────────────────────────────────────────

  /** 生成并存储 6 位数字 OTP；若还在冷却期则抛出错误 */
  generateOtp(email: string): string {
    const now = Date.now()
    const existing = this.store.get(email)

    if (existing && now - existing.createdAt < COOLDOWN_MS) {
      const waitSeconds = Math.ceil((COOLDOWN_MS - (now - existing.createdAt)) / 1000)
      throw new Error(`COOLDOWN:${waitSeconds}`)
    }

    const otp = String(crypto.randomInt(100000, 999999))
    this.store.set(email, {
      otp,
      attempts: 0,
      createdAt: now,
      expiresAt: now + OTP_TTL_MS,
    })
    return otp
  }

  // ─── 验证 OTP ───────────────────────────────────────────────

  /**
   * 验证 OTP；成功返回已签名的 verifiedToken，失败抛出错误。
   * @param jwtSecret  medusa-config 中的 jwtSecret
   */
  verifyOtp(email: string, otp: string, jwtSecret: string): string {
    const now = Date.now()
    const entry = this.store.get(email)

    if (!entry) throw new Error("OTP_NOT_FOUND")
    if (now > entry.expiresAt) {
      this.store.delete(email)
      throw new Error("OTP_EXPIRED")
    }

    entry.attempts += 1
    if (entry.attempts > MAX_ATTEMPTS) {
      this.store.delete(email)
      throw new Error("OTP_MAX_ATTEMPTS")
    }

    if (entry.otp !== otp.trim()) {
      throw new Error("OTP_INVALID")
    }

    // 验证成功，删除 OTP 条目，返回签名 token
    this.store.delete(email)
    return this.signVerifiedToken(email, jwtSecret)
  }

  // ─── verifiedToken 签名/验证 ────────────────────────────────

  /** 签名格式: base64(email:expiresAt):hmac */
  signVerifiedToken(email: string, secret: string): string {
    const expiresAt = Date.now() + VERIFIED_TOKEN_TTL_MS
    const payload = Buffer.from(`${email}:${expiresAt}`).toString("base64url")
    const hmac = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex")
    return `${payload}.${hmac}`
  }

  /**
   * 验证 verifiedToken；有效则返回 email，否则抛出错误
   */
  validateVerifiedToken(token: string, secret: string): string {
    const [payload, hmac] = token.split(".")
    if (!payload || !hmac) throw new Error("VERIFIED_TOKEN_INVALID")

    const expected = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex")

    // 恒定时间比较，防 timing attack
    if (!crypto.timingSafeEqual(Buffer.from(hmac, "hex"), Buffer.from(expected, "hex"))) {
      throw new Error("VERIFIED_TOKEN_INVALID")
    }

    const decoded = Buffer.from(payload, "base64url").toString()
    const colonIdx = decoded.lastIndexOf(":")
    const email = decoded.slice(0, colonIdx)
    const expiresAt = Number(decoded.slice(colonIdx + 1))

    if (Date.now() > expiresAt) throw new Error("VERIFIED_TOKEN_EXPIRED")

    return email
  }

  // ─── 清理过期 OTP（可选，防内存泄漏）─────────────────────────

  purgeExpired(): void {
    const now = Date.now()
    for (const [email, entry] of this.store.entries()) {
      if (now > entry.expiresAt) this.store.delete(email)
    }
  }
}

export default EmailOtpService
