import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY ||
  process.env.MEDUSA_PUBLISHABLE_KEY

export async function POST(req: NextRequest) {
  if (!BACKEND_URL) {
    return NextResponse.json({ message: "Missing MEDUSA_BACKEND_URL" }, { status: 500 })
  }

  try {
    const body = await req.json()

    const response = await fetch(`${BACKEND_URL}/store/password-reset/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(PUBLISHABLE_KEY ? { "x-publishable-api-key": PUBLISHABLE_KEY } : {}),
      },
      body: JSON.stringify(body),
    })

    const data = await response.json().catch(() => ({}))
    return NextResponse.json(data, { status: response.status })
  } catch (err) {
    console.error("[password-reset proxy] error:", err)
    return NextResponse.json({ message: "Network error" }, { status: 500 })
  }
}
