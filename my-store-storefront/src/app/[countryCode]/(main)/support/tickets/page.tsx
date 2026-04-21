import { Metadata } from "next"
import { retrieveCustomer } from "@lib/data/customer"
import { getLocale } from "@lib/data/locale-actions"
import TicketListClient from "@modules/ticket/components/ticket-list-client"

export const metadata: Metadata = {
  title: "My Tickets",
  description: "Contact support, submit and view support tickets",
}

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function SupportTicketsPage({ params }: Props) {
  const { countryCode } = await params
  const [customer, locale] = await Promise.all([retrieveCustomer(), getLocale()])

  return (
    <TicketListClient
      customerEmail={customer?.email ?? null}
      countryCode={countryCode}
      locale={locale}
    />
  )
}
