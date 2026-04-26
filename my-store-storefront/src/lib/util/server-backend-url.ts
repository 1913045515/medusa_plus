export function getServerBackendUrl(url?: string | null) {
  if (!url) {
    return ""
  }

  if (typeof window !== "undefined") {
    return url
  }

  return url.replace("://localhost", "://127.0.0.1")
}