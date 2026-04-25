export default function medusaError(error: any): never {
  if (error.response) {
    // axios-style error (v1 SDK)
    const message = error.response.data?.message || error.response.data
    const msg = typeof message === "string" ? message : JSON.stringify(message)
    throw new Error(msg.charAt(0).toUpperCase() + msg.slice(1) + ".")
  }

  // Medusa v2 JS SDK (fetch-based) throws a plain Error whose message is
  // already the human-readable string extracted from the response body.
  // Re-throw it directly so the UI shows the real error instead of the
  // generic "Error setting up the request: An unknown error occurred." wrapper.
  throw error instanceof Error ? error : new Error(String(error.message ?? error))
}
