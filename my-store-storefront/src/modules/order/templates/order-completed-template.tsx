import { Heading } from "@medusajs/ui"
import { cookies as nextCookies } from "next/headers"
import type { OrderDictionary } from "@lib/i18n/dictionaries"

import CartTotals from "@modules/common/components/cart-totals"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import { HttpTypes } from "@medusajs/types"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
  dict: OrderDictionary
}

export default async function OrderCompletedTemplate({
  order,
  dict,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  return (
    <div className="min-h-[calc(100vh-64px)] py-8 sm:py-12">
      <div className="content-container flex h-full w-full flex-col gap-y-8">
        {isOnboarding && <OnboardingCta orderId={order.id} />}
        <div
          className="flex w-full max-w-[1120px] flex-col gap-6 rounded-[28px] border border-[#e3d5c1] bg-white/92 px-5 py-6 shadow-[0_18px_50px_rgba(74,53,24,0.07)] sm:px-8 sm:py-10"
          data-testid="order-complete-container"
        >
          <Heading
            level="h1"
            className="mb-2 flex flex-col gap-y-3 text-3xl text-ui-fg-base"
          >
            <span>{dict.thankYou}</span>
            <span>{dict.orderPlacedSuccessfully}</span>
          </Heading>
          <OrderDetails order={order} dict={dict} />
          <Heading level="h2" className="flex flex-row text-3xl-regular">
            {dict.summary}
          </Heading>
          <Items order={order} dict={dict} />
          <CartTotals totals={order} />
          <ShippingDetails order={order} dict={dict} />
          <PaymentDetails order={order} />
          <Help />
        </div>
      </div>
    </div>
  )
}
