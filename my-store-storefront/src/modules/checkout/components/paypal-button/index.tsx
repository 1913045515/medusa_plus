"use client"

import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js"
import { initiatePaymentSession, placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { useState } from "react"
import ErrorMessage from "@modules/checkout/components/error-message"

type PayPalPaymentButtonProps = {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

export default function PayPalPaymentButton({
  cart,
  notReady,
  "data-testid": dataTestId,
}: PayPalPaymentButtonProps) {
  const [{ isPending }] = usePayPalScriptReducer()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [cancelled, setCancelled] = useState(false)

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const handleCreateOrder = async () => {
    setErrorMessage(null)
    setCancelled(false)
    try {
      const existingSession = cart.payment_collection?.payment_sessions?.find(
        (s) => s.provider_id === "pp_paypal_paypal"
      )

      const response =
        existingSession?.data?.paypal_order_id && existingSession.status === "pending"
          ? null
          : await initiatePaymentSession(cart, { provider_id: "pp_paypal_paypal" })

      const updatedSession =
        (response as any)?.payment_collection?.payment_sessions?.find(
          (s: any) => s.provider_id === "pp_paypal_paypal"
        ) || existingSession

      const paypalOrderId = updatedSession?.data?.paypal_order_id as string | undefined
      if (!paypalOrderId) {
        throw new Error("Failed to create PayPal order. Please try again.")
      }
      return paypalOrderId
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate PayPal payment")
      throw err
    }
  }

  const handleApprove = async (data: { orderID: string }) => {
    try {
      // The backend will capture on our side via the payment session
      // We update the payment session data with the approved order ID
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
      await placeOrder()
    } catch (err: any) {
      setErrorMessage(err.message || "Payment capture failed. Please try again.")
    }
  }

  const handleCancel = () => {
    setCancelled(true)
    setErrorMessage("付款已取消，请重试。")
  }

  const handleError = (err: Record<string, unknown>) => {
    setErrorMessage("PayPal 付款出错，请重试。")
  }

  if (isPending || notReady) {
    return (
      <div className="h-12 w-full animate-pulse bg-ui-bg-subtle rounded-lg" />
    )
  }

  return (
    <div data-testid={dataTestId} className="w-full">
      <PayPalButtons
        style={{ layout: "vertical", shape: "rect", label: "pay" }}
        disabled={notReady}
        createOrder={handleCreateOrder}
        onApprove={handleApprove}
        onCancel={handleCancel}
        onError={handleError}
      />
      <ErrorMessage
        error={errorMessage}
        data-testid="paypal-payment-error-message"
      />
    </div>
  )
}
