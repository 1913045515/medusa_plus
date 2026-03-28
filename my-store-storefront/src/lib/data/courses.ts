"use server"

import type { Course } from "types/course"
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

export async function listCourses(localeArg?: string | null): Promise<Course[]> {
  if (!BACKEND_URL) {
    throw new Error(
      "Missing backend url. Set MEDUSA_BACKEND_URL in my-store-storefront/.env.local"
    )
  }

  const locale = localeArg ?? (await getLocale())

  const res = await fetch(`${BACKEND_URL}/store/courses`, {
    method: "GET",
    headers: getBaseHeaders(locale),
    cache: "no-store",
  })

  // 尽量保留原始响应，避免 json() 失败时抛出 'unknown error'
  const rawText = await res.text().catch(() => "")
  let data: any = null
  try {
    data = rawText ? JSON.parse(rawText) : null
  } catch {
    data = null
  }

  if (!res.ok) {
    const msg =
      (typeof data?.message === "string" ? data.message : null) ||
      (typeof data?.error === "string" ? data.error : null) ||
      `Failed to fetch courses (Status: ${res.status}). url=${BACKEND_URL}/store/courses body=${rawText}`

    console.error("[listCourses] API Error:", msg)
    throw new Error(msg)
  }

  return (data?.courses ?? []) as Course[]
}

export async function getCourseByHandle(handle: string): Promise<Course | null> {
  const courses = await listCourses()
  return courses.find((c) => c.handle === handle) ?? null
}
