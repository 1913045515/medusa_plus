"use client"

import {
  PayPalCardFieldsProvider,
  PayPalNameField,
  PayPalNumberField,
  PayPalExpiryField,
  PayPalCVVField,
  usePayPalCardFields,
} from "@paypal/react-paypal-js"
import { initiatePaymentSession, placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { useState } from "react"
import { Button } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"

type PayPalCardFieldsProps = {
  cart: HttpTypes.StoreCart
  notReady: boolean
}

// Use the Next.js API proxy route to avoid nginx routing issues in production
const PAYPAL_CAPTURE_URL = "/api/paypal-capture"

function SubmitButton({
  notReady,
  onSubmit,
}: {
  notReady: boolean
  onSubmit: () => void
}) {
  const { cardFieldsForm, fields } = usePayPalCardFields()
  const [submitting, setSubmitting] = useState(false)

  const handleClick = async () => {
    if (!cardFieldsForm) return
    setSubmitting(true)
    const formState = await cardFieldsForm.getState()
    if (!Object.values(formState.fields).every((f: any) => f.isValid)) {
      setSubmitting(false)
      return
    }
    onSubmit()
    setSubmitting(false)
  }

  return (
    <Button
      size="large"
      className="mt-4 w-full"
      disabled={notReady}
      isLoading={submitting}
      onClick={handleClick}
    >
      Pay Now (Credit Card)
    </Button>
  )
}

export default function PayPalCardFields({
  cart,
  notReady,
}: PayPalCardFieldsProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [approved, setApproved] = useState(false)

  const handleApprove = async (data: { orderID: string }) => {
    try {
      await fetch(PAYPAL_CAPTURE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paypal_order_id: data.orderID,
          cart_id: cart.id,
        }),
      })
      setApproved(true)
      await placeOrder()
    } catch (err: any) {
      setErrorMessage(err.message || "Credit card payment failed. Please try again.")
    }
  }

  const handleError = (err: Record<string, unknown>) => {
    setErrorMessage("Card payment failed. Please try again or use a different payment method.")
  }

  const handleSubmit = async () => {
    setErrorMessage(null)
    try {
      const existingSession = cart.payment_collection?.payment_sessions?.find(
        (s) => s.provider_id === "pp_paypal_paypal"
      )
      const response =
        existingSession?.data?.paypal_order_id && existingSession.status === "pending"
          ? null
          : await initiatePaymentSession(cart, { provider_id: "pp_paypal_paypal" })
      const session =
        (response as any)?.payment_collection?.payment_sessions?.find(
          (s: any) => s.provider_id === "pp_paypal_paypal"
        ) || existingSession
      const paypalOrderId = session?.data?.paypal_order_id as string | undefined
      if (!paypalOrderId) {
        throw new Error("Unable to get PayPal order ID. Please try again.")
      }
    } catch (err: any) {
      setErrorMessage(err.message)
    }
  }

  return (
    <div className="mt-6 border border-ui-border-base rounded-lg p-4">
      <p className="text-sm font-medium text-ui-fg-base mb-4">
        Credit Card (Visa / Mastercard / AmEx)
      </p>
      <PayPalCardFieldsProvider
        onApprove={handleApprove}
        onError={handleError}
        createOrder={async () => {
          const existingSession = cart.payment_collection?.payment_sessions?.find(
            (s) => s.provider_id === "pp_paypal_paypal"
          )
          const response =
            existingSession?.data?.paypal_order_id && existingSession.status === "pending"
              ? null
              : await initiatePaymentSession(cart, { provider_id: "pp_paypal_paypal" })
          const session =
            (response as any)?.payment_collection?.payment_sessions?.find(
              (s: any) => s.provider_id === "pp_paypal_paypal"
            ) || existingSession
          const orderId = session?.data?.paypal_order_id as string | undefined
          if (!orderId) throw new Error("No PayPal order ID available")
          return orderId
        }}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-ui-fg-subtle mb-1">Cardholder Name</label>
            <PayPalNameField
              className="w-full border border-ui-border-base rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
              style={{ input: { "font-size": "14px" } }}
            />
          </div>
          <div>
            <label className="block text-xs text-ui-fg-subtle mb-1">Card Number</label>
            <PayPalNumberField
              className="w-full border border-ui-border-base rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
              style={{ input: { "font-size": "14px" } }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-ui-fg-subtle mb-1">Expiry Date</label>
              <PayPalExpiryField
                className="w-full border border-ui-border-base rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
                style={{ input: { "font-size": "14px" } }}
              />
            </div>
            <div>
              <label className="block text-xs text-ui-fg-subtle mb-1">CVV</label>
              <PayPalCVVField
                className="w-full border border-ui-border-base rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
                style={{ input: { "font-size": "14px" } }}
              />
            </div>
          </div>
        </div>
        <SubmitButton notReady={notReady} onSubmit={handleSubmit} />
      </PayPalCardFieldsProvider>
      <ErrorMessage
        error={errorMessage}
        data-testid="paypal-card-fields-error-message"
      />
    </div>
  )
}
