import { getServerBackendUrl } from "@lib/util/server-backend-url"
import { fetchServerWithRetry } from "@lib/util/server-fetch"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = getServerBackendUrl(
  process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
)

function buildHeaders(req: NextRequest): Record<string, string> {
  const publishableKey =
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
    process.env.MEDUSA_PUBLISHABLE_KEY ||
    ""

  const headers: Record<string, string> = {
    "x-publishable-api-key": publishableKey,
  }

  const jwtToken = req.cookies.get("_medusa_jwt")?.value

  if (jwtToken) {
    headers.authorization = `Bearer ${jwtToken}`
  }

  return headers
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { message: "Missing MEDUSA_BACKEND_URL" },
      { status: 500 }
    )
  }

  const { id } = await params
  const queryString = req.nextUrl.searchParams.toString()
  const backendUrl = `${BACKEND_URL}/store/file-assets/${id}/status${
    queryString ? `?${queryString}` : ""
  }`

  const response = await fetchServerWithRetry(backendUrl, {
    method: "GET",
    headers: buildHeaders(req),
    cache: "no-store",
  })

  const body = await response.text()

  return new NextResponse(body, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") || "application/json",
      "cache-control": "no-store",
    },
  })
}