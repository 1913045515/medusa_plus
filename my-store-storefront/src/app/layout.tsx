import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import TicketWidget from "@components/ticket-widget"
import { getLocale } from "@lib/data/locale-actions"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const [locale, customer] = await Promise.all([
    getLocale(),
    retrieveCustomer().catch(() => null),
  ])
  return (
    <html lang="en" data-mode="light">
      <body className="flex flex-col min-h-screen">
        <main className="relative flex flex-col flex-1">{props.children}</main>
        <TicketWidget locale={locale} customerEmail={customer?.email ?? null} />
      </body>
    </html>
  )
}
