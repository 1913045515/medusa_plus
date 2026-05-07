import { defineRouteConfig } from "@medusajs/admin-sdk"
import { EnvelopeSolid } from "@medusajs/icons"
import { useEffect, useState } from "react"
import {
  Button,
  Container,
  Heading,
  Input,
  Text,
  toast,
  Label,
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

type SmtpConfig = {
  host: string
  port: number
  user: string
  pass: string
  fromName: string
}

type ConfigResponse = { email_proxy: SmtpConfig }

const DEFAULT_CONFIG: SmtpConfig = {
  host: "smtp.qq.com",
  port: 587,
  user: "",
  pass: "",
  fromName: "商店通知",
}

export default function EmailProxyPage() {
  const [config, setConfig] = useState<SmtpConfig>(DEFAULT_CONFIG)
  // 是否已有保存的授权码（API 返回 *** 代表已设置）
  const [hasSavedPass, setHasSavedPass] = useState(false)
  const [originalConfig, setOriginalConfig] = useState<string>(JSON.stringify(DEFAULT_CONFIG))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    apiFetch<ConfigResponse>("/store-settings/email-proxy")
      .then((data) => {
        const raw = { ...DEFAULT_CONFIG, ...data.email_proxy }
        const passIsMasked = raw.pass === "***"
        setHasSavedPass(passIsMasked)
        // 展示时清空 pass，避免显示 *** 混淤用户
        const cfg = { ...raw, pass: passIsMasked ? "" : raw.pass }
        setConfig(cfg)
        setOriginalConfig(JSON.stringify(cfg))
      })
      .catch((err) => toast.error("加载配置失败", { description: err.message }))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (field: keyof SmtpConfig, value: string | number) => {
    setConfig((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // 如果用户没有输入新授权码但原先已有，发送 *** 让后端保留原存就的
      const sendConfig = {
        ...config,
        pass: !config.pass && hasSavedPass ? "***" : config.pass,
      }
      const data = await apiFetch<ConfigResponse>("/store-settings/email-proxy", {
        method: "PUT",
        body: JSON.stringify({ email_proxy: sendConfig }),
      })
      const raw = { ...DEFAULT_CONFIG, ...data.email_proxy }
      const passIsMasked = raw.pass === "***"
      setHasSavedPass(passIsMasked)
      const updated = { ...raw, pass: passIsMasked ? "" : raw.pass }
      setConfig(updated)
      setOriginalConfig(JSON.stringify(updated))
      toast.success("邮件代理配置已保存")
    } catch (err: any) {
      toast.error("保存失败", { description: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    try {
      const sendConfig = {
        ...config,
        pass: !config.pass && hasSavedPass ? "***" : config.pass,
      }
      const data = await apiFetch<{ success: boolean; message: string }>(
        "/store-settings/email-proxy/test",
        {
          method: "POST",
          body: JSON.stringify({ email_proxy: sendConfig }),
        }
      )
      if (data.success) {
        toast.success("测试成功", { description: data.message })
      } else {
        toast.error("测试失败", { description: data.message })
      }
    } catch (err: any) {
      toast.error("测试失败", { description: err.message })
    } finally {
      setTesting(false)
    }
  }

  // 有未保存的更改
  const isDirty = JSON.stringify(config) !== originalConfig

  if (loading) {
    return (
      <Container>
        <Text className="text-ui-fg-subtle">加载中...</Text>
      </Container>
    )
  }

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Heading level="h1">邮件代理配置</Heading>
          <Text className="text-ui-fg-subtle mt-1">
            配置 QQ 邮箱 SMTP，用于发送订单通知和账号注册邮件。
          </Text>
        </div>
      </div>

      <div className="border border-ui-border-base rounded-lg p-6 mb-4 space-y-4">
        <Heading level="h2" className="text-lg mb-2">SMTP 服务器配置</Heading>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-1 block text-sm" htmlFor="smtp-host">SMTP 服务器</Label>
            <Input
              id="smtp-host"
              value={config.host}
              onChange={(e) => handleChange("host", e.target.value)}
              placeholder="smtp.qq.com"
            />
          </div>
          <div>
            <Label className="mb-1 block text-sm" htmlFor="smtp-port">端口</Label>
            <Input
              id="smtp-port"
              type="number"
              value={String(config.port)}
              onChange={(e) => handleChange("port", parseInt(e.target.value) || 465)}
              placeholder="465"
            />
            <Text className="text-xs text-ui-fg-muted mt-1">
              QQ 邮箱支持 465（SSL）或 587（TLS）。若 465 连接失败请改用 587。
            </Text>
          </div>
        </div>

        <div>
          <Label className="mb-1 block text-sm" htmlFor="smtp-user">QQ 邮箱地址（发件人）</Label>
          <Input
            id="smtp-user"
            type="email"
            value={config.user}
            onChange={(e) => handleChange("user", e.target.value)}
            placeholder="your@qq.com"
          />
        </div>

        <div>
          <Label className="mb-1 block text-sm" htmlFor="smtp-pass">
            QQ 邮箱授权码
          </Label>
          <Input
            id="smtp-pass"
            type="password"
            value={config.pass}
            onChange={(e) => handleChange("pass", e.target.value)}
            placeholder={hasSavedPass ? "──── 授权码已设置，留空保持不变，输入新值可更换 ────" : "在 QQ 邮箱 → 设置 → 账户 → 生成授权码"}
          />
          {hasSavedPass && !config.pass && (
            <Text className="text-xs text-ui-fg-success mt-1">✓ 授权码已保存（出于安全不显示明文，如需更换请输入新授权码）</Text>
          )}
          {!hasSavedPass && (
            <Text className="text-xs text-ui-fg-muted mt-1">
              注意：使用授权码而非 QQ 密码。可在 QQ 邮箱 → 设置 → 账户 → POP3/SMTP 服务 → 生成授权码获取。
            </Text>
          )}
        </div>

        <div>
          <Label className="mb-1 block text-sm" htmlFor="smtp-from-name">发件人名称</Label>
          <Input
            id="smtp-from-name"
            value={config.fromName}
            onChange={(e) => handleChange("fromName", e.target.value)}
            placeholder="商店通知"
          />
        </div>
      </div>

      <div className="border border-ui-border-base rounded-lg p-4 mb-6 bg-ui-bg-subtle">
        <Text weight="plus" className="text-sm">环境变量覆盖</Text>
        <Text className="text-xs text-ui-fg-muted mt-1">
          如已设置环境变量 <code>QQ_SMTP_PASS</code>，系统将优先使用该变量值作为授权码，UI 中配置的授权码作为兜底。
        </Text>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={handleTest}
          isLoading={testing}
          disabled={!config.host || !config.user || (!config.pass && !hasSavedPass)}
        >
          发送测试邮件
        </Button>
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
  label: "emailProxy.menuLabel", translationNs: "translation",
  icon: EnvelopeSolid,
})
