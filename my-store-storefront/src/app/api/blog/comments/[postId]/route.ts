import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL

export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
  const body = await req.json()
  const { postId } = params

  const key =
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
    process.env.MEDUSA_PUBLISHABLE_KEY ||
    ""

  // Extract _medusa_jwt from the request cookie header and forward as Authorization bearer token
  const cookieHeader = req.headers.get("cookie") || ""
  const jwtMatch = cookieHeader.match(/(?:^|;\s*)_medusa_jwt=([^;]+)/)
  const jwtToken = jwtMatch ? decodeURIComponent(jwtMatch[1]) : null

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-publishable-api-key": key,
  }
  if (jwtToken) {
    headers["Authorization"] = `Bearer ${jwtToken}`
  }

  const res = await fetch(`${BACKEND_URL}/store/blogs/${postId}/comments`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })

  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
