import { NextRequest, NextResponse } from "next/server"
import { getServerBackendUrl } from "@lib/util/server-backend-url"

const BACKEND_URL = getServerBackendUrl(
  process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
)

const publishableKey =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY ||
  process.env.MEDUSA_PUBLISHABLE_KEY

/** GET /api/wechat-pay/query?cart_id=xxx → 代理到后端 /store/wechat-pay/query */
export async function GET(req: NextRequest) {
  if (!BACKEND_URL) {
    return NextResponse.json({ message: "Missing MEDUSA_BACKEND_URL" }, { status: 500 })
  }
  const cartId = req.nextUrl.searchParams.get("cart_id") ?? ""
  try {
    const res = await fetch(
      `${BACKEND_URL}/store/wechat-pay/query?cart_id=${encodeURIComponent(cartId)}`,
      {
        method: "GET",
        headers: {
          ...(publishableKey ? { "x-publishable-api-key": publishableKey } : {}),
          ...(req.headers.get("cookie") ? { cookie: req.headers.get("cookie") as string } : {}),
        },
        cache: "no-store",
      }
    )
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message ?? "wechat-pay query proxy error" },
      { status: 500 }
    )
  }
}
