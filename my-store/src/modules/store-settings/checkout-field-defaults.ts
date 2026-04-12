export type FieldConfig = {
  visible: boolean
  required: boolean
}

export type CheckoutFieldsConfig = {
  shipping: {
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
  billing: {
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
}

export const DEFAULT_CHECKOUT_FIELDS_CONFIG: CheckoutFieldsConfig = {
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

// 系统锁定字段：不允许通过 API 修改
export const LOCKED_FIELDS = {
  email: { visible: true, required: true },
}

// country_code visible 不可设为 false
export const COUNTRY_CODE_LOCKED_VISIBLE = true
