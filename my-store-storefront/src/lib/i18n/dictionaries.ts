/**
 * Simple server-side i18n dictionary for storefront UI strings.
 * Backend-supplied content (course titles, descriptions, etc.) is already
 * localized via the x-medusa-locale header; this dictionary only covers
 * static UI chrome that is NOT fetched from the backend.
 */

export type CoursesDictionary = {
  pageTitle: string
  pageSubtitle: string
  empty: string
  levelBeginner: string
  levelIntermediate: string
  levelAdvanced: string
  lessonsUnit: string
  notFound: string
  noLessons: string
  episodes: string
  episodeLabel: string
  free: string
  paid: string
  purchased: string
  cannotPlay: string
  loading: string
  purchaseCourse: string
  purchaseToWatch: string
  accessExpired: string
  refreshAccess: string
  refreshingAccess: string
  refreshToContinue: string
  cancel: string
  close: string
  freePreviewHint: string
  durationHour: string
  durationMin: string
  durationMinSec: string
  // Error code messages
  errorLoginRequired: string
  errorLoginExpired: string
  errorPurchaseRequired: string
  errorVideoUnavailable: string
  errorLessonNotFound: string
  errorCannotPlay: string
}

const zh: CoursesDictionary = {
  pageTitle: "课程",
  pageSubtitle: "浏览可用课程。",
  empty: "暂无课程。",
  levelBeginner: "入门",
  levelIntermediate: "进阶",
  levelAdvanced: "高级",
  lessonsUnit: "课时",
  notFound: "未找到该课程。",
  noLessons: "暂无课时内容。",
  episodes: "选集",
  episodeLabel: "第 {{n}} 集",
  free: "免费",
  paid: "付费",
  purchased: "已购买",
  cannotPlay: "当前课时不可播放",
  loading: "加载中...",
  purchaseCourse: "购买课程",
  purchaseToWatch: "购买后观看",
  accessExpired: "当前播放授权已过期",
  refreshAccess: "刷新访问授权",
  refreshingAccess: "刷新中...",
  refreshToContinue: "请刷新访问授权后继续播放",
  cancel: "取消",
  close: "关闭",
  freePreviewHint: "免费试看",
  durationHour: "时",
  durationMin: "分",
  durationMinSec: "秒",
  errorLoginRequired: "请先登录",
  errorLoginExpired: "登录已过期，请重新登录",
  errorPurchaseRequired: "请先购买课程",
  errorVideoUnavailable: "视频授权暂不可用，请稍后重试",
  errorLessonNotFound: "课时不存在",
  errorCannotPlay: "无法播放当前课时",
}

const en: CoursesDictionary = {
  pageTitle: "Courses",
  pageSubtitle: "Browse available courses.",
  empty: "No courses.",
  levelBeginner: "Beginner",
  levelIntermediate: "Intermediate",
  levelAdvanced: "Advanced",
  lessonsUnit: "lessons",
  notFound: "Course not found.",
  noLessons: "No lessons available.",
  episodes: "Episodes",
  episodeLabel: "Ep {{n}}",
  free: "Free",
  paid: "Paid",
  purchased: "Purchased",
  cannotPlay: "This episode is not available",
  loading: "Loading...",
  purchaseCourse: "Purchase Course",
  purchaseToWatch: "Purchase to watch",
  accessExpired: "Playback access has expired",
  refreshAccess: "Refresh access",
  refreshingAccess: "Refreshing...",
  refreshToContinue: "Refresh access to continue playback",
  cancel: "Cancel",
  close: "Close",
  freePreviewHint: "Free preview",
  durationHour: "h",
  durationMin: "min",
  durationMinSec: "s",
  errorLoginRequired: "Please log in to continue",
  errorLoginExpired: "Your session has expired. Please log in again.",
  errorPurchaseRequired: "Purchase this course to watch",
  errorVideoUnavailable: "Video is temporarily unavailable. Please try again later.",
  errorLessonNotFound: "Episode not found",
  errorCannotPlay: "Unable to play this episode",
}

const dictionaries: Record<string, CoursesDictionary> = {
  "zh-CN": zh,
  zh,
  en,
  "en-US": en,
}

export function getCoursesDictionary(locale?: string | null): CoursesDictionary {
  if (!locale) return en
  return dictionaries[locale] ?? (locale.startsWith("zh") ? zh : en)
}

// ─── Product Detail Page Dictionary ──────────────────────────────────────────

// ─── Cart Success Dialog Dictionary ──────────────────────────────────────────

