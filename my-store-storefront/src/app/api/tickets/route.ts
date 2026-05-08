import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

const PUB_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY ||
  ""

function getJwt(req: NextRequest): string | null {
  const cookieHeader = req.headers.get("cookie") || ""
  const match = cookieHeader.match(/(?:^|;\s*)_medusa_jwt=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

function buildHeaders(jwt: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-publishable-api-key": PUB_KEY,
  }
  if (jwt) headers["Authorization"] = `Bearer ${jwt}`
  return headers
}

// GET /api/tickets?status=...&page=...&guest_token=...
export async function GET(req: NextRequest) {
  const jwt = getJwt(req)
  const search = req.nextUrl.searchParams.toString()
  const res = await fetch(`${BACKEND_URL}/store/tickets${search ? `?${search}` : ""}`, {
    headers: buildHeaders(jwt),
  })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}

// POST /api/tickets  — create ticket
export async function POST(req: NextRequest) {
  const jwt = getJwt(req)
  const body = await req.json()
  const res = await fetch(`${BACKEND_URL}/store/tickets`, {
    method: "POST",
    headers: buildHeaders(jwt),
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
