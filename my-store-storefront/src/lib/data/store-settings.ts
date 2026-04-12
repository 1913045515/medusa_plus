"use server"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL

export type StoreSettings = {
  cartEnabled: boolean
}

export async function getStoreSettings(): Promise<StoreSettings> {
  if (!BACKEND_URL) {
    return { cartEnabled: true }
  }

  const publishableKey =
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY ||
    process.env.MEDUSA_PUBLISHABLE_KEY

  try {
    const res = await fetch(`${BACKEND_URL}/store/store-settings`, {
      cache: "no-store",
      headers: {
        ...(publishableKey ? { "x-publishable-api-key": publishableKey } : {}),
      },
    })
    if (!res.ok) {
      return { cartEnabled: true }
    }
    const data = await res.json()
    return { cartEnabled: data?.store_settings?.cart_enabled ?? true }
  } catch {
    return { cartEnabled: true }
  }
}
