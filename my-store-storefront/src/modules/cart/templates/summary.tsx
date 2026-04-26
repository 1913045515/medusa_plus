"use client"

import { Button, Heading } from "@medusajs/ui"
import { isVirtualOnlyCart } from "@lib/util/virtual-fulfillment"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (isVirtualOnlyCart(cart)) {
    if (!cart.email || !cart.billing_address?.country_code) {
      return "address"
    }

    return "payment"
  }

  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)

  return (
    <div className="flex flex-col gap-y-5">
      <Heading level="h2" className="text-[1.65rem] leading-9 text-[#231b14] sm:text-[1.85rem] sm:leading-10">
        Summary
      </Heading>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} />
      <LocalizedClientLink
        className="block"
        href={"/checkout?step=" + step}
        data-testid="checkout-button"
      >
        <Button className="h-11 w-full rounded-xl border-0 bg-[#2f3a2f] text-sm font-semibold uppercase tracking-[0.16em] text-[#f4ecdf] hover:bg-[#253025]">
          Go to checkout
        </Button>
      </LocalizedClientLink>
    </div>
  )
}

export default Summary
