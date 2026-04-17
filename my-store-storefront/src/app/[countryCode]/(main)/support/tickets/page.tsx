import { Metadata } from "next"
import { retrieveCustomer } from "@lib/data/customer"
import TicketListClient from "@modules/ticket/components/ticket-list-client"

export const metadata: Metadata = {
  title: "我的工单",
  description: "联系客服，提交和查看支持工单",
}

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function SupportTicketsPage({ params }: Props) {
  const { countryCode } = await params
  const customer = await retrieveCustomer()

  return (
    <TicketListClient
      customerEmail={customer?.email ?? null}
      countryCode={countryCode}
    />
  )
}
