"use server"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL

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
  if (!BACKEND_URL) return []

  try {
    const res = await fetch(`${BACKEND_URL}/store/menu-items?type=${type}`, {
      next: { revalidate: 60 }, // revalidate every 60s
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.menu_items as MenuItemData[]) ?? []
  } catch {
    return []
  }
}
