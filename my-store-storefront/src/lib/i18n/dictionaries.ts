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
