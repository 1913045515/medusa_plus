import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect, useState } from "react"
import { Button, Container, Heading, Text, toast } from "@medusajs/ui"

type OrderItem = {
  id: string
  quantity: number
  detail?: { fulfilled_quantity?: number }
}

type Order = {
  id: string
  status: string
  items?: OrderItem[]
}

type Props = {
  data: { id: string }
}

const OrderVirtualDeliverWidget = ({ data }: Props) => {
  const orderId = data.id
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/admin/orders/${orderId}?fields=id,status,*items,items.detail.*`,
        { credentials: "include" }
      )
      if (!res.ok) throw new Error("Failed to load order")
      const json = await res.json()
      setOrder(json.order ?? null)
    } catch {
      // silently ignore — widget just won't render
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchOrder()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  const hasUnfulfilled =
    order?.status !== "canceled" &&
    (order?.items ?? []).some((item) => {
      const fulfilled = Number(item.detail?.fulfilled_quantity ?? 0)
      const total = Number(item.quantity ?? 0)
      return total > fulfilled
    })

  const handleMarkDelivered = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/admin/orders/${orderId}/mark-virtual-delivered`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json?.message ?? "操作失败")
      }
      toast.success("虚拟产品已标记为送达")
      await fetchOrder()
    } catch (err: any) {
      toast.error(err?.message ?? "操作失败")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !order || !hasUnfulfilled) return null

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-base">
        <div>
          <Heading level="h2">虚拟产品配送</Heading>
          <Text size="small" className="text-ui-fg-muted mt-0.5">
            此订单包含无需实物发货的虚拟产品（数字下载 / 课程）
          </Text>
        </div>
        <Button
          variant="primary"
          size="small"
          isLoading={submitting}
          onClick={handleMarkDelivered}
        >
          标记虚拟产品已送达
        </Button>
      </div>
      <div className="px-6 py-4">
        <Text size="small" className="text-ui-fg-subtle">
          点击上方按钮将为所有未履行的商品创建一条履行记录，并直接标记为「已送达」，订单状态将随之更新，无需填写物流信息。
        </Text>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.before",
})

export default OrderVirtualDeliverWidget
