import { Metadata } from "next"
import { retrieveCustomer } from "@lib/data/customer"
import TicketChatClient from "@modules/ticket/components/ticket-chat-client"

export const metadata: Metadata = {
  title: "工单详情",
}

type Props = {
  params: Promise<{ countryCode: string; id: string }>
}

export default async function TicketDetailPage({ params }: Props) {
  const { countryCode, id } = await params
  const customer = await retrieveCustomer()

  return (
    <TicketChatClient
      ticketId={id}
      customerEmail={customer?.email ?? null}
      countryCode={countryCode}
    />
  )
}
