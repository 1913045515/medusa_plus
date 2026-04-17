import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import { getPasswordResetDictionary } from "@lib/i18n/dictionaries"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useActionState } from "react"
import { useParams } from "next/navigation"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)
  const { countryCode } = useParams() as { countryCode?: string }
  const dict = getPasswordResetDictionary(countryCode)

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-page"
    >
      <h1 className="text-large-semi uppercase mb-6">{dict.welcomeBack}</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        {dict.signInSubtitle}
      </p>
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label={dict.emailInputLabel}
            name="email"
            type="email"
            title={dict.emailInputTitle}
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label={dict.passwordInputLabel}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="login-error-message" />
        <SubmitButton data-testid="sign-in-button" className="w-full mt-6">
          {dict.signInButton}
        </SubmitButton>
      </form>
      <div className="w-full flex justify-end mt-2">
        <button
          type="button"
          onClick={() => setCurrentView(LOGIN_VIEW.FORGOT_PASSWORD)}
          className="text-small-regular text-ui-fg-subtle underline hover:text-ui-fg-base"
          data-testid="forgot-password-button"
        >
          {dict.forgotPasswordLink}
        </button>
      </div>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        {dict.notAMember}{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline"
          data-testid="register-button"
        >
          {dict.joinUs}
        </button>
        .
      </span>
      <div className="flex gap-3 mt-4 text-small-regular text-ui-fg-muted">
        <LocalizedClientLink href="/content/privacy-policy" className="underline hover:text-ui-fg-subtle">
          隐私协议
        </LocalizedClientLink>
        <span>·</span>
        <LocalizedClientLink href="/content/terms-of-use" className="underline hover:text-ui-fg-subtle">
          用户协议
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default Login
