import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

function getPublishableKey() {
  return (
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY ||
    process.env.MEDUSA_PUBLISHABLE_KEY ||
    ""
  )
}

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!BACKEND_URL) {
    // 开发/验收阶段：不阻塞页面
    return new Map<string, HttpTypes.StoreRegion>()
  }

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    try {
      const key = getPublishableKey()
      const res = await fetch(`${BACKEND_URL}/store/regions`, {
        headers: key ? { "x-publishable-api-key": key } : {},
        next: {
          revalidate: 3600,
          tags: [`regions-${cacheId}`],
        },
        cache: "force-cache",
      })

      const raw = await res.text().catch(() => "")
      const json = raw ? JSON.parse(raw) : {}

      if (!res.ok) {
        throw new Error(json?.message || `Failed to fetch regions (${res.status})`)
      }

      const regions = json?.regions

      if (!regions?.length) {
        return new Map<string, HttpTypes.StoreRegion>()
      }

      regions.forEach((region: HttpTypes.StoreRegion) => {
        region.countries?.forEach((c) => {
          regionMapCache.regionMap.set(c.iso_2 ?? "", region)
        })
      })

      regionMapCache.regionMapUpdated = Date.now()
    } catch {
      // 开发/验收阶段：regions 拉取失败不阻塞
      return new Map<string, HttpTypes.StoreRegion>()
    }
  }

  return regionMapCache.regionMap
}

/**
 * Fetches regions from Medusa and sets the region cookie.
 * @param request
 * @param response
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    let countryCode

    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase()

    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value
    }

    return countryCode
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Middleware.ts: Error getting the country code. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL."
      )
    }
  }
}

/**
 * Middleware to handle region selection and onboarding status.
 */
export async function middleware(request: NextRequest) {
  let redirectUrl = request.nextUrl.href
  const pathname = request.nextUrl.pathname

  let response = NextResponse.redirect(redirectUrl, 307)

  let cacheIdCookie = request.cookies.get("_medusa_cache_id")

  let cacheId = cacheIdCookie?.value || crypto.randomUUID()

  const regionMap = await getRegionMap(cacheId)

  // 即使 regions 拉取失败，也把无国家码入口兜到默认国家码，避免 storefront 根路径直接 404。
  if (!regionMap.size) {
    const hasDefaultCountryCode =
      pathname === `/${DEFAULT_REGION}` ||
      pathname.startsWith(`/${DEFAULT_REGION}/`)

    if (pathname.includes(".") || hasDefaultCountryCode) {
      return NextResponse.next()
    }

    const redirectPath = pathname === "/" ? "" : pathname
    const queryString = request.nextUrl.search ? request.nextUrl.search : ""

    return NextResponse.redirect(
      `${request.nextUrl.origin}/${DEFAULT_REGION}${redirectPath}${queryString}`,
      307
    )
  }

  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  const urlHasCountryCode =
    countryCode && pathname.split("/")[1].includes(countryCode)

  // if one of the country codes is in the url and the cache id is set, return next
  if (urlHasCountryCode && cacheIdCookie) {
    return NextResponse.next()
  }

  // if one of the country codes is in the url and the cache id is not set, set the cache id and redirect
  if (urlHasCountryCode && !cacheIdCookie) {
    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    })

    return response
  }

  // check if the url is a static asset
  if (pathname.includes(".")) {
    return NextResponse.next()
  }

  const redirectPath =
    pathname === "/" ? "" : pathname

  const queryString = request.nextUrl.search ? request.nextUrl.search : ""

  // If no country code is set, we redirect to the relevant region.
  if (!urlHasCountryCode && countryCode) {
    redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
    response = NextResponse.redirect(`${redirectUrl}`, 307)
  } else if (!urlHasCountryCode && !countryCode) {
    // Handle case where no valid country code exists (empty regions)
    return new NextResponse(
      "No valid regions configured. Please set up regions with countries in your Medusa Admin.",
      { status: 500 }
    )
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
