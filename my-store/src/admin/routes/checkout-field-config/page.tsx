import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CreditCard } from "@medusajs/icons"
import { useEffect, useState } from "react"
import {
  Button,
  Container,
  Heading,
  Switch,
  Text,
  toast,
  Badge,
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

type FieldConfig = { visible: boolean; required: boolean }
type SectionConfig = Record<string, FieldConfig>
type CheckoutFieldsConfig = { shipping: SectionConfig; billing: SectionConfig }

type ConfigResponse = { checkout_fields: CheckoutFieldsConfig }

const FIELD_LABELS: Record<string, string> = {
  first_name: "名字 (First name)",
  last_name: "姓氏 (Last name)",
  address_1: "地址 (Address)",
  company: "公司 (Company)",
  postal_code: "邮政编码 (Postal code)",
  city: "城市 (City)",
  country_code: "国家 (Country)",
  province: "省份 (State / Province)",
  phone: "电话 (Phone)",
}

// country_code visible 系统锁定（只能改 required）
const COUNTRY_VISIBLE_LOCKED = true

function FieldRow({
  fieldKey,
  config,
  onChange,
  section,
}: {
  fieldKey: string
  config: FieldConfig
  onChange: (section: "shipping" | "billing", key: string, type: "visible" | "required", value: boolean) => void
  section: "shipping" | "billing"
}) {
  const isCountry = fieldKey === "country_code"
  const isVisibleLocked = isCountry

  return (
    <div className="flex items-center justify-between py-3 border-b border-ui-border-base last:border-0">
      <div className="min-w-[200px]">
        <Text weight="plus" className="text-sm">{FIELD_LABELS[fieldKey] ?? fieldKey}</Text>
        {isCountry && (
          <Text className="text-xs text-ui-fg-muted mt-0.5">涉及区域计税，不可隐藏</Text>
        )}
      </div>
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <Text className="text-sm text-ui-fg-subtle">显示</Text>
          {isVisibleLocked ? (
            <Badge size="xsmall" color="grey">锁定</Badge>
          ) : (
            <Switch
              checked={config.visible}
              onCheckedChange={(val) => onChange(section, fieldKey, "visible", val)}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Text className="text-sm text-ui-fg-subtle">必填</Text>
          <Switch
            checked={config.required}
            disabled={!config.visible && !isVisibleLocked}
            onCheckedChange={(val) => onChange(section, fieldKey, "required", val)}
          />
        </div>
      </div>
    </div>
  )
}

const FIELD_ORDER = [
  "first_name",
  "last_name",
  "address_1",
  "company",
  "postal_code",
  "city",
  "country_code",
  "province",
  "phone",
]

export default function CheckoutFieldConfigPage() {
  const [config, setConfig] = useState<CheckoutFieldsConfig | null>(null)
  const [originalConfig, setOriginalConfig] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiFetch<ConfigResponse>("/store-settings/checkout-fields")
      .then((data) => {
        setConfig(data.checkout_fields)
        setOriginalConfig(JSON.stringify(data.checkout_fields))
      })
      .catch((err) => toast.error("加载配置失败", { description: err.message }))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (
    section: "shipping" | "billing",
    key: string,
    type: "visible" | "required",
    value: boolean
  ) => {
    setConfig((prev) => {
      if (!prev) return prev
      const updated = {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: { ...prev[section][key], [type]: value },
        },
      }
      // 如果设为不可见，则同时设为非必填
      if (type === "visible" && !value) {
        updated[section][key].required = false
      }
      return updated
    })
  }

  const handleSave = async () => {
    if (!config) return
    setSaving(true)
    try {
      const data = await apiFetch<ConfigResponse>("/store-settings/checkout-fields", {
        method: "PUT",
        body: JSON.stringify({ checkout_fields: config }),
      })
      setConfig(data.checkout_fields)
      setOriginalConfig(JSON.stringify(data.checkout_fields))
      toast.success("结算字段配置已保存")
    } catch (err: any) {
      toast.error("保存失败", { description: err.message })
    } finally {
      setSaving(false)
    }
  }

  const isDirty = config !== null && JSON.stringify(config) !== originalConfig

  if (loading) {
    return (
      <Container>
        <Text className="text-ui-fg-subtle">加载中...</Text>
      </Container>
    )
  }

  if (!config) return null

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Heading level="h1">结算字段配置</Heading>
          <Text className="text-ui-fg-subtle mt-1">
            控制结算页面各字段的显示与必填状态。Email 字段系统锁定，始终显示且必填。
          </Text>
        </div>
      </div>

      {/* Email 锁定说明 */}
      <div className="border border-ui-border-base rounded-lg p-4 mb-6 bg-ui-bg-subtle">
        <div className="flex items-center justify-between">
          <div>
            <Text weight="plus" className="text-sm">邮箱 (Email)</Text>
            <Text className="text-xs text-ui-fg-muted mt-0.5">系统锁定：用于订单确认和账号注册，不可配置</Text>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Text className="text-sm text-ui-fg-subtle">显示</Text>
              <Badge size="xsmall" color="green">锁定</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Text className="text-sm text-ui-fg-subtle">必填</Text>
              <Badge size="xsmall" color="green">锁定</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* 收货地址字段 */}
      <div className="border border-ui-border-base rounded-lg p-6 mb-6">
        <Heading level="h2" className="text-xl mb-4">收货地址字段</Heading>
        {FIELD_ORDER.map((key) => (
          config.shipping[key] !== undefined && (
            <FieldRow
              key={key}
              fieldKey={key}
              config={config.shipping[key]}
              section="shipping"
              onChange={handleChange}
            />
          )
        ))}
      </div>

      {/* 账单地址字段 */}
      <div className="border border-ui-border-base rounded-lg p-6 mb-6">
        <Heading level="h2" className="text-xl mb-4">账单地址字段（独立账单地址时）</Heading>
        {FIELD_ORDER.map((key) => (
          config.billing[key] !== undefined && (
            <FieldRow
              key={key}
              fieldKey={key}
              config={config.billing[key]}
              section="billing"
              onChange={handleChange}
            />
          )
        ))}
      </div>

      {/* 虚拟产品说明 */}
      <div className="border border-ui-border-base rounded-lg p-4 mb-6 bg-ui-bg-subtle">
        <Text weight="plus" className="text-sm">虚拟产品简化模式</Text>
        <Text className="text-xs text-ui-fg-muted mt-1">
          当购物车内全为虚拟产品（数字课程等）时，前端自动仅显示 Email 字段，忽略以上所有地址配置。
        </Text>
      </div>

      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSave}
          isLoading={saving}
          disabled={!isDirty}
        >
          保存配置
        </Button>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "结算字段配置",
  icon: CreditCard,
})
