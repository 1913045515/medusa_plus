import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout",
}

export default async function Checkout() {
  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()

  return (
    <div className="content-container grid grid-cols-1 items-start gap-8 py-8 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-12 xl:py-12">
      <CheckoutForm cart={cart} customer={customer} />
      <CheckoutSummary cart={cart} />
    </div>
  )
}
