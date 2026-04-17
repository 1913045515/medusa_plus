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

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

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
      立即付款（信用卡）
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
      await fetch(`${BACKEND_URL}/store/paypal/capture`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
        body: JSON.stringify({
          paypal_order_id: data.orderID,
          cart_id: cart.id,
        }),
      })
      setApproved(true)
      await placeOrder()
    } catch (err: any) {
      setErrorMessage(err.message || "信用卡付款失败，请重试。")
    }
  }

  const handleError = (err: Record<string, unknown>) => {
    setErrorMessage("信用卡付款出错，请重试或使用其他付款方式。")
  }

  const handleSubmit = async () => {
    setErrorMessage(null)
    try {
      if (
        !cart.payment_collection?.payment_sessions?.find(
          (s) => s.provider_id === "pp_paypal"
        )
      ) {
        await initiatePaymentSession(cart, { provider_id: "pp_paypal" })
      }
      const session = cart.payment_collection?.payment_sessions?.find(
        (s) => s.provider_id === "pp_paypal"
      )
      const paypalOrderId = session?.data?.paypal_order_id as string | undefined
      if (!paypalOrderId) {
        throw new Error("无法获取 PayPal 订单 ID，请重试。")
      }
    } catch (err: any) {
      setErrorMessage(err.message)
    }
  }

  return (
    <div className="mt-6 border border-ui-border-base rounded-lg p-4">
      <p className="text-sm font-medium text-ui-fg-base mb-4">
        信用卡付款（Visa / Mastercard / AmEx）
      </p>
      <PayPalCardFieldsProvider
        onApprove={handleApprove}
        onError={handleError}
        createOrder={async () => {
          const session = cart.payment_collection?.payment_sessions?.find(
            (s) => s.provider_id === "pp_paypal"
          )
          const orderId = session?.data?.paypal_order_id as string | undefined
          if (!orderId) throw new Error("No PayPal order ID available")
          return orderId
        }}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-ui-fg-subtle mb-1">持卡人姓名</label>
            <PayPalNameField
              className="w-full border border-ui-border-base rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
              style={{ input: { "font-size": "14px" } }}
            />
          </div>
          <div>
            <label className="block text-xs text-ui-fg-subtle mb-1">卡号</label>
            <PayPalNumberField
              className="w-full border border-ui-border-base rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
              style={{ input: { "font-size": "14px" } }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-ui-fg-subtle mb-1">有效期</label>
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
