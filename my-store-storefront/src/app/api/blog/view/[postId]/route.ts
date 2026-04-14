import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL

export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
  const { postId } = params
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"

  const key =
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
    process.env.MEDUSA_PUBLISHABLE_KEY ||
    ""

  const res = await fetch(`${BACKEND_URL}/store/blogs/${postId}/view`, {
    method: "POST",
    headers: {
      "x-publishable-api-key": key,
      "x-forwarded-for": ip,
    },
  })

  return NextResponse.json({ success: res.ok })
}
