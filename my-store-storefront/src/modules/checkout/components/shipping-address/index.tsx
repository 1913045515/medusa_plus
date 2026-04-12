import { CheckoutSectionConfig, DEFAULT_CHECKOUT_FIELDS } from "@lib/data/checkout-config"
import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Checkbox from "@modules/common/components/checkbox"
import Input from "@modules/common/components/input"
import { mapKeys } from "lodash"
import React, { useEffect, useMemo, useState } from "react"
import AddressSelect from "../address-select"
import CountrySelect from "../country-select"

const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
  fieldConfig,
  isVirtualCart,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
  fieldConfig?: CheckoutSectionConfig
  isVirtualCart?: boolean
}) => {
  const fc = fieldConfig ?? DEFAULT_CHECKOUT_FIELDS.shipping
  const defaultCountryCode =
    cart?.shipping_address?.country_code ||
    cart?.region?.countries?.[0]?.iso_2 ||
    ""
  const [formData, setFormData] = useState<Record<string, any>>({
    "shipping_address.first_name": cart?.shipping_address?.first_name || "",
    "shipping_address.last_name": cart?.shipping_address?.last_name || "",
    "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
    "shipping_address.company": cart?.shipping_address?.company || "",
    "shipping_address.postal_code": cart?.shipping_address?.postal_code || "",
    "shipping_address.city": cart?.shipping_address?.city || "",
    "shipping_address.country_code": defaultCountryCode,
    "shipping_address.province": cart?.shipping_address?.province || "",
    "shipping_address.phone": cart?.shipping_address?.phone || "",
    email: cart?.email || "",
  })

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  // check if customer has saved addresses that are in the current region
  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ),
    [customer?.addresses, countriesInRegion]
  )

  const setFormAddress = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    address &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        "shipping_address.first_name": address?.first_name || "",
        "shipping_address.last_name": address?.last_name || "",
        "shipping_address.address_1": address?.address_1 || "",
        "shipping_address.company": address?.company || "",
        "shipping_address.postal_code": address?.postal_code || "",
        "shipping_address.city": address?.city || "",
        "shipping_address.country_code": address?.country_code || "",
        "shipping_address.province": address?.province || "",
        "shipping_address.phone": address?.phone || "",
      }))

    email &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        email: email,
      }))
  }

  useEffect(() => {
    // Ensure cart is not null and has a shipping_address before setting form data
    if (cart && cart.shipping_address) {
      setFormAddress(cart?.shipping_address, cart?.email)
    }

    if (cart && !cart.email && customer?.email) {
      setFormAddress(undefined, customer.email)
    }
  }, [cart]) // Add cart as a dependency

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
      {/* 虚拟购物车简化模式：只显示 Email */}
      {isVirtualCart ? (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="hidden"
            name="shipping_address.country_code"
            value={formData["shipping_address.country_code"]}
          />
          <input
            type="hidden"
            name="shipping_address.first_name"
            value={formData["shipping_address.first_name"] || "Virtual"}
          />
          <input
            type="hidden"
            name="shipping_address.last_name"
            value={formData["shipping_address.last_name"] || "Product"}
          />
          <input
            type="hidden"
            name="shipping_address.address_1"
            value={formData["shipping_address.address_1"] || "N/A"}
          />
          <input
            type="hidden"
            name="shipping_address.city"
            value={formData["shipping_address.city"] || "N/A"}
          />
          <input
            type="hidden"
            name="shipping_address.postal_code"
            value={formData["shipping_address.postal_code"] || "00000"}
          />
          <input type="hidden" name="same_as_billing" value="on" />
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
            data-testid="shipping-email-input"
          />
        </div>
      ) : (
        <>
          {customer && (addressesInRegion?.length || 0) > 0 && (
            <Container className="mb-6 flex flex-col gap-y-4 p-5">
              <p className="text-small-regular">
                {`Hi ${customer.first_name}, do you want to use one of your saved addresses?`}
              </p>
              <AddressSelect
                addresses={customer.addresses}
                addressInput={
                  mapKeys(formData, (_, key) =>
                    key.replace("shipping_address.", "")
                  ) as HttpTypes.StoreCartAddress
                }
                onSelect={setFormAddress}
              />
            </Container>
          )}
          <div className="grid grid-cols-2 gap-4">
            {fc.first_name.visible && (
              <Input
                label="First name"
                name="shipping_address.first_name"
                autoComplete="given-name"
                value={formData["shipping_address.first_name"]}
                onChange={handleChange}
                required={fc.first_name.required}
                data-testid="shipping-first-name-input"
              />
            )}
            {fc.last_name.visible && (
              <Input
                label="Last name"
                name="shipping_address.last_name"
                autoComplete="family-name"
                value={formData["shipping_address.last_name"]}
                onChange={handleChange}
                required={fc.last_name.required}
                data-testid="shipping-last-name-input"
              />
            )}
            {fc.address_1.visible && (
              <Input
                label="Address"
                name="shipping_address.address_1"
                autoComplete="address-line1"
                value={formData["shipping_address.address_1"]}
                onChange={handleChange}
                required={fc.address_1.required}
                data-testid="shipping-address-input"
              />
            )}
            {fc.company.visible && (
              <Input
                label="Company"
                name="shipping_address.company"
                value={formData["shipping_address.company"]}
                onChange={handleChange}
                autoComplete="organization"
                required={fc.company.required}
                data-testid="shipping-company-input"
              />
            )}
            {fc.postal_code.visible && (
              <Input
                label="Postal code"
                name="shipping_address.postal_code"
                autoComplete="postal-code"
                value={formData["shipping_address.postal_code"]}
                onChange={handleChange}
                required={fc.postal_code.required}
                data-testid="shipping-postal-code-input"
              />
            )}
            {fc.city.visible && (
              <Input
                label="City"
                name="shipping_address.city"
                autoComplete="address-level2"
                value={formData["shipping_address.city"]}
                onChange={handleChange}
                required={fc.city.required}
                data-testid="shipping-city-input"
              />
            )}
            {/* country_code.visible 系统锁定，始终显示 */}
            <CountrySelect
              name="shipping_address.country_code"
              autoComplete="country"
              region={cart?.region}
              value={formData["shipping_address.country_code"]}
              onChange={handleChange}
              required={fc.country_code.required}
              data-testid="shipping-country-select"
            />
            {fc.province.visible && (
              <Input
                label="State / Province"
                name="shipping_address.province"
                autoComplete="address-level1"
                value={formData["shipping_address.province"]}
                onChange={handleChange}
                required={fc.province.required}
                data-testid="shipping-province-input"
              />
            )}
          </div>
          <div className="my-8">
            <Checkbox
              label="Billing address same as shipping address"
              name="same_as_billing"
              checked={checked}
              onChange={onChange}
              data-testid="billing-address-checkbox"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Email 系统锁定，始终显示且必填 */}
            <Input
              label="Email"
              name="email"
              type="email"
              title="Enter a valid email address."
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              required
              data-testid="shipping-email-input"
            />
            {fc.phone.visible && (
              <Input
                label="Phone"
                name="shipping_address.phone"
                autoComplete="tel"
                value={formData["shipping_address.phone"]}
                onChange={handleChange}
                required={fc.phone.required}
                data-testid="shipping-phone-input"
              />
            )}
          </div>
        </>
      )}
    </>
  )
}

export default ShippingAddress
