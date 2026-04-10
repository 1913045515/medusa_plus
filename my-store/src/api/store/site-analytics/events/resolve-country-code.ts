import { MedusaRequest } from "@medusajs/framework/http"
import geoip from "geoip-lite"

const COUNTRY_HEADER_NAMES = [
  "cf-ipcountry",
  "x-vercel-ip-country",
  "cloudfront-viewer-country",
  "fly-client-ip-country-code",
  "x-country-code",
  "x-country",
]

const INVALID_COUNTRY_CODES = new Set(["xx", "t1"])

function readHeader(req: MedusaRequest, name: string): string | null {
  const value = (req.headers as Record<string, string | string[] | undefined>)?.[name.toLowerCase()]

  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

function normalizeCountryCode(value: string | null): string | null {
  if (!value) {
    return null
  }

  const normalized = value.trim().toLowerCase()

  if (!/^[a-z]{2}$/.test(normalized) || INVALID_COUNTRY_CODES.has(normalized)) {
    return null
  }

  return normalized
}

function lookupCountryByIp(ip: string | null | undefined): string | null {
  if (!ip) {
    return null
  }

  // 去掉 IPv6 映射前缀 ::ffff:
  const cleanIp = ip.replace(/^::ffff:/, "")

  // 私有/回环地址无法查到国家
  if (
    cleanIp === "127.0.0.1" ||
    cleanIp === "::1" ||
    /^10\./.test(cleanIp) ||
    /^192\.168\./.test(cleanIp) ||
    /^172\.(1[6-9]|2[0-9]|3[01])\./.test(cleanIp)
  ) {
    return null
  }

  try {
    const geo = geoip.lookup(cleanIp)
    return normalizeCountryCode(geo?.country ?? null)
  } catch {
    return null
  }
}

export function resolveRequestCountryCode(
  req: MedusaRequest,
  ipAddress?: string | null,
  clientIp?: string | null
): string | null {
  // 1. 代理/边缘层注入的国家头（Cloudflare、Vercel、CloudFront 等）
  for (const headerName of COUNTRY_HEADER_NAMES) {
    const countryCode = normalizeCountryCode(readHeader(req, headerName))
    if (countryCode) {
      return countryCode
    }
  }

  // 2. 浏览器主动探测到的外网 IP（本地开发时可获取到真实出口 IP）
  const fromClientIp = lookupCountryByIp(clientIp)
  if (fromClientIp) {
    return fromClientIp
  }

  // 3. 请求入口的服务端 IP（通过 x-forwarded-for 等请求头）
  const serverIp =
    ipAddress ??
    readHeader(req, "x-forwarded-for")?.split(",")[0]?.trim() ??
    readHeader(req, "x-real-ip") ??
    (req.ip as string | undefined) ??
    null

  return lookupCountryByIp(serverIp)
}