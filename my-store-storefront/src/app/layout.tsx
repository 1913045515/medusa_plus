import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import TicketWidget from "@components/ticket-widget"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body className="flex flex-col min-h-screen">
        <main className="relative flex flex-col flex-1">{props.children}</main>
        <TicketWidget />
      </body>
    </html>
  )
}
