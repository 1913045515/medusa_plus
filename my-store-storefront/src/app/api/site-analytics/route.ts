import { NextRequest, NextResponse } from "next/server"
import { getServerBackendUrl } from "@lib/util/server-backend-url"

const BACKEND_URL = getServerBackendUrl(
  process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
)

function getPublishableKey(): string {
  const key =
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY ||
    process.env.MEDUSA_PUBLISHABLE_KEY

  if (!key) {
    throw new Error("Missing Medusa publishable key")
  }

  return key
}

export async function POST(req: NextRequest) {
  if (!BACKEND_URL) {
    return NextResponse.json({ message: "Missing MEDUSA_BACKEND_URL" }, { status: 500 })
  }

  try {
    const body = await req.text()

    const response = await fetch(`${BACKEND_URL}/store/site-analytics/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": getPublishableKey(),
        ...(req.headers.get("user-agent") ? { "user-agent": req.headers.get("user-agent") as string } : {}),
        ...(req.headers.get("x-forwarded-for") ? { "x-forwarded-for": req.headers.get("x-forwarded-for") as string } : {}),
        ...(req.headers.get("x-real-ip") ? { "x-real-ip": req.headers.get("x-real-ip") as string } : {}),
        ...(req.headers.get("cf-ipcountry") ? { "cf-ipcountry": req.headers.get("cf-ipcountry") as string } : {}),
        ...(req.headers.get("x-vercel-ip-country")
          ? { "x-vercel-ip-country": req.headers.get("x-vercel-ip-country") as string }
          : {}),
        ...(req.headers.get("cloudfront-viewer-country")
          ? { "cloudfront-viewer-country": req.headers.get("cloudfront-viewer-country") as string }
          : {}),
        ...(req.headers.get("fly-client-ip-country-code")
          ? { "fly-client-ip-country-code": req.headers.get("fly-client-ip-country-code") as string }
          : {}),
        ...(req.headers.get("x-country-code") ? { "x-country-code": req.headers.get("x-country-code") as string } : {}),
        ...(req.headers.get("x-country") ? { "x-country": req.headers.get("x-country") as string } : {}),
      },
      body,
      cache: "no-store",
    })

    const payload = await response.text()

    return new NextResponse(payload || null, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message ?? "Failed to forward analytics event" },
      { status: 500 }
    )
  }
}