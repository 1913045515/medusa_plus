import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CreditCard } from "@medusajs/icons"
import { useEffect, useState } from "react"
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Switch,
  Text,
  toast,
} from "@medusajs/ui"

const BASE = "/admin"

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).message ?? `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

type PaypalConfigResponse = {
  paypal_config: {
    id: string
    client_id: string
    client_secret: string
    mode: string
    card_fields_enabled: boolean
  } | null
}

type TestConnectionResponse = {
  success: boolean
  environment?: string
  error?: string
}

export default function PayPalSettingsPage() {
  const [clientId, setClientId] = useState("")
  const [clientSecret, setClientSecret] = useState("")
  const [mode, setMode] = useState<"sandbox" | "live">("sandbox")
  const [cardFieldsEnabled, setCardFieldsEnabled] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [hasExistingConfig, setHasExistingConfig] = useState(false)

  useEffect(() => {
    apiFetch<PaypalConfigResponse>("/paypal")
      .then((data) => {
        if (data.paypal_config) {
          setClientId(data.paypal_config.client_id)
          setClientSecret(data.paypal_config.client_secret)
          setMode(data.paypal_config.mode as "sandbox" | "live")
          setCardFieldsEnabled(data.paypal_config.card_fields_enabled)
          setHasExistingConfig(true)
        }
      })
      .catch((err) => {
        toast.error("Failed to load PayPal configuration", { description: err.message })
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!clientId.trim()) {
      toast.error("Please enter your Client ID")
      return
    }
    if (!clientSecret.trim() || clientSecret === "••••••••") {
      toast.error("Please enter a valid Client Secret")
      return
    }
    setSaving(true)
    try {
      await apiFetch<PaypalConfigResponse>("/paypal", {
        method: "POST",
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          mode,
          card_fields_enabled: cardFieldsEnabled,
        }),
      })
      setHasExistingConfig(true)
      toast.success("PayPal configuration saved successfully")
    } catch (err: any) {
      toast.error("Failed to save configuration", { description: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    if (!hasExistingConfig) {
      toast.warning("Please save your configuration before testing the connection")
      return
    }
      setTesting(true)
      try {
        const result = await apiFetch<TestConnectionResponse>("/paypal", {
          method: "POST",
          body: JSON.stringify({ action: "test-connection" }),
        })
      if (result.success) {
        toast.success(`PayPal connection successful (${result.environment === "live" ? "Live" : "Sandbox"} environment)`)
      } else {
        toast.error("PayPal connection failed", { description: result.error })
      }
    } catch (err: any) {
      toast.error("Connection test failed", { description: err.message })
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <Container>
        <Text className="text-ui-fg-subtle">Loading...</Text>
      </Container>
    )
  }

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Heading level="h1">PayPal Payment Configuration</Heading>
          <Text className="text-ui-fg-subtle mt-1">
            Configure your PayPal business account API credentials. Supports both Sandbox and Live environments.
          </Text>
        </div>
      </div>

      {/* Live environment warning banner */}
      {mode === "live" && hasExistingConfig && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-orange-300 bg-orange-50 p-4">
          <div className="h-2 w-2 rounded-full bg-orange-500 flex-shrink-0" />
          <Text className="text-orange-800 font-medium">
            ⚠️ Live environment is active — changes will affect real payment transactions. Proceed with caution.
          </Text>
        </div>
      )}

      <div className="space-y-6 border border-ui-border-base rounded-lg p-6">
        {/* Mode selector */}
        <div className="flex flex-col gap-2">
          <Label>Payment Environment</Label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setMode("sandbox")}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                mode === "sandbox"
                  ? "bg-ui-button-inverted text-ui-button-inverted border-ui-button-inverted text-white bg-blue-600 border-blue-600"
                  : "border-ui-border-base text-ui-fg-base hover:bg-ui-bg-subtle"
              }`}
            >
              Sandbox
            </button>
            <button
              type="button"
              onClick={() => setMode("live")}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                mode === "live"
                  ? "text-white bg-orange-600 border-orange-600"
                  : "border-ui-border-base text-ui-fg-base hover:bg-ui-bg-subtle"
              }`}
            >
              Live
            </button>
          </div>
          <Text className="text-ui-fg-muted text-sm">
            {mode === "sandbox"
              ? "Use Sandbox credentials for testing — no real transactions will occur."
              : "Use Live credentials to process real payments. Ensure Sandbox testing is complete before switching."}
          </Text>
        </div>

        {/* Client ID */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="client-id">Client ID</Label>
          <Input
            id="client-id"
            type="text"
            placeholder={`PayPal ${mode === "sandbox" ? "Sandbox" : "Live"} Client ID`}
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          />
          <Text className="text-ui-fg-muted text-sm">
            Found in the PayPal Developer Dashboard &rarr; My Apps &amp; Credentials &rarr; {mode === "sandbox" ? "Sandbox" : "Live"} &rarr; App Details
          </Text>
        </div>

        {/* Client Secret */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="client-secret">Client Secret</Label>
          <div className="relative flex items-center gap-2">
            <Input
              id="client-secret"
              type={showSecret ? "text" : "password"}
              placeholder="Enter new Client Secret (leave blank to keep existing secret)"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="secondary"
              size="small"
              type="button"
              onClick={() => setShowSecret(!showSecret)}
            >
              {showSecret ? "Hide" : "Show"}
            </Button>
          </div>
          {hasExistingConfig && (
            <Text className="text-ui-fg-muted text-sm">
              A secret is already saved (shown masked). To update it, enter the new full Client Secret above.
            </Text>
          )}
        </div>

        {/* Credit Card Fields toggle */}
        <div className="flex items-center justify-between p-4 border border-ui-border-base rounded-lg">
          <div>
            <Text weight="plus">Credit Card Hosted Fields</Text>
            <Text className="text-ui-fg-subtle text-sm mt-1">
              Enable PayPal-hosted credit card fields (requires Advanced Credit and Debit Card Payments to be enabled in your PayPal account)
            </Text>
          </div>
          <Switch
            checked={cardFieldsEnabled}
            onCheckedChange={setCardFieldsEnabled}
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} isLoading={saving}>
            Save Configuration
          </Button>
          <Button
            variant="secondary"
            onClick={handleTestConnection}
            isLoading={testing}
          >
            Test Connection
          </Button>
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "PayPal Payments",
  icon: CreditCard,
})
