"use server"

import type { Lesson, LessonPlayResponse, LessonPlaySuccess } from "types/lesson"
import { getAuthHeaders, removeAuthToken } from "./cookies"
import { getLocale } from "./locale-actions"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL

function getPublishableKey(): string {
  const key =
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY ||
    process.env.MEDUSA_PUBLISHABLE_KEY

  if (!key) {
    throw new Error(
      "Missing publishable key. Set NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY in my-store-storefront/.env.local"
    )
  }

  return key
}

function getBaseHeaders(locale?: string | null): Record<string, string> {
  return {
    "x-publishable-api-key": getPublishableKey(),
    ...(locale ? { "x-medusa-locale": locale } : {}),
  }
}

export async function getCourseLessons(courseId: string, localeArg?: string | null): Promise<Lesson[]> {
  if (!BACKEND_URL) {
    throw new Error(
      "Missing backend url. Set MEDUSA_BACKEND_URL in my-store-storefront/.env.local"
    )
  }

  const locale = localeArg ?? (await getLocale())

  const res = await fetch(`${BACKEND_URL}/store/courses/${courseId}/lessons`, {
    method: "GET",
    headers: getBaseHeaders(locale),
    cache: "no-store",
  })

  const rawText = await res.text().catch(() => "")
  let data: any = null
  try {
    data = rawText ? JSON.parse(rawText) : null
  } catch {
    data = null
  }

  if (!res.ok) {
    const msg =
      data?.message ||
      data?.error ||
      `Failed to fetch lessons (${res.status}). url=${BACKEND_URL}/store/courses/${courseId}/lessons body=${rawText}`
    throw new Error(msg)
  }

  return (data?.lessons ?? []) as Lesson[]
}

export async function getLessonPlayUrl(
  lessonId: string
): Promise<LessonPlayResponse> {
  if (!BACKEND_URL) {
    throw new Error(
      "Missing backend url. Set MEDUSA_BACKEND_URL in my-store-storefront/.env.local"
    )
  }

  const authHeaders = await getAuthHeaders()

  // 在发请求前检测本地 token 是否已过期，过期直接清除并提示重新登录
  if ("authorization" in authHeaders) {
    try {
      const token = (authHeaders as { authorization: string }).authorization.split(" ")[1]
      const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"))
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        await removeAuthToken()
        return { error: "登录已过期，请重新登录", code: 401 }
      }
    } catch {
      // 解析失败则继续，让后端决定
    }
  }

  const res = await fetch(`${BACKEND_URL}/store/lessons/${lessonId}/play`, {
    method: "GET",
    headers: {
      ...getBaseHeaders(),
      ...authHeaders,
    },
    cache: "no-store",
  })

  const rawText = await res.text().catch(() => "")
  let data: any = null
  try {
    data = rawText ? JSON.parse(rawText) : null
  } catch {
    data = null
  }

  if (!res.ok) {
    return {
      error:
        data?.message ||
        data?.error ||
        "Failed to fetch video",
      code: res.status as 401 | 403,
    }
  }

  return (data ?? {}) as LessonPlaySuccess
}
