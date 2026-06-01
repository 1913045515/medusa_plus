import { NextRequest, NextResponse } from "next/server"
import { getServerBackendUrl } from "@lib/util/server-backend-url"

const BACKEND_URL = getServerBackendUrl(
  process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
)

const publishableKey =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY ||
  process.env.MEDUSA_PUBLISHABLE_KEY

/** POST /api/wechat-pay/qrcode → 代理到后端 /store/wechat-pay/qrcode */
export async function POST(req: NextRequest) {
  if (!BACKEND_URL) {
    return NextResponse.json({ message: "Missing MEDUSA_BACKEND_URL" }, { status: 500 })
  }
  try {
    const body = await req.text()
    const res = await fetch(`${BACKEND_URL}/store/wechat-pay/qrcode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(publishableKey ? { "x-publishable-api-key": publishableKey } : {}),
        ...(req.headers.get("cookie") ? { cookie: req.headers.get("cookie") as string } : {}),
      },
      body,
    })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message ?? "wechat-pay qrcode proxy error" },
      { status: 500 }
    )
  }
}
