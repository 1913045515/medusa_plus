/**
 * Normalize a product image URL:
 * - If the URL was recorded when the backend ran locally (http://localhost:9000/static/... or
 *   http://localhost:9000/uploads/...), replace it with the configured production media base URL.
 * - In all other cases return the URL unchanged.
 *
 * Production backend serves uploaded files at  https://admin.wolzq.com/uploads/<file>
 * Set NEXT_PUBLIC_MEDIA_BASE_URL=https://admin.wolzq.com/uploads in production docker-compose.
 * Falls back to replacing the localhost origin with NEXT_PUBLIC_MEDUSA_BACKEND_URL + /uploads.
 */
const LOCALHOST_IMAGE_RE =
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/(static|uploads)\/(.+)$/

export function normalizeImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined

  const match = url.match(LOCALHOST_IMAGE_RE)
  if (!match) return url

  // Explicit override: NEXT_PUBLIC_MEDIA_BASE_URL (e.g. https://admin.wolzq.com/uploads)
  const mediaBase =
    process.env.NEXT_PUBLIC_MEDIA_BASE_URL ||
    (() => {
      const backendUrl =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      // Only transform if the configured backend is NOT localhost itself
      if (
        backendUrl.includes("localhost") ||
        backendUrl.includes("127.0.0.1")
      ) {
        return null
      }
      // Strip trailing slash
      return backendUrl.replace(/\/$/, "") + "/uploads"
    })()

  if (!mediaBase) {
    // Still in local dev – keep original URL as-is
    return url
  }

  const filename = match[4] // Everything after /static/ or /uploads/
  return `${mediaBase.replace(/\/$/, "")}/${filename}`
}
