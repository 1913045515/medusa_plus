import { convertToLocale } from "@lib/util/money"
import { Heading, Text } from "@medusajs/ui"

import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"

const CheckoutSummary = ({ cart }: { cart: any }) => {
  return (
    <div className="flex flex-col-reverse gap-y-8 py-2 small:flex-col small:py-0 xl:sticky xl:top-6">
      <div className="flex w-full flex-col rounded-[28px] border border-[#e3d5c1] bg-white/92 px-5 py-6 shadow-[0_18px_50px_rgba(74,53,24,0.07)] sm:px-6 sm:py-7">
        <Divider className="my-6 small:hidden" />
        <Heading
          level="h2"
          className="flex flex-row items-baseline text-[1.55rem] leading-9 text-[#231b14] sm:text-[1.75rem] sm:leading-10"
        >
          In your Cart
        </Heading>
        <Divider className="my-6" />
        <CartTotals totals={cart} />
        <div className="mt-6 space-y-3">
          {(cart.items ?? []).map((item: any) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-[22px] border border-[#eadbc7] bg-[#faf4ea] p-3"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-white/80">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.product_title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-[#efe3d0]" />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1 pt-1">
                <Text className="truncate text-sm font-semibold text-[#231b14]">
                  {item.product_title}
                </Text>
                <Text className="truncate text-xs uppercase tracking-[0.12em] text-[#7a6856]">
                  {item.variant?.title || "Default variant"}
                </Text>
                <Text className="text-xs text-[#7a6856]">
                  Qty {item.quantity}
                </Text>
              </div>
              <div className="pt-1 text-right text-sm font-semibold text-[#2f241a]">
                {convertToLocale({
                  amount: item.total ?? 0,
                  currency_code: cart.currency_code,
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="my-6">
          <DiscountCode cart={cart} />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
