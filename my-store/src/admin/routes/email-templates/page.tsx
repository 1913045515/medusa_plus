import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText } from "@medusajs/icons"
import { useEffect, useState } from "react"
import {
  Button,
  Container,
  Heading,
  Input,
  Text,
  Tabs,
  toast,
  Label,
  Badge,
  Alert,
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

type EmailTemplate = { subject: string; html: string }
type EmailTemplatesConfig = { guest_register: EmailTemplate; order_placed: EmailTemplate }

const REQUIRED_VARIABLES: Record<string, string[]> = {
  guest_register: ["{{email}}", "{{password}}"],
  order_placed: [],
}

const VARIABLE_DOCS: Record<string, { name: string; desc: string }[]> = {
  guest_register: [
    { name: "{{email}}", desc: "登录邮箱" },
    { name: "{{password}}", desc: "临时密码" },
    { name: "{{store_url}}", desc: "商店网址" },
  ],
  order_placed: [
    { name: "{{order_id}}", desc: "订单编号" },
    { name: "{{email}}", desc: "客户邮箱" },
    { name: "{{order_items_html}}", desc: "订单商品列表（HTML 表格，自动生成）" },
    { name: "{{order_total}}", desc: "订单总金额" },
    { name: "{{currency}}", desc: "货币代码（如 USD）" },
    { name: "{{store_url}}", desc: "商店网址" },
    { name: "{{password_section}}", desc: "新账号密码区块（已有账号时为空字符串）" },
  ],
}

function TemplateEditor({
  templateKey,
  template,
  onChange,
  onReset,
}: {
  templateKey: "guest_register" | "order_placed"
  template: EmailTemplate
  onChange: (t: EmailTemplate) => void
  onReset?: () => void
}) {
  const [preview, setPreview] = useState(false)
  const vars = VARIABLE_DOCS[templateKey] ?? []
  const requiredVars = REQUIRED_VARIABLES[templateKey] ?? []
  const missingVars = requiredVars.filter((v) => !template.html.includes(v))

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-1 block text-sm" htmlFor={`${templateKey}-subject`}>
          邮件主题（Subject）
        </Label>
        <Input
          id={`${templateKey}-subject`}
          value={template.subject}
          onChange={(e) => onChange({ ...template, subject: e.target.value })}
          placeholder="邮件标题..."
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <Label className="text-sm" htmlFor={`${templateKey}-html`}>
            邮件内容（HTML）
          </Label>
          <div className="flex items-center gap-2">
            {onReset && (
              <button
                type="button"
                className="text-xs text-ui-fg-muted hover:text-ui-fg-base underline"
                onClick={onReset}
              >
                重置为默认
              </button>
            )}
            <button
              type="button"
              className="text-xs text-ui-fg-interactive hover:underline"
              onClick={() => setPreview(!preview)}
            >
              {preview ? "切换编辑 / Edit" : "预览 HTML / Preview"}
            </button>
          </div>
        </div>
        {preview ? (
          <div
            className="border border-ui-border-base rounded-md p-4 bg-white min-h-[300px] overflow-auto text-sm"
            dangerouslySetInnerHTML={{ __html: template.html }}
          />
        ) : (
          <textarea
            id={`${templateKey}-html`}
            value={template.html}
            onChange={(e) => onChange({ ...template, html: e.target.value })}
            rows={18}
            className="w-full border border-ui-border-base rounded-md p-3 font-mono text-xs bg-ui-bg-field focus:outline-none focus:ring-2 focus:ring-ui-border-interactive resize-y"
            spellCheck={false}
          />
        )}
      </div>

      {missingVars.length > 0 && (
        <Alert variant="error">
          <span className="font-medium">⚠️ 缺少必要变量，邮件将无法显示账号和密码：</span>
          <span className="ml-1 font-mono">{missingVars.join("、")}</span>
          <br />
          <span className="text-xs">请在 HTML 内容中加入上述变量，或点击右上角「重置为默认」恢复默认模板。</span>
        </Alert>
      )}
      <div className="border border-ui-border-base rounded-md p-3 bg-ui-bg-subtle">
        <Text className="text-xs text-ui-fg-muted font-medium mb-2">可用变量 / Available Variables：</Text>
        <div className="flex flex-wrap gap-2">
          {vars.map((v) => (
            <div key={v.name} className="flex items-center gap-1">
              <Badge size="xsmall" color={requiredVars.includes(v.name) ? "red" : "purple"}>
                {v.name}{requiredVars.includes(v.name) ? " *" : ""}
              </Badge>
              <Text className="text-xs text-ui-fg-subtle">{v.desc}</Text>
            </div>
          ))}
        </div>
        {requiredVars.length > 0 && (
          <Text className="text-xs text-ui-fg-muted mt-1">* 标红变量为必填，缺失将导致邮件无法显示账号/密码</Text>
        )}
      </div>
    </div>
  )
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplatesConfig | null>(null)
  const [defaultTemplates, setDefaultTemplates] = useState<EmailTemplatesConfig | null>(null)
  const [originalTemplates, setOriginalTemplates] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // 同时加载当前模板和默认模板（通过删除 DB 中的记录后重新获取）
    apiFetch<{ email_templates: EmailTemplatesConfig }>("/store-settings/email-templates")
      .then((data) => {
        setTemplates(data.email_templates)
        setOriginalTemplates(JSON.stringify(data.email_templates))
      })
      .catch((err) => toast.error("加载模板失败", { description: err.message }))
      .finally(() => setLoading(false))

    // 加载系统默认模板（通过 reset 端点）
    apiFetch<{ email_templates: EmailTemplatesConfig }>("/store-settings/email-templates/defaults")
      .then((data) => setDefaultTemplates(data.email_templates))
      .catch(() => { /* 可选：不影响主功能 */ })
  }, [])

  const handleChange = (
    key: "guest_register" | "order_placed",
    tpl: EmailTemplate
  ) => {
    setTemplates((prev) => prev ? { ...prev, [key]: tpl } : prev)
  }

  const handleResetTemplate = (key: "guest_register" | "order_placed") => {
    if (!defaultTemplates) return
    setTemplates((prev) => prev ? { ...prev, [key]: defaultTemplates[key] } : prev)
    toast.success(`已重置为默认模板，点击「保存模板」生效`)
  }

  const handleSave = async () => {
    if (!templates) return
    setSaving(true)
    try {
      const data = await apiFetch<{ email_templates: EmailTemplatesConfig }>(
        "/store-settings/email-templates",
        { method: "PUT", body: JSON.stringify({ email_templates: templates }) }
      )
      setTemplates(data.email_templates)
      setOriginalTemplates(JSON.stringify(data.email_templates))
      toast.success("邮件模板已保存")
    } catch (err: any) {
      toast.error("保存失败", { description: err.message })
    } finally {
      setSaving(false)
    }
  }

  const isDirty = templates !== null && JSON.stringify(templates) !== originalTemplates

  if (loading) {
    return <Container><Text className="text-ui-fg-subtle">加载中...</Text></Container>
  }

  if (!templates) return null

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Heading level="h1">邮件模板配置</Heading>
          <Text className="text-ui-fg-subtle mt-1">
            配置系统自动发送的邮件内容，支持 HTML 格式和变量占位符。
          </Text>
        </div>
      </div>

      <Tabs defaultValue="guest_register">
        <Tabs.List>
          <Tabs.Trigger value="guest_register">
            注册成功邮件
          </Tabs.Trigger>
          <Tabs.Trigger value="order_placed">
            订单确认邮件
          </Tabs.Trigger>
        </Tabs.List>

        <div className="mt-6">
          <Tabs.Content value="guest_register">
            <div className="border border-ui-border-base rounded-lg p-4 mb-4 bg-ui-bg-subtle">
              <Text weight="plus" className="text-sm">触发场景</Text>
              <Text className="text-xs text-ui-fg-muted mt-1">
                游客以未注册邮箱下单，系统自动创建账号后，发送此邮件通知用户账号信息和临时密码。
              </Text>
            </div>
            <TemplateEditor
              templateKey="guest_register"
              template={templates.guest_register}
              onChange={(t) => handleChange("guest_register", t)}
              onReset={defaultTemplates ? () => handleResetTemplate("guest_register") : undefined}
            />
          </Tabs.Content>

          <Tabs.Content value="order_placed">
            <div className="border border-ui-border-base rounded-lg p-4 mb-4 bg-ui-bg-subtle">
              <Text weight="plus" className="text-sm">触发场景</Text>
              <Text className="text-xs text-ui-fg-muted mt-1">
                每次成功下单后都会发送此邮件。若为新账号，邮件中将自动插入
                <code className="mx-1">{"{{password_section}}"}</code>
                展示临时密码；已有账号则此区块为空。
              </Text>
            </div>
            <TemplateEditor
              templateKey="order_placed"
              template={templates.order_placed}
              onChange={(t) => handleChange("order_placed", t)}
              onReset={defaultTemplates ? () => handleResetTemplate("order_placed") : undefined}
            />
          </Tabs.Content>
        </div>
      </Tabs>

      <div className="flex justify-end mt-6">
        <Button
          variant="primary"
          onClick={handleSave}
          isLoading={saving}
          disabled={!isDirty}
        >
          保存模板
        </Button>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "邮件模板配置",
  icon: DocumentText,
})
