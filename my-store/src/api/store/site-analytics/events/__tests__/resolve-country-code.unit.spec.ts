import type { MedusaRequest } from "@medusajs/framework/http"
import { resolveRequestCountryCode } from "../resolve-country-code"

jest.mock("geoip-lite", () => {
  const lookup = (ip: string) => {
    if (ip === "8.8.8.8") return { country: "US" }
    if (ip === "1.1.1.1") return { country: "AU" }
    return null
  }
  return { __esModule: true, default: { lookup }, lookup }
})

function makeRequest(
  headers: Record<string, string | string[] | undefined>,
  ip?: string
): MedusaRequest {
  return { headers, ip } as MedusaRequest
}

describe("resolveRequestCountryCode", () => {
  it("prefers proxy-provided country headers over everything else", () => {
    const req = makeRequest({ "cf-ipcountry": "DE", "x-vercel-ip-country": "US" })

    expect(resolveRequestCountryCode(req)).toBe("de")
  })

  it("returns null for invalid or placeholder country codes in headers", () => {
    const req = makeRequest({ "cf-ipcountry": "XX", "x-country": "Europe" })

    expect(resolveRequestCountryCode(req)).toBeNull()
  })

  it("falls back to later supported headers when earlier ones are absent", () => {
    const req = makeRequest({ "cloudfront-viewer-country": "FR" })

    expect(resolveRequestCountryCode(req)).toBe("fr")
  })

  it("falls back to geoip lookup using the explicit clientIp argument", () => {
    const req = makeRequest({})

    expect(resolveRequestCountryCode(req, null, "8.8.8.8")).toBe("us")
  })

  it("falls back to geoip lookup using req.ip when no header and no clientIp", () => {
    const req = makeRequest({}, "1.1.1.1")

    expect(resolveRequestCountryCode(req)).toBe("au")
  })

  it("prefers clientIp geoip over server-side req.ip", () => {
    // req.ip 是 1.1.1.1 (AU)，但 clientIp 是 8.8.8.8 (US)，应以 clientIp 为准
    const req = makeRequest({}, "1.1.1.1")

    expect(resolveRequestCountryCode(req, null, "8.8.8.8")).toBe("us")
  })

  it("returns null for private/loopback IPs", () => {
    const req = makeRequest({}, "192.168.1.1")

    expect(resolveRequestCountryCode(req)).toBeNull()
  })

  it("returns null when geoip has no record for the IP", () => {
    const req = makeRequest({})

    expect(resolveRequestCountryCode(req, "203.0.113.1")).toBeNull()
  })
})