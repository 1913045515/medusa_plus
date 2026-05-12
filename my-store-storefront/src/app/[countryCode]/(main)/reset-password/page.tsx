import { Metadata } from "next"
import { Suspense } from "react"
import ResetPasswordTemplate from "@modules/account/templates/reset-password-template"

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your account password",
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-ui-fg-subtle">Loading...</p></div>}>
      <ResetPasswordTemplate />
    </Suspense>
  )
}
