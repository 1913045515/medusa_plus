import { getLocaleHeader } from "@lib/util/get-locale-header"
import Medusa, { FetchArgs, FetchInput } from "@medusajs/js-sdk"

// 服务端（Node.js/SSR）：优先用 Docker 内网地址（docker-compose 注入），无需构建参数
// 浏览器端：用当前访问域名 + /medusa-api，自动适配任意域名/IP，无需构建参数
function getBackendUrl(): string {
  if (typeof window !== "undefined") {
    // 浏览器端：动态取当前 origin，通过 nginx /medusa-api/ 代理到 admin 容器
    return `${window.location.origin}/medusa-api`
  }
  // 服务端：MEDUSA_BACKEND_URL 由 docker-compose environment 注入（http://admin:9000）
  return (
    process.env.MEDUSA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
    "http://localhost:9000"
  )
}

export const sdk = new Medusa({
  baseUrl: getBackendUrl(),
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})

const originalFetch = sdk.client.fetch.bind(sdk.client)

sdk.client.fetch = async <T>(
  input: FetchInput,
  init?: FetchArgs
): Promise<T> => {
  const headers = init?.headers ?? {}
  let localeHeader: Record<string, string | null> | undefined
  try {
    localeHeader = await getLocaleHeader()
    headers["x-medusa-locale"] ??= localeHeader["x-medusa-locale"]
  } catch {}

  const newHeaders = {
    ...localeHeader,
    ...headers,
  }
  init = {
    ...init,
    headers: newHeaders,
  }
  return originalFetch(input, init)
}
