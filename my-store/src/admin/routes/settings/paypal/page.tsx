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
        toast.error("加载 PayPal 配置失败", { description: err.message })
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!clientId.trim()) {
      toast.error("请填写 Client ID")
      return
    }
    if (!clientSecret.trim() || clientSecret === "••••••••") {
      toast.error("请填写 Client Secret（完整密钥）")
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
      toast.success("PayPal 配置已保存")
    } catch (err: any) {
      toast.error("保存失败", { description: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    if (!hasExistingConfig) {
      toast.warning("请先保存配置，再测试连接")
      return
    }
    setTesting(true)
    try {
      const result = await apiFetch<TestConnectionResponse>(
        "/paypal/test-connection",
        { method: "POST" }
      )
      if (result.success) {
        toast.success(`PayPal 连接成功（${result.environment === "live" ? "正式环境" : "沙盒环境"}）`)
      } else {
        toast.error("PayPal 连接失败", { description: result.error })
      }
    } catch (err: any) {
      toast.error("测试失败", { description: err.message })
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <Container>
        <Text className="text-ui-fg-subtle">加载中…</Text>
      </Container>
    )
  }

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Heading level="h1">PayPal 支付配置</Heading>
          <Text className="text-ui-fg-subtle mt-1">
            配置 PayPal 商业账号的 API 密钥，支持沙盒与正式环境切换
          </Text>
        </div>
      </div>

      {/* Live environment warning banner */}
      {mode === "live" && hasExistingConfig && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-orange-300 bg-orange-50 p-4">
          <div className="h-2 w-2 rounded-full bg-orange-500 flex-shrink-0" />
          <Text className="text-orange-800 font-medium">
            ⚠️ 当前为正式环境 (Live) — 配置变更将直接影响真实支付交易，请谨慎操作
          </Text>
        </div>
      )}

      <div className="space-y-6 border border-ui-border-base rounded-lg p-6">
        {/* Mode selector */}
        <div className="flex flex-col gap-2">
          <Label>支付环境</Label>
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
              沙盒环境 (Sandbox)
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
              正式环境 (Live)
            </button>
          </div>
          <Text className="text-ui-fg-muted text-sm">
            {mode === "sandbox"
              ? "使用沙盒密钥进行测试，不产生真实交易"
              : "使用正式密钥处理真实支付，请确保已完成沙盒测试"}
          </Text>
        </div>

        {/* Client ID */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="client-id">Client ID</Label>
          <Input
            id="client-id"
            type="text"
            placeholder={`PayPal ${mode === "sandbox" ? "沙盒" : "正式"} Client ID`}
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          />
          <Text className="text-ui-fg-muted text-sm">
            来自 PayPal 开发者后台 → My Apps &amp; Credentials → {mode === "sandbox" ? "Sandbox" : "Live"} → App Details
          </Text>
        </div>

        {/* Client Secret */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="client-secret">Client Secret</Label>
          <div className="relative flex items-center gap-2">
            <Input
              id="client-secret"
              type={showSecret ? "text" : "password"}
              placeholder="输入新的 Client Secret（留空则保持原有密钥不变）"
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
              {showSecret ? "隐藏" : "显示"}
            </Button>
          </div>
          {hasExistingConfig && (
            <Text className="text-ui-fg-muted text-sm">
              已有配置（掩码显示）。如需更新密钥，请在上方输入新的完整 Secret。
            </Text>
          )}
        </div>

        {/* Credit Card Fields toggle */}
        <div className="flex items-center justify-between p-4 border border-ui-border-base rounded-lg">
          <div>
            <Text weight="plus">信用卡支付表单</Text>
            <Text className="text-ui-fg-subtle text-sm mt-1">
              启用 PayPal 托管信用卡表单（需要在 PayPal 后台开启 Advanced Credit and Debit Card Payments）
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
            保存配置
          </Button>
          <Button
            variant="secondary"
            onClick={handleTestConnection}
            isLoading={testing}
          >
            测试连接
          </Button>
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "PayPal 支付",
  icon: CreditCard,
})
