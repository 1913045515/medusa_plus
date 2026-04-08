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
