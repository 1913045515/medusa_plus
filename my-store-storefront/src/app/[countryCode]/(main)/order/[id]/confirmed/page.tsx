import { retrieveOrder } from "@lib/data/orders"
import { getOrderDictionary } from "@lib/i18n/dictionaries"
import { getLocale } from "@lib/data/locale-actions"
import OrderCompletedTemplate from "@modules/order/templates/order-completed-template"
import { Metadata } from "next"
import { notFound } from "next/navigation"

type Props = {
  params: Promise<{ id: string }>
}
export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "You purchase was successful",
}

export default async function OrderConfirmedPage(props: Props) {
  const params = await props.params
  const order = await retrieveOrder(params.id).catch(() => null)
  const locale = await getLocale()

  if (!order) {
    return notFound()
  }

  return <OrderCompletedTemplate order={order} dict={getOrderDictionary(locale)} />
}
