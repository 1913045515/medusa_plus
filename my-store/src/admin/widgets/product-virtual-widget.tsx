import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Button,
  Container,
  Heading,
  Label,
  Select,
  Switch,
  Text,
  toast,
} from "@medusajs/ui"
import FileAssetPicker, { type FileAsset } from "../components/file-asset-picker"

type AdminProductVirtualWidgetProps = {
  data: { id: string }
}

type Course = {
  id: string
  title: string
  handle: string
  product_id: string | null
}

type VirtualProductType = "resource" | "course"

type VirtualProductConfig = {
  is_virtual: boolean
  virtual_product_type: VirtualProductType | null
  resource_file_asset_id: string
  resource_file_asset_name: string // display name only, not persisted
  resource_download_url: string    // legacy — read-only display, not writeable
  virtual_course_id: string
}

const emptyConfig: VirtualProductConfig = {
  is_virtual: false,
  virtual_product_type: null,
  resource_file_asset_id: "",
  resource_file_asset_name: "",
  resource_download_url: "",
  virtual_course_id: "",
}

const ProductVirtualWidget = ({ data }: AdminProductVirtualWidgetProps) => {
  const { t } = useTranslation()
  const productId = data.id
  const [config, setConfig] = useState<VirtualProductConfig>(emptyConfig)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      try {
        const [configRes, coursesRes] = await Promise.all([
          fetch(`/admin/products/${productId}/virtual-config`, {
            credentials: "include",
          }),
          fetch(`/admin/courses`, {
            credentials: "include",
          }),
        ])

        if (!configRes.ok) {
          throw new Error(t("productVirtual.toast.loadFailed"))
        }

        if (!coursesRes.ok) {
          throw new Error(t("productVirtual.toast.loadCoursesFailed"))
        }

        const configJson = await configRes.json()
        const coursesJson = await coursesRes.json()

        if (!active) return

        setConfig({
          is_virtual: Boolean(configJson?.config?.is_virtual),
          virtual_product_type: configJson?.config?.virtual_product_type ?? null,
          resource_file_asset_id: configJson?.config?.resource_file_asset_id ?? "",
          resource_file_asset_name: "",
          resource_download_url: configJson?.config?.resource_download_url ?? "",
          virtual_course_id: configJson?.config?.virtual_course_id ?? "",
        })
        setCourses(Array.isArray(coursesJson?.courses) ? coursesJson.courses : [])
      } catch (error: any) {
        if (!active) return
        toast.error(error?.message ?? t("productVirtual.toast.loadFailed"))
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [productId, t])

  const setField = <K extends keyof VirtualProductConfig>(key: K, value: VirtualProductConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  // Show ALL courses — the backend handles clearing the old product binding on save
  const courseOptions = useMemo(() => courses, [courses])

  const handleToggle = (checked: boolean) => {
    setConfig((prev) => {
      if (checked) {
        return {
          ...prev,
          is_virtual: true,
          virtual_product_type: prev.virtual_product_type ?? "resource",
        }
      }

      return emptyConfig
    })
  }

  const handleTypeChange = (value: string) => {
    const nextType = value as VirtualProductType
    setConfig((prev) => ({
      ...prev,
      virtual_product_type: nextType,
      resource_file_asset_id: nextType === "resource" ? prev.resource_file_asset_id : "",
      resource_file_asset_name: nextType === "resource" ? prev.resource_file_asset_name : "",
      resource_download_url: nextType === "resource" ? prev.resource_download_url : "",
      virtual_course_id: nextType === "course" ? prev.virtual_course_id : "",
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/admin/products/${productId}/virtual-config`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_virtual: config.is_virtual,
          virtual_product_type: config.virtual_product_type,
          resource_file_asset_id: config.resource_file_asset_id || null,
          virtual_course_id: config.virtual_course_id,
        }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json?.message ?? t("productVirtual.toast.saveFailed"))
      }

      toast.success(t("productVirtual.toast.saved"))
    } catch (error: any) {
      toast.error(error?.message ?? t("productVirtual.toast.saveFailed"))
    } finally {
      setSaving(false)
    }
  }

  const selectedType = config.virtual_product_type

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-base">
        <Heading level="h2">{t("productVirtual.sectionTitle")}</Heading>
        <Button variant="primary" size="small" isLoading={saving} onClick={handleSave} disabled={loading}>
          {t("productVirtual.save")}
        </Button>
      </div>

      <div className="flex flex-col gap-4 px-6 py-4">
        <div className="flex items-center justify-between rounded-lg border border-ui-border-base px-4 py-3">
          <div>
            <Text weight="plus">{t("productVirtual.isVirtualLabel")}</Text>
            <Text size="small" className="text-ui-fg-muted">
              {t("productVirtual.isVirtualHint")}
            </Text>
          </div>
          <Switch id="product-is-virtual" checked={config.is_virtual} onCheckedChange={handleToggle} disabled={loading} />
        </div>

        {config.is_virtual && (
          <>
            <div className="flex flex-col gap-1">
              <Label htmlFor="product-virtual-type">
                {t("productVirtual.typeLabel")} <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedType ?? undefined} onValueChange={handleTypeChange}>
                <Select.Trigger id="product-virtual-type">
                  <Select.Value placeholder={t("productVirtual.typePlaceholder")} />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="resource">{t("productVirtual.types.resource")}</Select.Item>
                  <Select.Item value="course">{t("productVirtual.types.course")}</Select.Item>
                </Select.Content>
              </Select>
            </div>

            {selectedType === "resource" && (
              <div className="flex flex-col gap-3">
                {/* Legacy warning */}
                {config.resource_download_url && !config.resource_file_asset_id && (
                  <div className="rounded-lg border border-ui-tag-orange-border bg-ui-tag-orange-bg px-4 py-3">
                    <Text size="small" className="text-ui-tag-orange-text">
                      {t("productVirtual.fileAssetLegacyWarning")}
                    </Text>
                    <Text size="xsmall" className="text-ui-fg-muted mt-1 font-mono break-all">
                      {config.resource_download_url}
                    </Text>
                  </div>
                )}

                {/* File asset picker */}
                <div className="flex flex-col gap-1">
                  <Label>
                    {t("productVirtual.fileAssetLabel")} <span className="text-red-500">*</span>
                  </Label>
                  {config.resource_file_asset_id ? (
                    <div className="flex items-center gap-2 rounded-lg border border-ui-border-base px-3 py-2">
                      <Text size="small" className="flex-1 text-ui-fg-base">
                        {config.resource_file_asset_name || config.resource_file_asset_id}
                      </Text>
                      <Button
                        size="2xsmall"
                        variant="secondary"
                        onClick={() => setPickerOpen(true)}
                      >
                        {t("productVirtual.fileAssetChangeBtn")}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => setPickerOpen(true)}
                      className="self-start"
                    >
                      {t("productVirtual.fileAssetSelectBtn")}
                    </Button>
                  )}
                  <Text size="small" className="text-ui-fg-muted">
                    {t("productVirtual.fileAssetHint")}
                  </Text>
                </div>

                {/* File asset picker dialog */}
                <FileAssetPicker
                  open={pickerOpen}
                  onClose={() => setPickerOpen(false)}
                  onSelect={(asset: FileAsset) => {
                    setConfig((prev) => ({
                      ...prev,
                      resource_file_asset_id: asset.id,
                      resource_file_asset_name: asset.name,
                    }))
                  }}
                />
              </div>
            )}

            {selectedType === "course" && (
              <div className="flex flex-col gap-1">
                <Label htmlFor="product-virtual-course">
                  {t("productVirtual.courseLabel")} <span className="text-red-500">*</span>
                </Label>
                <Select value={config.virtual_course_id || undefined} onValueChange={(value) => setField("virtual_course_id", value)}>
                  <Select.Trigger id="product-virtual-course">
                    <Select.Value placeholder={t("productVirtual.coursePlaceholder")} />
                  </Select.Trigger>
                  <Select.Content>
                    {courseOptions.map((course) => (
                      <Select.Item key={course.id} value={course.id}>
                        {course.title} ({course.handle})
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
                <Text size="small" className="text-ui-fg-muted">
                  {t("productVirtual.courseHint")}
                </Text>
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductVirtualWidget