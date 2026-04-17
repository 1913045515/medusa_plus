"use client"

import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"

export default function TicketWidget() {
  const router = useRouter()
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  // Extract countryCode from pathname (e.g. /cn/... → cn)
  const countryCode = pathname?.split("/")?.[1] || "cn"

  // Don't show on support pages (already there)
  const isOnSupportPage = pathname?.includes("/support/tickets")

  useEffect(() => {
    // Small delay to avoid hydration flicker
    const t = setTimeout(() => setVisible(true), 500)
    return () => clearTimeout(t)
  }, [])

  if (!visible || isOnSupportPage) return null

  return (
    <button
      onClick={() => router.push(`/${countryCode}/support/tickets`)}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
      aria-label="联系客服"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      <span className="text-sm font-medium">客服支持</span>
    </button>
  )
}
