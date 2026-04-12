export const VIRTUAL_PRODUCT_TYPES = ["resource", "course"] as const

export type VirtualProductType = (typeof VIRTUAL_PRODUCT_TYPES)[number]

export type VirtualProductConfig = {
  is_virtual: boolean
  virtual_product_type: VirtualProductType | null
  resource_download_url: string | null
  virtual_course_id: string | null
  virtual_course_path: string | null
}

export type VirtualOrderFulfillmentSnapshot = {
  is_virtual: true
  virtual_product_type: VirtualProductType
  resource_download_url: string | null
  virtual_course_id: string | null
  virtual_course_path: string | null
}

export type VirtualProductInput = {
  is_virtual?: boolean | null
  virtual_product_type?: string | null
  resource_download_url?: string | null
  virtual_course_id?: string | null
}

const trimOrNull = (value: unknown): string | null => {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export const isVirtualProductType = (value: unknown): value is VirtualProductType => {
  return typeof value === "string" && (VIRTUAL_PRODUCT_TYPES as readonly string[]).includes(value)
}

export const buildCourseRelativePath = (handle: string): string => {
  const normalizedHandle = handle.trim().replace(/^\/+/, "")
  return `/courses/${normalizedHandle}`
}

export const readVirtualProductConfig = (metadata: Record<string, unknown> | null | undefined): VirtualProductConfig => {
  const source = metadata ?? {}
  const typeCandidate = trimOrNull(source.virtual_product_type)
  const virtualType = isVirtualProductType(typeCandidate) ? typeCandidate : null
  const isVirtual = source.is_virtual === true || source.is_virtual === "true"

  return {
    is_virtual: isVirtual && Boolean(virtualType),
    virtual_product_type: isVirtual ? virtualType : null,
    resource_download_url: isVirtual ? trimOrNull(source.resource_download_url) : null,
    virtual_course_id: isVirtual ? trimOrNull(source.virtual_course_id) : null,
    virtual_course_path: isVirtual ? trimOrNull(source.virtual_course_path) : null,
  }
}

export const validateVirtualProductInput = (
  input: VirtualProductInput,
  options?: { coursePath?: string | null }
): VirtualProductConfig => {
  const isVirtual = input.is_virtual === true

  if (!isVirtual) {
    return {
      is_virtual: false,
      virtual_product_type: null,
      resource_download_url: null,
      virtual_course_id: null,
      virtual_course_path: null,
    }
  }

  const virtualType = trimOrNull(input.virtual_product_type)
  if (!isVirtualProductType(virtualType)) {
    throw new Error("Invalid virtual_product_type")
  }

  if (virtualType === "resource") {
    const downloadUrl = trimOrNull(input.resource_download_url)
    if (!downloadUrl) {
      throw new Error("resource_download_url is required for resource virtual products")
    }

    return {
      is_virtual: true,
      virtual_product_type: "resource",
      resource_download_url: downloadUrl,
      virtual_course_id: null,
      virtual_course_path: null,
    }
  }

  const virtualCourseId = trimOrNull(input.virtual_course_id)
  if (!virtualCourseId) {
    throw new Error("virtual_course_id is required for course virtual products")
  }

  return {
    is_virtual: true,
    virtual_product_type: "course",
    resource_download_url: null,
    virtual_course_id: virtualCourseId,
    virtual_course_path: trimOrNull(options?.coursePath) ?? null,
  }
}

export const mergeVirtualProductMetadata = (
  metadata: Record<string, unknown> | null | undefined,
  config: VirtualProductConfig
): Record<string, unknown> => {
  const next = { ...(metadata ?? {}) }

  if (!config.is_virtual) {
    delete next.is_virtual
    delete next.virtual_product_type
    delete next.resource_download_url
    delete next.virtual_course_id
    delete next.virtual_course_path
    return next
  }

  next.is_virtual = true
  next.virtual_product_type = config.virtual_product_type

  if (config.resource_download_url) {
    next.resource_download_url = config.resource_download_url
  } else {
    delete next.resource_download_url
  }

  if (config.virtual_course_id) {
    next.virtual_course_id = config.virtual_course_id
  } else {
    delete next.virtual_course_id
  }

  if (config.virtual_course_path) {
    next.virtual_course_path = config.virtual_course_path
  } else {
    delete next.virtual_course_path
  }

  return next
}

export const buildVirtualOrderFulfillmentSnapshot = (
  config: VirtualProductConfig
): VirtualOrderFulfillmentSnapshot | null => {
  if (!config.is_virtual || !config.virtual_product_type) {
    return null
  }

  return {
    is_virtual: true,
    virtual_product_type: config.virtual_product_type,
    resource_download_url: config.resource_download_url,
    virtual_course_id: config.virtual_course_id,
    virtual_course_path: config.virtual_course_path,
  }
}

export const readVirtualOrderFulfillmentSnapshot = (
  metadata: Record<string, unknown> | null | undefined
): VirtualOrderFulfillmentSnapshot | null => {
  const source = metadata ?? {}
  const nested = source.virtual_fulfillment
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

export const mergeOrderLineVirtualMetadata = (
  metadata: Record<string, unknown> | null | undefined,
  snapshot: VirtualOrderFulfillmentSnapshot | null
): Record<string, unknown> => {
  const next = { ...(metadata ?? {}) }

  if (!snapshot) {
    delete next.virtual_fulfillment
    return next
  }

  next.virtual_fulfillment = snapshot
  return next
}