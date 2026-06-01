import { NextRequest, NextResponse } from "next/server"
import { getServerBackendUrl } from "@lib/util/server-backend-url"

/**
 * POST /weixin-pay
 * 微信支付服务器异步通知入口（商户平台配置的 notify_url 指向这里）。
 *
 * 该路由必须把原始请求 body 与全部 Wechatpay-* 头部，原封不动转发到
 * Medusa 后端 /store/wechat-pay/notify 完成签名校验和解密。
 *
 * ⚠️ 严禁解析/重新序列化 body，否则微信签名校验必然失败。
 */
const BACKEND_URL = getServerBackendUrl(
  process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
)

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { code: "FAIL", message: "Missing MEDUSA_BACKEND_URL" },
      { status: 500 }
    )
  }

  const raw = await req.text()

  const forwardHeaders: Record<string, string> = {
    "Content-Type": req.headers.get("content-type") ?? "application/json",
  }
  for (const h of [
    "wechatpay-timestamp",
    "wechatpay-nonce",
    "wechatpay-signature",
    "wechatpay-serial",
    "wechatpay-signature-type",
  ]) {
    const v = req.headers.get(h)
    if (v) forwardHeaders[h] = v
  }

  // notify 路由在后端 middlewares.ts 已开放为公开，无需 publishable key

  try {
    const res = await fetch(`${BACKEND_URL}/store/wechat-pay/notify`, {
      method: "POST",
      headers: forwardHeaders,
      body: raw,
    })
    const text = await res.text()
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
    })
  } catch (err: any) {
    return NextResponse.json(
      { code: "FAIL", message: err?.message ?? "notify proxy error" },
      { status: 500 }
    )
  }
}
