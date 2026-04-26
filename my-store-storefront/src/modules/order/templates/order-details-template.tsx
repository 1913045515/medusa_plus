"use client"

import { XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import type { OrderDictionary } from "@lib/i18n/dictionaries"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import OrderSummary from "@modules/order/components/order-summary"
import ShippingDetails from "@modules/order/components/shipping-details"
import React from "react"

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
  dict: OrderDictionary
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
  dict,
}) => {
  return (
    <div className="flex flex-col justify-center gap-y-4">
      <div className="flex gap-2 justify-between items-center">
        <h1 className="text-2xl-semi">{dict.orderDetailsTitle}</h1>
        <LocalizedClientLink
          href="/account/orders"
          className="flex gap-2 items-center text-ui-fg-subtle hover:text-ui-fg-base"
          data-testid="back-to-overview-button"
        >
          <XMark /> {dict.backToOverview}
        </LocalizedClientLink>
      </div>
      <div
        className="flex h-full w-full flex-col gap-6 rounded-[28px] border border-[#e3d5c1] bg-white/92 px-5 py-6 shadow-[0_18px_50px_rgba(74,53,24,0.07)] sm:px-7 sm:py-8"
        data-testid="order-details-container"
      >
        <OrderDetails order={order} showStatus dict={dict} />
        <Items order={order} dict={dict} />
        <ShippingDetails order={order} dict={dict} />
        <OrderSummary order={order} />
        <Help />
      </div>
    </div>
  )
}

export default OrderDetailsTemplate
