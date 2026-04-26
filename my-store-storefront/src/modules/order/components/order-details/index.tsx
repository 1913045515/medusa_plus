import { HttpTypes } from "@medusajs/types"
import { getDisplayFulfillmentStatus, isVirtualOnlyOrder } from "@lib/util/virtual-fulfillment"
import { Text } from "@medusajs/ui"
import type { OrderDictionary } from "@lib/i18n/dictionaries"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
  dict: OrderDictionary
}

const OrderDetails = ({ order, showStatus, dict }: OrderDetailsProps) => {
  const formatStatus = (str: string | null | undefined) => {
    if (!str) {
      return "Pending"
    }

    const formatted = str.split("_").join(" ")

    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }

  const displayFulfillmentStatus = getDisplayFulfillmentStatus(order)
  const paymentStatusLabel =
    isVirtualOnlyOrder(order) && !order.payment_status
      ? dict.digitalOrderCompleted
      : formatStatus(order.payment_status)
  const fulfillmentStatusLabel =
    isVirtualOnlyOrder(order) && displayFulfillmentStatus === "completed"
      ? dict.digitalFulfillmentDelivered
      : formatStatus(displayFulfillmentStatus)

  return (
    <div>
      <Text>
        {dict.confirmationSentPrefix}{" "}
        <span
          className="text-ui-fg-medium-plus font-semibold"
          data-testid="order-email"
        >
          {order.email}
        </span>
        .
      </Text>
      <Text className="mt-2">
        {dict.orderDate}:{" "}
        <span data-testid="order-date">
          {new Date(order.created_at).toDateString()}
        </span>
      </Text>
      <Text className="mt-2 text-ui-fg-interactive">
        {dict.orderNumber}: <span data-testid="order-id">{order.display_id}</span>
      </Text>

      <div className="flex items-center text-compact-small gap-x-4 mt-4">
        {showStatus && (
          <>
            <Text>
              {dict.orderStatus}:{" "}
              <span className="text-ui-fg-subtle " data-testid="order-status">
                {fulfillmentStatusLabel}
              </span>
            </Text>
            <Text>
              {dict.paymentStatus}:{" "}
              <span
                className="text-ui-fg-subtle "
                sata-testid="order-payment-status"
              >
                {paymentStatusLabel}
              </span>
            </Text>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
