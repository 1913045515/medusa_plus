"use client"

import { PayPalScriptProvider } from "@paypal/react-paypal-js"
import React, { createContext, useContext, useEffect, useState } from "react"

type PayPalConfig = {
  enabled: boolean
  client_id?: string
  mode?: "sandbox" | "live"
  card_fields_enabled?: boolean
}

const PayPalConfigContext = createContext<PayPalConfig>({ enabled: false })
// loading: undefined = still fetching, false = done
const PayPalLoadingContext = createContext<boolean>(true)

export const usePayPalConfig = () => useContext(PayPalConfigContext)
export const usePayPalLoading = () => useContext(PayPalLoadingContext)

type PayPalProviderProps = {
  currencyCode?: string
  children: React.ReactNode
}

export default function PayPalProvider({
  children,
  currencyCode,
}: PayPalProviderProps) {
  const [config, setConfig] = useState<PayPalConfig>({ enabled: false })
  const [loading, setLoading] = useState(true)
  const currency = (currencyCode || "USD").toUpperCase()

  useEffect(() => {
    // Use the Next.js API proxy route instead of calling Medusa backend directly.
    // In production, /store/* is routed by nginx to Next.js, not to the Medusa backend.
    fetch("/api/paypal-config", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { enabled: false }))
      .then((data) => setConfig(data))
      .catch(() => setConfig({ enabled: false }))
      .finally(() => setLoading(false))
  }, [])

  if (loading || !config.enabled || !config.client_id) {
    return (
      <PayPalLoadingContext.Provider value={loading}>
        <PayPalConfigContext.Provider value={config}>
          {children}
        </PayPalConfigContext.Provider>
      </PayPalLoadingContext.Provider>
    )
  }

  return (
    <PayPalScriptProvider
      key={`${config.client_id}-${config.mode}-${currency}-${config.card_fields_enabled ? "card-fields" : "buttons"}`}
      options={{
        clientId: config.client_id,
        currency,
        intent: "capture",
        components: config.card_fields_enabled
          ? "buttons,card-fields"
          : "buttons",
        ...(config.mode === "sandbox" ? { "data-client-token": undefined } : {}),
      }}
    >
      <PayPalLoadingContext.Provider value={loading}>
        <PayPalConfigContext.Provider value={config}>
          {children}
        </PayPalConfigContext.Provider>
      </PayPalLoadingContext.Provider>
    </PayPalScriptProvider>
  )
}
