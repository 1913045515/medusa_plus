import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

// Allow the Medusa admin panel (different origin) to call this endpoint from
// the browser as a fallback.  The primary notification path is server-side
// (Medusa backend → storefront), which avoids CORS entirely.
const ALLOWED_ORIGINS = (
  process.env.ADMIN_CORS ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  ""
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)

function corsHeaders(origin: string | null) {
  const allowed =
    !origin ||
    ALLOWED_ORIGINS.length === 0 ||
    ALLOWED_ORIGINS.some((o) => origin.startsWith(o))
  return allowed
    ? {
        "Access-Control-Allow-Origin": origin || "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    : {}
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin")
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) })
}

/**
 * POST /api/revalidate-menu
 * Called after any menu item change to invalidate the Next.js cache so the
 * storefront nav refreshes on the next request.
 *
 * Triggered server-side from the Medusa backend (primary) or from the admin
 * browser (fallback).
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin")
  revalidateTag("menu-items-front")
  revalidateTag("menu-items-admin")
  return NextResponse.json(
    { revalidated: true, at: new Date().toISOString() },
    { headers: corsHeaders(origin) }
  )
}