export type CartDictionary = {
  added: string
  addedDesc: (title: string) => string
  viewCart: string
  continue: string
}

const cartZh: CartDictionary = {
  added: "已加入购物车",
  addedDesc: (title: string) => `${title} 已成功加入购物车`,
  viewCart: "查看购物车",
  continue: "继续购物",
}

const cartEn: CartDictionary = {
  added: "Added to cart",
  addedDesc: (title: string) => `${title} was added to cart`,
  viewCart: "View cart",
  continue: "Continue shopping",
}

const cartDictionaries: Record<string, CartDictionary> = {
  "zh-CN": cartZh,
  zh: cartZh,
  en: cartEn,
  "en-US": cartEn,
}

export function getCartDictionary(locale?: string | null): CartDictionary {
  if (!locale) return cartEn
  return cartDictionaries[locale] ?? (locale.startsWith("zh") ? cartZh : cartEn)
}

// ─── Product Detail Page Dictionary ──────────────────────────────────────────

export type ProductDetailDictionary = {
  productDetails: string
  shortDescription: string
  longDescription: string
  previousImage: string
  nextImage: string
}

const pdZh: ProductDetailDictionary = {
  productDetails: "产品详情",
  shortDescription: "短描述",
  longDescription: "详细描述",
  previousImage: "上一张",
  nextImage: "下一张",
}

const pdEn: ProductDetailDictionary = {
  productDetails: "Product Details",
  shortDescription: "Short Description",
  longDescription: "Long Description",
  previousImage: "Previous",
  nextImage: "Next",
}

const pdDictionaries: Record<string, ProductDetailDictionary> = {
  "zh-CN": pdZh,
  zh: pdZh,
  en: pdEn,
  "en-US": pdEn,
}

export function getProductDetailDictionary(locale?: string | null): ProductDetailDictionary {
  if (!locale) return pdEn
  return pdDictionaries[locale] ?? (locale.startsWith("zh") ? pdZh : pdEn)
}

export type OrderDictionary = {
  orderDetailsTitle: string
  backToOverview: string
  thankYou: string
  orderPlacedSuccessfully: string
  summary: string
  confirmationSentPrefix: string
  orderDate: string
  orderNumber: string
  orderStatus: string
  paymentStatus: string
  virtualProduct: string
  openCourse: string
  downloadResource: string
  typeResource: string
  typeCourse: string
  resourceLinkLabel: string
}

const orderZh: OrderDictionary = {
  orderDetailsTitle: "订单详情",
  backToOverview: "返回订单列表",
  thankYou: "感谢购买！",
  orderPlacedSuccessfully: "你的订单已提交成功。",
  summary: "订单摘要",
  confirmationSentPrefix: "订单确认信息已发送至",
  orderDate: "下单时间",
  orderNumber: "订单编号",
  orderStatus: "订单状态",
  paymentStatus: "支付状态",
  virtualProduct: "虚拟交付",
  openCourse: "进入课程学习",
  downloadResource: "下载资料",
  typeResource: "数据资料",
  typeCourse: "虚拟课程",
  resourceLinkLabel: "资料连接地址",
}

const orderEn: OrderDictionary = {
  orderDetailsTitle: "Order details",
  backToOverview: "Back to overview",
  thankYou: "Thank you!",
  orderPlacedSuccessfully: "Your order was placed successfully.",
  summary: "Summary",
  confirmationSentPrefix: "We have sent the order confirmation details to",
  orderDate: "Order date",
  orderNumber: "Order number",
  orderStatus: "Order status",
  paymentStatus: "Payment status",
  virtualProduct: "Virtual fulfillment",
  openCourse: "Open course",
  downloadResource: "Download resource",
  typeResource: "Resource",
  typeCourse: "Course",
  resourceLinkLabel: "Resource link",
}

const orderDictionaries: Record<string, OrderDictionary> = {
  "zh-CN": orderZh,
  zh: orderZh,
  en: orderEn,
  "en-US": orderEn,
}

export function getOrderDictionary(locale?: string | null): OrderDictionary {
  if (!locale) return orderEn
  return orderDictionaries[locale] ?? (locale.startsWith("zh") ? orderZh : orderEn)
}

// ─── Password Reset Dictionary ────────────────────────────────────────────────

