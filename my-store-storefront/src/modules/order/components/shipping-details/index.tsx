import { convertToLocale } from "@lib/util/money"
import { isVirtualOnlyOrder } from "@lib/util/virtual-fulfillment"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import type { OrderDictionary } from "@lib/i18n/dictionaries"

import Divider from "@modules/common/components/divider"

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
  dict: OrderDictionary
}

const ShippingDetails = ({ order, dict }: ShippingDetailsProps) => {
  if (isVirtualOnlyOrder(order)) {
    return (
      <div>
        <Heading level="h2" className="my-6 flex flex-row text-[1.55rem] leading-9 text-[#231b14] sm:text-[1.75rem] sm:leading-10">
          {dict.digitalFulfillmentDelivered}
        </Heading>
        <div className="grid gap-6 rounded-[24px] border border-[#e4d7c4] bg-[#faf4ea] p-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-2" data-testid="digital-delivery-order-summary">
            <Text className="txt-medium-plus text-ui-fg-base mb-1">
              {dict.digitalDeliveryTitle}
            </Text>
            <Text className="txt-medium text-ui-fg-subtle">
              {dict.digitalDeliverySummary}
            </Text>
          </div>
          <div className="space-y-2" data-testid="digital-delivery-order-contact">
            <Text className="txt-medium-plus text-ui-fg-base mb-1">
              Contact
            </Text>
            <Text className="txt-medium text-ui-fg-subtle">{order.email}</Text>
          </div>
        </div>
        <Divider className="mt-8" />
      </div>
    )
  }

  return (
    <div>
      <Heading level="h2" className="my-6 flex flex-row text-[1.55rem] leading-9 text-[#231b14] sm:text-[1.75rem] sm:leading-10">
        Delivery
      </Heading>
      <div className="grid gap-5 md:grid-cols-3">
        <div
          className="flex flex-col gap-1.5 rounded-[24px] border border-[#e4d7c4] bg-[#faf4ea] p-5"
          data-testid="shipping-address-summary"
        >
          <Text className="txt-medium-plus text-ui-fg-base mb-1">
            Shipping Address
          </Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {order.shipping_address?.first_name}{" "}
            {order.shipping_address?.last_name}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {order.shipping_address?.address_1}{" "}
            {order.shipping_address?.address_2}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {order.shipping_address?.postal_code},{" "}
            {order.shipping_address?.city}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {order.shipping_address?.country_code?.toUpperCase()}
          </Text>
        </div>

        <div
          className="flex flex-col gap-1.5 rounded-[24px] border border-[#e4d7c4] bg-[#faf4ea] p-5"
          data-testid="shipping-contact-summary"
        >
          <Text className="txt-medium-plus text-ui-fg-base mb-1">Contact</Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {order.shipping_address?.phone}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle">{order.email}</Text>
        </div>

        <div
          className="flex flex-col gap-1.5 rounded-[24px] border border-[#e4d7c4] bg-[#faf4ea] p-5"
          data-testid="shipping-method-summary"
        >
          <Text className="txt-medium-plus text-ui-fg-base mb-1">Method</Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {(order as any).shipping_methods[0]?.name} (
            {convertToLocale({
              amount: order.shipping_methods?.[0].total ?? 0,
              currency_code: order.currency_code,
            })}
            )
          </Text>
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default ShippingDetails
