import { CheckoutSectionConfig, DEFAULT_CHECKOUT_FIELDS } from "@lib/data/checkout-config"
import { HttpTypes } from "@medusajs/types"
import Input from "@modules/common/components/input"
import React, { useState } from "react"
import CountrySelect from "../country-select"

const BillingAddress = ({
  cart,
  fieldConfig,
}: {
  cart: HttpTypes.StoreCart | null
  fieldConfig?: CheckoutSectionConfig
}) => {
  const fc = fieldConfig ?? DEFAULT_CHECKOUT_FIELDS.billing
  const [formData, setFormData] = useState<any>({
    "billing_address.first_name": cart?.billing_address?.first_name || "",
    "billing_address.last_name": cart?.billing_address?.last_name || "",
    "billing_address.address_1": cart?.billing_address?.address_1 || "",
    "billing_address.company": cart?.billing_address?.company || "",
    "billing_address.postal_code": cart?.billing_address?.postal_code || "",
    "billing_address.city": cart?.billing_address?.city || "",
    "billing_address.country_code": cart?.billing_address?.country_code || "",
    "billing_address.province": cart?.billing_address?.province || "",
    "billing_address.phone": cart?.billing_address?.phone || "",
  })

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {fc.first_name.visible && (
          <Input
            label="First name"
            name="billing_address.first_name"
            autoComplete="given-name"
            value={formData["billing_address.first_name"]}
            onChange={handleChange}
            required={fc.first_name.required}
            data-testid="billing-first-name-input"
          />
        )}
        {fc.last_name.visible && (
          <Input
            label="Last name"
            name="billing_address.last_name"
            autoComplete="family-name"
            value={formData["billing_address.last_name"]}
            onChange={handleChange}
            required={fc.last_name.required}
            data-testid="billing-last-name-input"
          />
        )}
        {fc.address_1.visible && (
          <Input
            label="Address"
            name="billing_address.address_1"
            autoComplete="address-line1"
            value={formData["billing_address.address_1"]}
            onChange={handleChange}
            required={fc.address_1.required}
            data-testid="billing-address-input"
          />
        )}
        {fc.company.visible && (
          <Input
            label="Company"
            name="billing_address.company"
            value={formData["billing_address.company"]}
            onChange={handleChange}
            autoComplete="organization"
            required={fc.company.required}
            data-testid="billing-company-input"
          />
        )}
        {fc.postal_code.visible && (
          <Input
            label="Postal code"
            name="billing_address.postal_code"
            autoComplete="postal-code"
            value={formData["billing_address.postal_code"]}
            onChange={handleChange}
            required={fc.postal_code.required}
            data-testid="billing-postal-input"
          />
        )}
        {fc.city.visible && (
          <Input
            label="City"
            name="billing_address.city"
            autoComplete="address-level2"
            value={formData["billing_address.city"]}
            onChange={handleChange}
            required={fc.city.required}
          />
        )}
        {/* country_code.visible 系统锁定，始终显示 */}
        <CountrySelect
          name="billing_address.country_code"
          autoComplete="country"
          region={cart?.region}
          value={formData["billing_address.country_code"]}
          onChange={handleChange}
          required={fc.country_code.required}
          data-testid="billing-country-select"
        />
        {fc.province.visible && (
          <Input
            label="State / Province"
            name="billing_address.province"
            autoComplete="address-level1"
            value={formData["billing_address.province"]}
            onChange={handleChange}
            required={fc.province.required}
            data-testid="billing-province-input"
          />
        )}
        {fc.phone.visible && (
          <Input
            label="Phone"
            name="billing_address.phone"
            autoComplete="tel"
            value={formData["billing_address.phone"]}
            onChange={handleChange}
            required={fc.phone.required}
            data-testid="billing-phone-input"
          />
        )}
      </div>
    </>
  )
}

export default BillingAddress
