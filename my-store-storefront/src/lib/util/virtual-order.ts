export type VirtualProductType = "resource" | "course"

export type VirtualOrderFulfillmentSnapshot = {
  is_virtual: true
  virtual_product_type: VirtualProductType
  resource_download_url: string | null
  virtual_course_id: string | null
  virtual_course_path: string | null
}

const isVirtualProductType = (value: unknown): value is VirtualProductType => {
  return value === "resource" || value === "course"
}

const trimOrNull = (value: unknown): string | null => {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export const readVirtualOrderFulfillment = (
  metadata: Record<string, unknown> | null | undefined
): VirtualOrderFulfillmentSnapshot | null => {
  const nested = metadata?.virtual_fulfillment
  if (!nested || typeof nested !== "object") {
    return null
  }

  const record = nested as Record<string, unknown>
  const typeCandidate = trimOrNull(record.virtual_product_type)
  if (record.is_virtual !== true || !isVirtualProductType(typeCandidate)) {
    return null
  }

  return {
    is_virtual: true,
    virtual_product_type: typeCandidate,
    resource_download_url: trimOrNull(record.resource_download_url),
    virtual_course_id: trimOrNull(record.virtual_course_id),
    virtual_course_path: trimOrNull(record.virtual_course_path),
  }
}