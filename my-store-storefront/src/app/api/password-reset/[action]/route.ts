import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY ||
  process.env.MEDUSA_PUBLISHABLE_KEY

const headers = () => ({
  "Content-Type": "application/json",
  ...(PUBLISHABLE_KEY ? { "x-publishable-api-key": PUBLISHABLE_KEY } : {}),
})

// GET /api/password-reset/validate?token=xxx
export async function GET(req: NextRequest) {
  if (!BACKEND_URL) {
    return NextResponse.json({ valid: false, message: "Missing MEDUSA_BACKEND_URL" }, { status: 500 })
  }
  const token = req.nextUrl.searchParams.get("token") ?? ""
  try {
    const res = await fetch(
      `${BACKEND_URL}/store/password-reset/validate?token=${encodeURIComponent(token)}`,
      { headers: headers() }
    )
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error("[password-reset proxy validate] error:", err)
    return NextResponse.json({ valid: false, message: "Network error" }, { status: 500 })
  }
}

// POST /api/password-reset/confirm
export async function POST(req: NextRequest) {
  if (!BACKEND_URL) {
    return NextResponse.json({ message: "Missing MEDUSA_BACKEND_URL" }, { status: 500 })
  }
  try {
    const body = await req.json()
    const res = await fetch(`${BACKEND_URL}/store/password-reset/confirm`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error("[password-reset proxy confirm] error:", err)
    return NextResponse.json({ message: "Network error" }, { status: 500 })
  }
}
