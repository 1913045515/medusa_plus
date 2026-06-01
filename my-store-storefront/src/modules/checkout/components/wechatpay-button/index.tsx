"use client"

import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { useEffect, useRef, useState } from "react"
import ErrorMessage from "../error-message"

type Props = {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}

/**
 * 微信支付 Native 扫码组件
 * 1) 点击「生成微信支付二维码」→ POST /api/wechat-pay/qrcode 取 code_url
 * 2) 渲染二维码（使用免费 QR 服务，生产环境可替换为本地 SVG/canvas 库）
 * 3) 后台轮询 /api/wechat-pay/query 直到 trade_state=SUCCESS
 * 4) 成功后调用 placeOrder() 走 Medusa 下单
 */
const WeChatPayButton = ({ cart, notReady, "data-testid": dataTestId }: Props) => {
  const [codeUrl, setCodeUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paid, setPaid] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  useEffect(() => () => stopPolling(), [])

  const createQrCode = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/wechat-pay/qrcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_id: cart.id }),
      })
      const data = await res.json()
      if (!res.ok || !data?.code_url) {
        throw new Error(data?.message || "生成微信支付二维码失败")
      }
      setCodeUrl(data.code_url as string)
      startPolling()
    } catch (err: any) {
      setError(err?.message ?? "未知错误")
    } finally {
      setLoading(false)
    }
  }

  const startPolling = () => {
    stopPolling()
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/wechat-pay/query?cart_id=${encodeURIComponent(cart.id)}`,
          { cache: "no-store" }
        )
        const data = await res.json()
        if (data?.paid) {
          stopPolling()
          setPaid(true)
          await completeOrder()
        }
      } catch {
        /* swallow, keep polling */
      }
    }, 3000)
  }

  const completeOrder = async () => {
    setPlacingOrder(true)
    try {
      await placeOrder()
    } catch (err: any) {
      setError(err?.message ?? "下单失败")
    } finally {
      setPlacingOrder(false)
    }
  }

  if (!codeUrl) {
    return (
      <div className="space-y-2">
        <Button
          disabled={notReady || loading}
          isLoading={loading}
          onClick={createQrCode}
          size="large"
          data-testid={dataTestId}
        >
          生成微信支付二维码
        </Button>
        <ErrorMessage error={error} data-testid="wechatpay-payment-error-message" />
      </div>
    )
  }

  // 使用 goqr.me 公开 QR 服务渲染二维码（避免新增依赖）；
  // 生产环境如担心外部依赖，可替换为 `qrcode` 库本地生成 dataURL。
  const qrImg = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    codeUrl
  )}`

  return (
    <div className="flex flex-col items-center gap-3 p-4 border border-ui-border-base rounded-lg">
      <p className="text-sm text-ui-fg-subtle">请使用微信扫描二维码完成支付</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrImg} alt="WeChat Pay QR" width={260} height={260} />
      <p className="text-xs text-ui-fg-muted break-all max-w-xs text-center">{codeUrl}</p>
      {paid ? (
        <p className="text-sm text-ui-fg-interactive">
          {placingOrder ? "支付成功，正在下单..." : "支付成功"}
        </p>
      ) : (
        <p className="text-xs text-ui-fg-muted">检测中… 支付完成后将自动跳转</p>
      )}
      <ErrorMessage error={error} data-testid="wechatpay-payment-error-message" />
    </div>
  )
}

export default WeChatPayButton