export type PasswordResetDictionary = {
  // Forgot password page
  forgotTitle: string
  forgotSubtitle: string
  emailLabel: string
  sendButton: string
  sending: string
  networkError: string
  // Success state
  emailSentTitle: string
  emailSentDesc: string
  emailSentHint: string
  backToLogin: string
  // Reset password page
  resetTitle: string
  resetSubtitle: (email: string) => string
  emailAddressLabel: string
  newPasswordLabel: string
  confirmPasswordLabel: string
  resetButton: string
  resetting: string
  // Validation errors (client-side)
  passwordTooShort: string
  passwordMismatch: string
  // Token invalid page
  linkInvalidTitle: string
  linkInvalidDesc: string
  linkInvalidHint: string
  backToLoginPage: string
  // Success state
  resetSuccessTitle: string
  resetSuccessDesc: string
  // Validating state
  validatingLink: string
  // No token
  invalidLinkDesc: string
  // Login component
  forgotPasswordLink: string
}

const prZh: PasswordResetDictionary = {
  forgotTitle: "忘记密码",
  forgotSubtitle: "请输入您的注册邮箱，我们将向您发送密码重置链接。",
  emailLabel: "邮箱地址",
  sendButton: "发送重置邮件",
  sending: "发送中...",
  networkError: "网络错误，请稍后重试。",
  emailSentTitle: "邮件已发送",
  emailSentDesc: "如果该邮箱已注册，您将收到一封包含密码重置链接的邮件。",
  emailSentHint: "链接有效期为 10 分钟，请尽快操作。请检查垃圾邮件箱。",
  backToLogin: "返回登录",
  resetTitle: "重置密码",
  resetSubtitle: (email: string) => `为账号 ${email} 设置新密码`,
  emailAddressLabel: "邮箱地址",
  newPasswordLabel: "新密码（至少 8 位）",
  confirmPasswordLabel: "确认新密码",
  resetButton: "确认重置密码",
  resetting: "重置中...",
  passwordTooShort: "密码不能少于 8 位",
  passwordMismatch: "两次输入的密码不一致",
  linkInvalidTitle: "链接无效",
  linkInvalidDesc: "此重置链接已失效或已过期。",
  linkInvalidHint: "重置链接仅有效 10 分钟且只能使用一次，请重新申请。",
  backToLoginPage: "返回登录页",
  resetSuccessTitle: "密码重置成功",
  resetSuccessDesc: "您的密码已更新，正在跳转到登录页...",
  validatingLink: "验证链接中...",
  invalidLinkDesc: "无效的重置链接，请重新申请。",
  forgotPasswordLink: "忘记密码？",
}

const prEn: PasswordResetDictionary = {
  forgotTitle: "Forgot Password",
  forgotSubtitle: "Enter your email address and we'll send you a password reset link.",
  emailLabel: "Email address",
  sendButton: "Send reset email",
  sending: "Sending...",
  networkError: "Network error. Please try again later.",
  emailSentTitle: "Email sent",
  emailSentDesc: "If that email is registered, you'll receive a password reset link shortly.",
  emailSentHint: "The link is valid for 10 minutes. Please also check your spam folder.",
  backToLogin: "Back to sign in",
  resetTitle: "Reset Password",
  resetSubtitle: (email: string) => `Set a new password for ${email}`,
  emailAddressLabel: "Email address",
  newPasswordLabel: "New password (min. 8 characters)",
  confirmPasswordLabel: "Confirm new password",
  resetButton: "Reset password",
  resetting: "Resetting...",
  passwordTooShort: "Password must be at least 8 characters",
  passwordMismatch: "Passwords do not match",
  linkInvalidTitle: "Link invalid",
  linkInvalidDesc: "This reset link is invalid or has expired.",
  linkInvalidHint: "Reset links are valid for 10 minutes and can only be used once. Please request a new one.",
  backToLoginPage: "Back to sign in",
  resetSuccessTitle: "Password reset",
  resetSuccessDesc: "Your password has been updated. Redirecting to sign in...",
  validatingLink: "Verifying link...",
  invalidLinkDesc: "Invalid reset link. Please request a new one.",
  forgotPasswordLink: "Forgot password?",
}

const prDictionaries: Record<string, PasswordResetDictionary> = {
  "zh-CN": prZh,
  zh: prZh,
  en: prEn,
  "en-US": prEn,
}

export function getPasswordResetDictionary(locale?: string | null): PasswordResetDictionary {
  if (!locale) return prEn
  return prDictionaries[locale] ?? (locale.startsWith("zh") ? prZh : prEn)
}

// ─── Blog Dictionary ──────────────────────────────────────────────────────────

