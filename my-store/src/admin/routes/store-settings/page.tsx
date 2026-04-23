import { defineRouteConfig } from "@medusajs/admin-sdk"
import { PencilSquare } from "@medusajs/icons"
import { useEffect, useState } from "react"
import {
  Button,
  Container,
  Heading,
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

type StoreSettingsResponse = {
  store_settings: { cart_enabled: boolean }
}

export default function StoreSettingsPage() {
  const [cartEnabled, setCartEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [originalValue, setOriginalValue] = useState(true)

  useEffect(() => {
    apiFetch<StoreSettingsResponse>("/store-settings")
      .then((data) => {
        setCartEnabled(data.store_settings.cart_enabled)
        setOriginalValue(data.store_settings.cart_enabled)
      })
      .catch((err) => {
        toast.error("加载设置失败", { description: err.message })
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = await apiFetch<StoreSettingsResponse>("/store-settings", {
        method: "PUT",
        body: JSON.stringify({ cart_enabled: cartEnabled }),
      })
      setOriginalValue(data.store_settings.cart_enabled)
      setCartEnabled(data.store_settings.cart_enabled)
      toast.success("设置已保存")
    } catch (err: any) {
      toast.error("保存失败", { description: err.message })
      setCartEnabled(originalValue)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Heading level="h1">商店设置</Heading>
          <Text className="text-ui-fg-subtle mt-1">管理商店全局功能开关</Text>
        </div>
      </div>

      <div className="border border-ui-border-base rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <Text weight="plus">购物车功能</Text>
            <Text className="text-ui-fg-subtle text-sm mt-0.5">
              {cartEnabled
                ? "已启用：用户可将商品加入购物车后结算"
                : "已禁用：产品页显示「立即购买」，点击直接进入结算页"}
            </Text>
          </div>
          <Switch
            checked={cartEnabled}
            onCheckedChange={setCartEnabled}
            disabled={loading}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          variant="primary"
          onClick={handleSave}
          isLoading={saving}
          disabled={loading || cartEnabled === originalValue}
        >
          保存设置
        </Button>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "storeSettings.menuLabel", translationNs: "translation",
  icon: PencilSquare,
})
