/**
 * Server-side storefront menu cache revalidation.
 *
 * Called after any menu item change from the Medusa backend so that the
 * Next.js storefront invalidates its cached menu data immediately — no
 * cross-origin browser requests, no CORS issues.
 *
 * Configure the storefront URL via:
 *   STOREFRONT_INTERNAL_URL=http://storefront:8000   (Docker / production)
 *   (defaults to http://localhost:8000 for local development)
 */
export async function notifyStorefrontMenuRevalidate(): Promise<void> {
  const storefrontUrl =
    process.env.STOREFRONT_INTERNAL_URL ||
    process.env.STOREFRONT_URL ||
    "http://localhost:8000"

  try {
    await fetch(`${storefrontUrl}/api/revalidate-menu`, {
      method: "POST",
      // Signal timeout so this never blocks the response to the admin client
      signal: AbortSignal.timeout(3000),
    })
  } catch {
    // Non-critical: storefront will pick up fresh data on the next 60-second TTL
  }
}
