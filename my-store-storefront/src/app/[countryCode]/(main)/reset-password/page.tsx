import { Metadata } from "next"
import { Suspense } from "react"
import ResetPasswordTemplate from "@modules/account/templates/reset-password-template"

export const metadata: Metadata = {
  title: "重置密码 / Reset Password",
  description: "重置您的账号密码",
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-ui-fg-subtle">加载中...</p></div>}>
      <ResetPasswordTemplate />
    </Suspense>
  )
}
