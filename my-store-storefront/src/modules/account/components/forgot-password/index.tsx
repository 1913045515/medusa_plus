"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import { getPasswordResetDictionary } from "@lib/i18n/dictionaries"
import { checkEmailExists } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const ForgotPassword = ({ setCurrentView }: Props) => {
  const { countryCode } = useParams() as { countryCode?: string }
  const dict = getPasswordResetDictionary(countryCode)

  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailNotRegistered, setEmailNotRegistered] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setEmailNotRegistered(false)
    setLoading(true)
    try {
      // 先检查邮箱是否已注册
      const checkResult = await checkEmailExists(email.trim().toLowerCase())
      if ("error" in checkResult) {
        setError(dict.networkError)
        return
      }
      if (!checkResult.exists) {
        setEmailNotRegistered(true)
        return
      }
      const res = await fetch("/api/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      if (!res.ok) {
        setError(dict.networkError)
        return
      }
      setSubmitted(true)
    } catch {
      setError(dict.networkError)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-sm w-full flex flex-col items-center" data-testid="forgot-password-success">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-large-semi uppercase mb-4 text-center">{dict.emailSentTitle}</h1>
        <p className="text-center text-base-regular text-ui-fg-base mb-2">
          {dict.emailSentDesc}
        </p>
        <p className="text-center text-small-regular text-ui-fg-subtle mb-8">
          {dict.emailSentHint}
        </p>
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline text-small-regular text-ui-fg-base"
        >
          {dict.backToLogin}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-sm w-full flex flex-col items-center" data-testid="forgot-password-page">
      <h1 className="text-large-semi uppercase mb-6">{dict.forgotTitle}</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        {dict.forgotSubtitle}
      </p>
      <form className="w-full" onSubmit={handleSubmit}>
        <div className="flex flex-col w-full gap-y-2">
          <div className="flex flex-col gap-y-1">
            <label className="text-small-regular text-ui-fg-base" htmlFor="forgot-email">
              {dict.emailLabel}
            </label>
            <input
              id="forgot-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailNotRegistered(false); setError(null) }}
              className="w-full border border-ui-border-base rounded px-3 py-2 text-base-regular text-ui-fg-base bg-ui-bg-field focus:outline-none focus:ring-1 focus:ring-ui-border-interactive"
              data-testid="forgot-email-input"
            />
          </div>
        </div>
        {error && (
          <p className="text-small-regular text-rose-500 mt-2">{error}</p>
        )}
        {emailNotRegistered && (
          <p className="text-small-regular text-rose-500 mt-2" data-testid="email-not-registered-error">
            {dict.emailNotRegistered}{" "}
            <button
              type="button"
              onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
              className="underline font-medium"
            >
              {dict.goToRegister}
            </button>
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-ui-button-inverted text-ui-fg-on-inverted py-3 rounded text-small-regular uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-opacity"
          data-testid="send-reset-button"
        >
          {loading ? dict.sending : dict.sendButton}
        </button>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          {dict.backToLogin}
        </button>
      </span>
    </div>
  )
}

export default ForgotPassword

