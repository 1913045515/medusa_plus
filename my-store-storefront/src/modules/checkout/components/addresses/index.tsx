"use client"

import { setAddresses } from "@lib/data/cart"
import { CheckoutFieldsConfig, DEFAULT_CHECKOUT_FIELDS } from "@lib/data/checkout-config"
import compareAddresses from "@lib/util/compare-addresses"
import { isVirtualOnlyCart } from "@lib/util/virtual-fulfillment"
import { CheckCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text, useToggleState } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import Spinner from "@modules/common/icons/spinner"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useActionState } from "react"
import BillingAddress from "../billing_address"
import ErrorMessage from "../error-message"
import ShippingAddress from "../shipping-address"
import { SubmitButton } from "../submit-button"

const Addresses = ({
  cart,
  customer,
  fieldConfig,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  fieldConfig?: CheckoutFieldsConfig
}) => {
  const config = fieldConfig ?? DEFAULT_CHECKOUT_FIELDS
  const isVirtualCart = isVirtualOnlyCart(cart)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "address"
  const headingLabel = isVirtualCart ? "Contact" : "Shipping Address"
  const continueLabel = isVirtualCart
    ? "Continue to payment"
    : "Continue to delivery"
  const summaryReady = isVirtualCart ? Boolean(cart?.email) : Boolean(cart?.shipping_address)

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    isVirtualCart
      ? true
      : cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  const handleEdit = () => {
    router.push(pathname + "?step=address")
  }

  const [message, formAction] = useActionState(setAddresses, null)

  return (
    <div className="rounded-[28px] border border-[#e3d5c1] bg-white/92 px-5 py-6 shadow-[0_18px_50px_rgba(74,53,24,0.07)] sm:px-7 sm:py-8">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className="flex flex-row items-baseline gap-x-2 text-[1.55rem] leading-9 text-[#231b14] sm:text-[1.75rem] sm:leading-10"
        >
          {headingLabel}
          {!isOpen && <CheckCircleSolid />}
        </Heading>
        {!isOpen && summaryReady && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="edit-address-button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      {isOpen ? (
        <form action={formAction}>
          <div className="pb-8">
            <ShippingAddress
              customer={customer}
              checked={sameAsBilling}
              onChange={toggleSameAsBilling}
              cart={cart}
              fieldConfig={config.shipping}
              isVirtualCart={isVirtualCart}
            />

            {!sameAsBilling && !isVirtualCart && (
              <div>
                <Heading
                  level="h2"
                  className="text-3xl-regular gap-x-4 pb-6 pt-8"
                >
                  Billing address
                </Heading>

                <BillingAddress cart={cart} fieldConfig={config.billing} />
              </div>
            )}
            <SubmitButton className="mt-6" data-testid="submit-address-button">
              {continueLabel}
            </SubmitButton>
            <ErrorMessage error={message} data-testid="address-error-message" />
          </div>
        </form>
      ) : (
        <div>
          <div className="text-small-regular">
            {isVirtualCart ? (
              <div className="grid gap-6 rounded-[24px] border border-[#e4d7c4] bg-[#faf4ea] p-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div className="space-y-2" data-testid="digital-delivery-summary">
                  <Text className="txt-medium-plus text-ui-fg-base">
                    Digital delivery
                  </Text>
                  <Text className="txt-medium text-ui-fg-subtle">
                    This order unlocks immediately after successful payment. No shipping address or delivery method is required.
                  </Text>
                </div>
                <div className="space-y-2" data-testid="digital-contact-summary">
                  <Text className="txt-medium-plus text-ui-fg-base">
                    Contact
                  </Text>
                  <Text className="txt-medium text-ui-fg-subtle">{cart?.email}</Text>
                </div>
              </div>
            ) : cart && cart.shipping_address ? (
              <div className="grid gap-5 md:grid-cols-3">
                <div
                  className="rounded-[24px] border border-[#e4d7c4] bg-[#faf4ea] p-5"
                  data-testid="shipping-address-summary"
                >
                  <div className="flex flex-col gap-1.5">
                    <Text className="txt-medium-plus text-ui-fg-base mb-1">
                      Shipping Address
                    </Text>
                    <Text className="txt-medium text-ui-fg-subtle">
                      {cart.shipping_address.first_name}{" "}
                      {cart.shipping_address.last_name}
                    </Text>
                    <Text className="txt-medium text-ui-fg-subtle">
                      {cart.shipping_address.address_1}{" "}
                      {cart.shipping_address.address_2}
                    </Text>
                    <Text className="txt-medium text-ui-fg-subtle">
                      {cart.shipping_address.postal_code},{" "}
                      {cart.shipping_address.city}
                    </Text>
                    <Text className="txt-medium text-ui-fg-subtle">
                      {cart.shipping_address.country_code?.toUpperCase()}
                    </Text>
                  </div>
                </div>

                <div
                  className="rounded-[24px] border border-[#e4d7c4] bg-[#faf4ea] p-5"
                  data-testid="shipping-contact-summary"
                >
                  <div className="flex flex-col gap-1.5">
                    <Text className="txt-medium-plus text-ui-fg-base mb-1">
                      Contact
                    </Text>
                    <Text className="txt-medium text-ui-fg-subtle">
                      {cart.shipping_address.phone}
                    </Text>
                    <Text className="txt-medium text-ui-fg-subtle">
                      {cart.email}
                    </Text>
                  </div>
                </div>

                <div
                  className="rounded-[24px] border border-[#e4d7c4] bg-[#faf4ea] p-5"
                  data-testid="billing-address-summary"
                >
                  <div className="flex flex-col gap-1.5">
                    <Text className="txt-medium-plus text-ui-fg-base mb-1">
                      Billing Address
                    </Text>

                    {sameAsBilling ? (
                      <Text className="txt-medium text-ui-fg-subtle">
                        Billing and delivery address are the same.
                      </Text>
                    ) : (
                      <>
                        <Text className="txt-medium text-ui-fg-subtle">
                          {cart.billing_address?.first_name}{" "}
                          {cart.billing_address?.last_name}
                        </Text>
                        <Text className="txt-medium text-ui-fg-subtle">
                          {cart.billing_address?.address_1}{" "}
                          {cart.billing_address?.address_2}
                        </Text>
                        <Text className="txt-medium text-ui-fg-subtle">
                          {cart.billing_address?.postal_code},{" "}
                          {cart.billing_address?.city}
                        </Text>
                        <Text className="txt-medium text-ui-fg-subtle">
                          {cart.billing_address?.country_code?.toUpperCase()}
                        </Text>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Spinner />
              </div>
            )}
          </div>
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default Addresses
