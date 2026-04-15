"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams, useRouter, useParams } from "next/navigation"
import { getPasswordResetDictionary } from "@lib/i18n/dictionaries"

type ValidateResult = { valid: boolean; email?: string; message?: string }

export default function ResetPasswordTemplate() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { countryCode } = useParams() as { countryCode?: string }
  const dict = getPasswordResetDictionary(countryCode)
  const token = searchParams.get("token") ?? ""

  const [validating, setValidating] = useState(true)
  const [validateResult, setValidateResult] = useState<ValidateResult | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const validatedRef = useRef(false)

  useEffect(() => {
    if (!token || validatedRef.current) return
    validatedRef.current = true
    fetch(`/api/password-reset/validate?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data: ValidateResult) => setValidateResult(data))
      .catch(() => setValidateResult({ valid: false, message: dict.networkError }))
      .finally(() => setValidating(false))
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (newPassword.length < 8) {
      setFormError(dict.passwordTooShort)
      return
    }
    if (newPassword !== confirmPassword) {
      setFormError(dict.passwordMismatch)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/password-reset/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFormError(data.message ?? dict.networkError)
      } else {
        setSuccess(true)
        setTimeout(() => router.push("/account"), 3000)
      }
    } catch {
      setFormError(dict.networkError)
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <p className="text-rose-500 text-base-regular">{dict.invalidLinkDesc}</p>
          <a href="/account" className="underline text-small-regular text-ui-fg-base mt-4 inline-block">{dict.backToLoginPage}</a>
        </div>
      </div>
    )
  }

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ui-fg-subtle">{dict.validatingLink}</p>
      </div>
    )
  }

  if (!validateResult?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mb-6 mx-auto">
            <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3C7.029 3 3 7.029 3 12s4.029 9 9 9 9-4.029 9-9-4.029-9-9-9z" />
            </svg>
          </div>
          <h1 className="text-large-semi uppercase mb-4">{dict.linkInvalidTitle}</h1>
          <p className="text-base-regular text-ui-fg-base mb-2">
            {validateResult?.message ?? dict.linkInvalidDesc}
          </p>
          <p className="text-small-regular text-ui-fg-subtle mb-8">
            {dict.linkInvalidHint}
          </p>
          <a href="/account" className="underline text-small-regular text-ui-fg-base">{dict.backToLoginPage}</a>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6 mx-auto">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-large-semi uppercase mb-4">{dict.resetSuccessTitle}</h1>
          <p className="text-base-regular text-ui-fg-base mb-8">
            {dict.resetSuccessDesc}
          </p>
        </div>
      </div>
    )
  }

  const email = validateResult.email ?? ""

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-sm w-full flex flex-col items-center" data-testid="reset-password-page">
        <h1 className="text-large-semi uppercase mb-6">{dict.resetTitle}</h1>
        <p className="text-center text-base-regular text-ui-fg-base mb-8">
          {dict.resetSubtitle(email)}
        </p>
        <form className="w-full" onSubmit={handleSubmit}>
          <div className="flex flex-col w-full gap-y-4">
            <div className="flex flex-col gap-y-1">
              <label className="text-small-regular text-ui-fg-base" htmlFor="reset-email">
                {dict.emailAddressLabel}
              </label>
              <input
                id="reset-email"
                type="email"
                value={email}
                readOnly
                disabled
                className="w-full border border-ui-border-base rounded px-3 py-2 text-base-regular text-ui-fg-disabled bg-ui-bg-disabled cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-y-1">
              <label className="text-small-regular text-ui-fg-base" htmlFor="new-password">
                {dict.newPasswordLabel}
              </label>
              <input
                id="new-password"
                type="password"
                name="new_password"
                autoComplete="new-password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-ui-border-base rounded px-3 py-2 text-base-regular text-ui-fg-base bg-ui-bg-field focus:outline-none focus:ring-1 focus:ring-ui-border-interactive"
                data-testid="new-password-input"
              />
            </div>

            <div className="flex flex-col gap-y-1">
              <label className="text-small-regular text-ui-fg-base" htmlFor="confirm-password">
                {dict.confirmPasswordLabel}
              </label>
              <input
                id="confirm-password"
                type="password"
                name="confirm_password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-ui-border-base rounded px-3 py-2 text-base-regular text-ui-fg-base bg-ui-bg-field focus:outline-none focus:ring-1 focus:ring-ui-border-interactive"
                data-testid="confirm-password-input"
              />
            </div>
          </div>

          {formError && (
            <p className="text-small-regular text-rose-500 mt-3">{formError}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-6 bg-ui-button-inverted text-ui-fg-on-inverted py-3 rounded text-small-regular uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-opacity"
            data-testid="reset-password-submit"
          >
            {submitting ? dict.resetting : dict.resetButton}
          </button>
        </form>
        <a href="/account" className="underline text-small-regular text-ui-fg-subtle mt-6">
          {dict.backToLoginPage}
        </a>
      </div>
    </div>
  )
}
