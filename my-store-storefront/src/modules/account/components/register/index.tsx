"use client"

import { useActionState, useState, useEffect, useTransition, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { sendEmailOtp, verifyEmailOtp, registerWithOtp, checkEmailExists } from "@lib/data/customer"
import { getRegisterDict } from "@lib/i18n/register"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

type Step = "email" | "otp" | "profile"

const COOLDOWN_SECONDS = 60

const REGISTER_SUCCESS = "__REGISTER_SUCCESS__"

const Register = ({ setCurrentView }: Props) => {
  const params = useParams()
  const countryCode = (params?.countryCode as string) ?? ""
  const t = getRegisterDict(countryCode)
  const router = useRouter()

  // ── 步骤状态 ──────────────────────────────────────────────────
  const [step, setStep] = useState<Step>("email")
  const [verifiedEmail, setVerifiedEmail] = useState("")
  const [verifiedToken, setVerifiedToken] = useState("")

  // ── Step 1: 邮箱 ──────────────────────────────────────────────
  const [emailInput, setEmailInput] = useState("")
  const [sendError, setSendError] = useState<string | null>(null)
  const [emailAlreadyRegistered, setEmailAlreadyRegistered] = useState(false)
  const [isSending, startSending] = useTransition()
  const [cooldown, setCooldown] = useState(0)
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function startCooldown(seconds: number) {
    setCooldown(seconds)
    if (cooldownRef.current) clearInterval(cooldownRef.current)
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current) }, [])

  function handleSendOtp() {
    if (!emailInput.includes("@")) {
      setSendError(t.emailInvalid)
      return
    }
    setSendError(null)
    setEmailAlreadyRegistered(false)
    startSending(async () => {
      // 先检查邮箱是否已注册
      const checkResult = await checkEmailExists(emailInput.trim().toLowerCase())
      if ("error" in checkResult) {
        setSendError(checkResult.error)
        return
      }
      if (checkResult.exists) {
        setEmailAlreadyRegistered(true)
        return
      }
      const result = await sendEmailOtp(emailInput.trim().toLowerCase())
      if ("error" in result) {
        setSendError(result.error)
        if (result.cooldown_seconds) startCooldown(result.cooldown_seconds)
      } else {
        setVerifiedEmail(emailInput.trim().toLowerCase())
        startCooldown(COOLDOWN_SECONDS)
        setStep("otp")
      }
    })
  }

  // ── Step 2: OTP ───────────────────────────────────────────────
  const [otpInput, setOtpInput] = useState("")
  const [otpError, setOtpError] = useState<string | null>(null)
  const [isVerifying, startVerifying] = useTransition()

  function handleVerifyOtp() {
    if (otpInput.trim().length !== 6) {
      setOtpError(t.otpRequired)
      return
    }
    setOtpError(null)
    startVerifying(async () => {
      const result = await verifyEmailOtp(verifiedEmail, otpInput.trim())
      if ("error" in result) {
        setOtpError(result.error)
      } else {
        setVerifiedToken(result.verified_token)
        setStep("profile")
      }
    })
  }

  function handleResend() {
    if (cooldown > 0) return
    setSendError(null)
    setOtpError(null)
    setOtpInput("")
    startSending(async () => {
      const result = await sendEmailOtp(verifiedEmail)
      if ("error" in result) {
        setOtpError(result.error)
        if (result.cooldown_seconds) startCooldown(result.cooldown_seconds)
      } else {
        startCooldown(COOLDOWN_SECONDS)
      }
    })
  }

  // ── Step 3: 注册 ──────────────────────────────────────────────
  const [registerMessage, formAction] = useActionState(registerWithOtp, null)

  // 注册成功：检测到 SUCCESS 标记，看到成功提示后跳转到 account
  useEffect(() => {
    if (registerMessage === REGISTER_SUCCESS) {
      const timer = setTimeout(() => {
        router.push(`/${countryCode}/account`)
        router.refresh()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [registerMessage, router, countryCode])

  // ─────────────────────────────────────────────────────────────

  return (
    <div className="max-w-sm flex flex-col items-center" data-testid="register-page">
      <h1 className="text-large-semi uppercase mb-6">{t.title}</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-4">{t.subtitle}</p>

      {/* ── Step 1: 邮箱输入 ──────────────────────────────── */}
      {step === "email" && (
        <div className="w-full flex flex-col gap-y-4">
          <Input
            label={t.emailLabel}
            name="email"
            type="email"
            required
            autoComplete="email"
            value={emailInput}
            onChange={(e) => { setEmailInput(e.target.value); setEmailAlreadyRegistered(false); setSendError(null) }}
            data-testid="email-input"
          />
          {sendError && <ErrorMessage error={sendError} data-testid="send-otp-error" />}
          {emailAlreadyRegistered && (
            <p className="text-small-regular text-rose-500" data-testid="email-already-registered-error">
              {t.emailAlreadyRegistered}{" "}
              <button
                type="button"
                onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
                className="underline font-medium"
              >
                {t.signIn}
              </button>
            </p>
          )}
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={isSending || cooldown > 0}
            className="w-full h-10 bg-ui-button-neutral text-ui-button-neutral-foreground rounded-md text-sm font-medium disabled:opacity-50 hover:bg-ui-button-neutral-hover transition-colors"
            data-testid="send-otp-button"
          >
            {isSending
              ? t.sendingOtp
              : cooldown > 0
                ? t.resendIn(cooldown)
                : t.sendOtpButton}
          </button>
        </div>
      )}

      {/* ── Step 2: OTP 验证 ───────────────────────────────── */}
      {step === "otp" && (
        <div className="w-full flex flex-col gap-y-4">
          <p className="text-sm text-ui-fg-subtle text-center">
            {t.otpSubtitle(verifiedEmail)}
          </p>
          <Input
            label={t.otpLabel}
            name="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            required
            autoComplete="one-time-code"
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
            data-testid="otp-input"
          />
          {otpError && <ErrorMessage error={otpError} data-testid="otp-error" />}
          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={isVerifying || otpInput.length !== 6}
            className="w-full h-10 bg-ui-button-neutral text-ui-button-neutral-foreground rounded-md text-sm font-medium disabled:opacity-50 hover:bg-ui-button-neutral-hover transition-colors"
            data-testid="verify-otp-button"
          >
            {isVerifying ? t.verifying : t.verifyButton}
          </button>
          <div className="flex justify-between text-small-regular text-ui-fg-subtle">
            <button
              type="button"
              onClick={() => { setStep("email"); setOtpInput(""); setOtpError(null) }}
              className="underline"
            >
              {t.changeEmail}
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || isSending}
              className="underline disabled:opacity-40"
            >
              {cooldown > 0 ? t.resendIn(cooldown) : t.resendOtp}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: 完整注册表单 ───────────────────────────── */}
      {step === "profile" && registerMessage === REGISTER_SUCCESS && (
        <div className="w-full flex flex-col items-center gap-y-4" data-testid="register-success">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-center text-base-regular text-ui-fg-base">{t.registerSuccess}</p>
          <p className="text-center text-small-regular text-ui-fg-subtle">{t.redirecting}</p>
        </div>
      )}

      {step === "profile" && registerMessage !== REGISTER_SUCCESS && (
        <form className="w-full flex flex-col" action={formAction}>
          {/* 隐藏字段：携带已验证凭证 */}
          <input type="hidden" name="verified_token" value={verifiedToken} />
          <input type="hidden" name="email" value={verifiedEmail} />

          <div className="flex flex-col w-full gap-y-2">
            {/* 邮箱只读展示 */}
            <div className="flex flex-col gap-y-1">
              <label className="text-small-regular text-ui-fg-base">{t.emailLabel}</label>
              <div className="h-10 flex items-center px-3 bg-ui-bg-subtle rounded-md text-sm text-ui-fg-subtle">
                {verifiedEmail}
                <span className="ml-2 text-xs text-green-600">✓</span>
              </div>
            </div>
            <Input
              label={t.firstNameLabel}
              name="first_name"
              required
              autoComplete="given-name"
              data-testid="first-name-input"
            />
            <Input
              label={t.lastNameLabel}
              name="last_name"
              required
              autoComplete="family-name"
              data-testid="last-name-input"
            />
            <Input
              label={t.phoneLabel}
              name="phone"
              type="tel"
              autoComplete="tel"
              data-testid="phone-input"
            />
            <Input
              label={`${t.passwordLabel} (${t.passwordHint})`}
              name="password"
              required
              type="password"
              autoComplete="new-password"
              data-testid="password-input"
            />
          </div>

          {registerMessage && registerMessage !== REGISTER_SUCCESS && (
            <ErrorMessage error={registerMessage} data-testid="register-error" />
          )}

          <span className="text-center text-ui-fg-base text-small-regular mt-6">
            {t.privacyPrefix}{" "}
            <LocalizedClientLink href="/content/privacy-policy" className="underline">
              {t.privacyPolicy}
            </LocalizedClientLink>{" "}
            {t.and}{" "}
            <LocalizedClientLink href="/content/terms-of-use" className="underline">
              {t.termsOfUse}
            </LocalizedClientLink>
            .
          </span>

          <SubmitButton className="w-full mt-6" data-testid="register-button">
            {t.registerButton}
          </SubmitButton>
        </form>
      )}

      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        {t.alreadyMember}{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          {t.signIn}
        </button>
        .
      </span>
    </div>
  )
}

export default Register