export type BlogDictionary = {
  // List page
  pageTitle: string
  searchPlaceholder: string
  searchButton: string
  pinnedPosts: string
  noPosts: string
  loadingMore: string
  /** Use {{n}} as placeholder for the count */
  showingAll: string
  categories: string
  tags: string
  // Detail page
  home: string
  blog: string
  /** Use {{n}} as placeholder */
  minuteRead: string
  /** Use {{n}} as placeholder */
  reads: string
  /** Use {{n}} as placeholder */
  words: string
  tableOfContents: string
  shareArticle: string
  copied: string
  copyLink: string
  prevPost: string
  nextPost: string
  relatedPosts: string
  /** Use {{n}} as placeholder */
  commentCount: string
  noComments: string
  commentPlaceholder: string
  submitComment: string
  submittingComment: string
  loginToComment: string
  login: string
  commentSubmitted: string
  commentFailed: string
  sessionExpired: string
  passwordRequired: string
  passwordPlaceholder: string
  passwordConfirm: string
  // Card strings
  pinned: string
  readMore: string
  // Category/tag page prefixes
  categoryPrefix: string
  tagPrefix: string
}

const blogZh: BlogDictionary = {
  pageTitle: "博客",
  searchPlaceholder: "搜索文章...",
  searchButton: "搜索",
  pinnedPosts: "置顶文章",
  noPosts: "暂无文章",
  loadingMore: "加载中...",
  showingAll: "已显示全部 {{n}} 篇文章",
  categories: "分类",
  tags: "标签",
  home: "首页",
  blog: "博客",
  minuteRead: "约 {{n}} 分钟阅读",
  reads: "{{n}} 次阅读",
  words: "{{n}} 字",
  tableOfContents: "目录",
  shareArticle: "分享文章",
  copied: "✓ 已复制",
  copyLink: "🔗 复制链接",
  prevPost: "← 上一篇",
  nextPost: "下一篇 →",
  relatedPosts: "相关文章",
  commentCount: "评论 ({{n}})",
  noComments: "暂无评论，快来发表第一条评论吧！",
  commentPlaceholder: "写下你的评论...",
  submitComment: "提交评论",
  submittingComment: "提交中...",
  loginToComment: "后再评论",
  login: "登录",
  commentSubmitted: "评论已提交，待审核后显示",
  commentFailed: "评论提交失败，请重试",
  sessionExpired: "登录已过期，请重新登录",
  passwordRequired: "🔒 该文章需要密码访问",
  passwordPlaceholder: "请输入密码",
  passwordConfirm: "确认",
  pinned: "置顶",
  readMore: "阅读全文 →",
  categoryPrefix: "分类",
  tagPrefix: "标签",
}

const blogEn: BlogDictionary = {
  pageTitle: "Blog",
  searchPlaceholder: "Search posts...",
  searchButton: "Search",
  pinnedPosts: "Pinned Posts",
  noPosts: "No posts yet",
  loadingMore: "Loading...",
  showingAll: "Showing all {{n}} posts",
  categories: "Categories",
  tags: "Tags",
  home: "Home",
  blog: "Blog",
  minuteRead: "~{{n}} min read",
  reads: "{{n}} views",
  words: "{{n}} words",
  tableOfContents: "Contents",
  shareArticle: "Share",
  copied: "✓ Copied",
  copyLink: "🔗 Copy link",
  prevPost: "← Previous",
  nextPost: "Next →",
  relatedPosts: "Related Posts",
  commentCount: "Comments ({{n}})",
  noComments: "No comments yet. Be the first to comment!",
  commentPlaceholder: "Write a comment...",
  submitComment: "Submit",
  submittingComment: "Submitting...",
  loginToComment: "to comment",
  login: "Log in",
  commentSubmitted: "Comment submitted, pending review.",
  commentFailed: "Failed to submit comment. Please try again.",
  sessionExpired: "Session expired. Please log in again.",
  passwordRequired: "🔒 This post is password protected",
  passwordPlaceholder: "Enter password",
  passwordConfirm: "Confirm",
  pinned: "Pinned",
  readMore: "Read more →",
  categoryPrefix: "Category",
  tagPrefix: "Tag",
}

const blogDictionaries: Record<string, BlogDictionary> = {
  "zh-CN": blogZh,
  zh: blogZh,
  en: blogEn,
  "en-US": blogEn,
}

export function getBlogDictionary(locale?: string | null): BlogDictionary {
  if (!locale) return blogEn
  return blogDictionaries[locale] ?? (locale.startsWith("zh") ? blogZh : blogEn)
}

