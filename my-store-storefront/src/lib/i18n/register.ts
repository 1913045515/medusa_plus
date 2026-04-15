/**
 * 注册页国际化字典
 * 通过 URL countryCode 推断语言（CN/TW → zh，其余 → en）
 */

export type RegisterDictionary = typeof zh

export const zh = {
  // 标题
  title: "创建账号",
  subtitle: "注册成为会员，享受更好的购物体验。",

  // Step 1 - 邮箱输入
  emailLabel: "邮箱",
  emailPlaceholder: "请输入您的邮箱",
  sendOtpButton: "发送验证码",
  sendingOtp: "发送中...",
  resendOtp: "重新发送",
  resendIn: (s: number) => `${s}s 后重发`,

  // Step 2 - OTP 验证
  otpTitle: "输入验证码",
  otpSubtitle: (email: string) => `验证码已发送至 ${email}`,
  otpLabel: "6位验证码",
  verifyButton: "验证",
  verifying: "验证中...",
  changeEmail: "更换邮箱",

  // Step 3 - 完成注册
  profileTitle: "完善资料",
  firstNameLabel: "名字",
  lastNameLabel: "姓氏",
  phoneLabel: "手机号（选填）",
  passwordLabel: "密码",
  passwordHint: "至少8位",
  registerButton: "立即注册",
  registering: "注册中...",

  // 提示与链接
  privacyPrefix: "注册即代表您同意",
  privacyPolicy: "隐私政策",
  and: "和",
  termsOfUse: "服务条款",
  alreadyMember: "已有账号？",
  signIn: "立即登录",

  // 错误 / 状态
  emailRequired: "请输入邮箱",
  emailInvalid: "邮箱格式无效",
  otpRequired: "请输入验证码",
  passwordTooShort: "密码不能少于8位",
  emailAlreadyRegistered: "该邮箱已注册，请直接登录",
  registerSuccess: "注册成功！欢迎加入！",
  redirecting: "正在跳转到账号中心...",
} as const

export const en = {
  title: "Create Account",
  subtitle: "Sign up to become a member and enjoy a better shopping experience.",

  emailLabel: "Email",
  emailPlaceholder: "Enter your email address",
  sendOtpButton: "Send Code",
  sendingOtp: "Sending...",
  resendOtp: "Resend",
  resendIn: (s: number) => `Resend in ${s}s`,

  otpTitle: "Verify Your Email",
  otpSubtitle: (email: string) => `A verification code has been sent to ${email}`,
  otpLabel: "6-digit code",
  verifyButton: "Verify",
  verifying: "Verifying...",
  changeEmail: "Change email",

  profileTitle: "Complete Your Profile",
  firstNameLabel: "First name",
  lastNameLabel: "Last name",
  phoneLabel: "Phone (optional)",
  passwordLabel: "Password",
  passwordHint: "At least 8 characters",
  registerButton: "Create Account",
  registering: "Creating...",

  privacyPrefix: "By creating an account, you agree to our",
  privacyPolicy: "Privacy Policy",
  and: "and",
  termsOfUse: "Terms of Use",
  alreadyMember: "Already a member?",
  signIn: "Sign in",

  emailRequired: "Email is required",
  emailInvalid: "Invalid email address",
  otpRequired: "Verification code is required",
  passwordTooShort: "Password must be at least 8 characters",
  emailAlreadyRegistered: "This email is already registered. Please sign in.",
  registerSuccess: "Registration successful! Welcome!",
  redirecting: "Redirecting to your account...",
} as const

/** 根据 countryCode URL 参数推断语言 */
export function getRegisterDict(countryCode?: string): typeof zh | typeof en {
  const zhLocales = ["cn", "tw", "hk", "sg"]
  const lang = (countryCode ?? "").toLowerCase()
  return zhLocales.includes(lang) ? zh : en
}
