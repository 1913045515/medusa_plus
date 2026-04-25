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

export const usePayPalConfig = () => useContext(PayPalConfigContext)

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

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
    fetch(`${BACKEND_URL}/store/paypal/config`, {
      credentials: "include",
      headers: { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "" },
    })
      .then((res) => (res.ok ? res.json() : { enabled: false }))
      .then((data) => setConfig(data))
      .catch(() => setConfig({ enabled: false }))
      .finally(() => setLoading(false))
  }, [])

  if (loading || !config.enabled || !config.client_id) {
    return (
      <PayPalConfigContext.Provider value={config}>
        {children}
      </PayPalConfigContext.Provider>
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
      <PayPalConfigContext.Provider value={config}>
        {children}
      </PayPalConfigContext.Provider>
    </PayPalScriptProvider>
  )
}
