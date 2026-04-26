import { getCheckoutFieldConfig } from "@lib/data/checkout-config"
import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { isVirtualOnlyCart } from "@lib/util/virtual-fulfillment"
import { HttpTypes } from "@medusajs/types"
import Addresses from "@modules/checkout/components/addresses"
import Payment from "@modules/checkout/components/payment"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) {
    return null
  }

  const isVirtualCart = isVirtualOnlyCart(cart)
  const shippingMethods = isVirtualCart
    ? []
    : (await listCartShippingMethods(cart.id)) ?? []
  const paymentMethods =
    (await listCartPaymentMethods(cart.region?.id ?? "")) ?? []
  const fieldConfig = await getCheckoutFieldConfig()

  return (
    <div className="w-full grid grid-cols-1 gap-y-8">
      <Addresses cart={cart} customer={customer} fieldConfig={fieldConfig} />

      {!isVirtualCart && (
        <Shipping cart={cart} availableShippingMethods={shippingMethods} />
      )}

      <PaymentWrapper cart={cart}>
        <Payment cart={cart} availablePaymentMethods={paymentMethods} />

        <Review cart={cart} />
      </PaymentWrapper>
    </div>
  )
}
