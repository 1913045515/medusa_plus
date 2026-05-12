import { NextResponse } from "next/server"
import { getServerBackendUrl } from "@lib/util/server-backend-url"

// Server-side internal URL: http://admin:9000 in Docker, localhost:9000 in local dev
const BACKEND_URL = getServerBackendUrl(
  process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
)

export async function GET() {
  if (!BACKEND_URL) {
    return NextResponse.json({ enabled: false }, { status: 200 })
  }

  const publishableKey =
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY ||
    process.env.MEDUSA_PUBLISHABLE_KEY

  try {
    const res = await fetch(`${BACKEND_URL}/store/paypal/config`, {
      cache: "no-store",
      headers: {
        ...(publishableKey ? { "x-publishable-api-key": publishableKey } : {}),
      },
    })

    if (!res.ok) {
      return NextResponse.json({ enabled: false }, { status: 200 })
    }

    const data = await res.json()
    return NextResponse.json(data, { status: 200 })
  } catch {
    return NextResponse.json({ enabled: false }, { status: 200 })
  }
}
