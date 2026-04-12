const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL

export type FieldConfig = {
  visible: boolean
  required: boolean
}

export type CheckoutSectionConfig = {
  first_name: FieldConfig
  last_name: FieldConfig
  address_1: FieldConfig
  company: FieldConfig
  postal_code: FieldConfig
  city: FieldConfig
  country_code: FieldConfig
  province: FieldConfig
  phone: FieldConfig
}

export type CheckoutFieldsConfig = {
  shipping: CheckoutSectionConfig
  billing: CheckoutSectionConfig
}

const DEFAULT_FIELD: FieldConfig = { visible: true, required: false }

export const DEFAULT_CHECKOUT_FIELDS: CheckoutFieldsConfig = {
  shipping: {
    first_name: { visible: true, required: true },
    last_name: { visible: true, required: true },
    address_1: { visible: true, required: true },
    company: { visible: true, required: false },
    postal_code: { visible: true, required: true },
    city: { visible: true, required: true },
    country_code: { visible: true, required: true },
    province: { visible: true, required: false },
    phone: { visible: true, required: false },
  },
  billing: {
    first_name: { visible: true, required: true },
    last_name: { visible: true, required: true },
    address_1: { visible: true, required: true },
    company: { visible: true, required: false },
    postal_code: { visible: true, required: true },
    city: { visible: true, required: false },
    country_code: { visible: true, required: true },
    province: { visible: true, required: false },
    phone: { visible: true, required: false },
  },
}

export async function getCheckoutFieldConfig(): Promise<CheckoutFieldsConfig> {
  if (!BACKEND_URL) {
    return DEFAULT_CHECKOUT_FIELDS
  }

  const publishableKey =
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY ||
    process.env.MEDUSA_PUBLISHABLE_KEY

  try {
    const res = await fetch(`${BACKEND_URL}/store/store-settings/checkout-fields`, {
      cache: "no-store",
      headers: {
        ...(publishableKey ? { "x-publishable-api-key": publishableKey } : {}),
      },
    })
    if (!res.ok) {
      return DEFAULT_CHECKOUT_FIELDS
    }
    const data = await res.json()
    return data?.checkout_fields ?? DEFAULT_CHECKOUT_FIELDS
  } catch {
    return DEFAULT_CHECKOUT_FIELDS
  }
}
