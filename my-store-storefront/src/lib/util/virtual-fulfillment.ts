import { HttpTypes } from "@medusajs/types"

import { readVirtualOrderFulfillment } from "./virtual-order"

type MetadataRecord = Record<string, unknown> | null | undefined

const hasVirtualMetadataFlag = (metadata: MetadataRecord) => {
  return metadata?.is_virtual === true
}

export const isVirtualCartItem = (
  item: Pick<HttpTypes.StoreCartLineItem, "product" | "metadata"> | null | undefined
) => {
  if (!item) {
    return false
  }

  return hasVirtualMetadataFlag(
    (item.product?.metadata as MetadataRecord) ??
      (item.metadata as MetadataRecord) ??
      null
  )
}

export const isVirtualOnlyCart = (
  cart:
    | Pick<
        HttpTypes.StoreCart,
        "items" | "shipping_address" | "billing_address" | "region"
      >
    | null
    | undefined
) => {
  const items = cart?.items ?? []

  return items.length > 0 && items.every((item) => isVirtualCartItem(item))
}

export const isVirtualOrderItem = (
  item: Pick<HttpTypes.StoreOrderLineItem, "product" | "metadata"> | null | undefined
) => {
  if (!item) {
    return false
  }

  return Boolean(
    readVirtualOrderFulfillment((item.metadata as MetadataRecord) ?? null) ||
      hasVirtualMetadataFlag((item.product?.metadata as MetadataRecord) ?? null)
  )
}

export const isVirtualOnlyOrder = (
  order: Pick<HttpTypes.StoreOrder, "items"> | null | undefined
) => {
  const items = order?.items ?? []

  return items.length > 0 && items.every((item) => isVirtualOrderItem(item))
}

export const getCheckoutCountryCode = (
  cart:
    | Pick<
        HttpTypes.StoreCart,
        "shipping_address" | "billing_address" | "region"
      >
    | null
    | undefined
) => {
  return (
    cart?.shipping_address?.country_code ||
    cart?.billing_address?.country_code ||
    cart?.region?.countries?.[0]?.iso_2 ||
    null
  )
}

const INCOMPLETE_DIGITAL_PAYMENT_STATUSES = new Set([
  "canceled",
  "not_paid",
  "pending",
  "requires_action",
])

export const getDisplayFulfillmentStatus = (
  order: Pick<HttpTypes.StoreOrder, "items" | "fulfillment_status" | "payment_status">
) => {
  if (!isVirtualOnlyOrder(order)) {
    return order.fulfillment_status
  }

  if (INCOMPLETE_DIGITAL_PAYMENT_STATUSES.has(order.payment_status || "")) {
    return order.payment_status
  }

  return "completed"
}