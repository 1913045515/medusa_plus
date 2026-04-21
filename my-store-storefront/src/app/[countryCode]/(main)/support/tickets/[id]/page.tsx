import { Metadata } from "next"
import { retrieveCustomer } from "@lib/data/customer"
import { getLocale } from "@lib/data/locale-actions"
import TicketChatClient from "@modules/ticket/components/ticket-chat-client"

export const metadata: Metadata = {
  title: "Ticket Detail",
}

type Props = {
  params: Promise<{ countryCode: string; id: string }>
}

export default async function TicketDetailPage({ params }: Props) {
  const { countryCode, id } = await params
  const [customer, locale] = await Promise.all([retrieveCustomer(), getLocale()])

  return (
    <TicketChatClient
      ticketId={id}
      customerEmail={customer?.email ?? null}
      countryCode={countryCode}
      locale={locale}
    />
  )
}
