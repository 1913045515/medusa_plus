"use server"

// Mirror the same priority order as src/lib/config.ts getBackendUrl():
// MEDUSA_BACKEND_URL (server-side Docker internal URL) takes priority over
// NEXT_PUBLIC_MEDUSA_BACKEND_URL (public URL), with a local-dev fallback.
const BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://localhost:9000"

// The publishable key is required by Medusa's store API.
// Available on both server (NEXT_PUBLIC_*) and client.
const PUB_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY ||
  ""

export type MenuItemData = {
  id: string
  menu_type: string
  title: string
  href: string
  icon: string | null
  parent_id: string | null
  sort_order: number
  is_visible: boolean
  target: string
  children?: MenuItemData[]
}

export async function getMenuItems(type: "front" | "admin" = "front"): Promise<MenuItemData[]> {
  try {
    const headers: Record<string, string> = {}
    if (PUB_KEY) headers["x-publishable-api-key"] = PUB_KEY

    const res = await fetch(`${BACKEND_URL}/store/menu-items?type=${type}`, {
      headers,
      // Tags allow immediate on-demand revalidation from the backend.
      // revalidate: 60 ensures stale data is flushed at most every 60 s even
      // if the backend notification fails to reach the storefront.
      next: { tags: [`menu-items-${type}`], revalidate: 60 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.menu_items as MenuItemData[]) ?? []
  } catch {
    return []
  }
}
