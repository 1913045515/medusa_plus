import {
  createOrderFulfillmentWorkflow,
  markOrderFulfillmentAsDeliveredWorkflow,
} from "@medusajs/core-flows"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * POST /admin/orders/:id/mark-virtual-delivered
 *
 * Creates a fulfillment for all unfulfilled items in the order and immediately
 * marks it as delivered.  Intended for orders that contain only virtual products
 * (digital downloads, courses) which need no physical shipping.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const orderId = req.params.id
  const query = req.scope.resolve("query") as any

  const { data: orders } = await query.graph({
    entity: "orders",
    fields: ["id", "status", "items.*", "items.detail.*"],
    filters: { id: orderId },
  })

  const order = orders?.[0]
  if (!order) {
    return res.status(404).json({ message: "Order not found" })
  }

  if (order.status === "canceled") {
    return res.status(400).json({ message: "Cannot fulfill a canceled order" })
  }

  // Collect items that still need fulfillment
  const unfulfilledItems = (order.items as any[])
    .filter((item) => {
      const fulfilled = Number(item.detail?.fulfilled_quantity ?? 0)
      const total = Number(item.quantity ?? 0)
      return total > fulfilled
    })
    .map((item) => ({
      id: item.id as string,
      quantity: Number(item.quantity) - Number(item.detail?.fulfilled_quantity ?? 0),
    }))

  if (unfulfilledItems.length === 0) {
    return res
      .status(400)
      .json({ message: "All items are already fulfilled" })
  }

  // Create the fulfillment (no physical shipping needed for virtual products)
  const { result: fulfillment } = await createOrderFulfillmentWorkflow(
    req.scope
  ).run({
    input: {
      order_id: orderId,
      items: unfulfilledItems,
      no_notification: true,
      requires_shipping: false,
    },
  })

  // Immediately mark as delivered
  await markOrderFulfillmentAsDeliveredWorkflow(req.scope).run({
    input: {
      orderId,
      fulfillmentId: fulfillment.id,
    },
  })

  return res.json({ success: true, fulfillment_id: fulfillment.id })
}
