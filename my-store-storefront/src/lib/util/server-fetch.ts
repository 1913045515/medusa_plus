const RETRYABLE_SERVER_ERROR_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
])

export function isRetryableServerConnectionError(error: unknown) {
  if (typeof window !== "undefined") {
    return false
  }

  const errorWithCause = error as {
    code?: string
    cause?: { code?: string; cause?: { code?: string } }
  }

  const code =
    errorWithCause?.code ||
    errorWithCause?.cause?.code ||
    errorWithCause?.cause?.cause?.code ||
    ""

  return RETRYABLE_SERVER_ERROR_CODES.has(code)
}

export async function fetchServerWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  attempts = 8
) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fetch(input, init)
    } catch (error) {
      if (!isRetryableServerConnectionError(error) || attempt === attempts - 1) {
        throw error
      }

      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)))
    }
  }

  throw new Error("Server fetch failed unexpectedly")
}