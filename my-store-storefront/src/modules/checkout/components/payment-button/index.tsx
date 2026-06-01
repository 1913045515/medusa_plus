"use client"

import { isManual, isPaypal, isStripeLike, isWeChatPay } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import { isVirtualOnlyCart } from "@lib/util/virtual-fulfillment"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import React, { useState } from "react"
import ErrorMessage from "../error-message"
import PayPalPaymentButton from "@modules/checkout/components/paypal-button"
import { usePayPalConfig, usePayPalLoading } from "@modules/checkout/components/paypal-provider"
import PayPalCardFields from "@modules/checkout/components/paypal-card-fields"
import WeChatPayButton from "@modules/checkout/components/wechatpay-button"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const isVirtualCart = isVirtualOnlyCart(cart)
  const notReady =
    !cart ||
    !cart.email ||
    (!isVirtualCart &&
      (!cart.shipping_address ||
        !cart.billing_address ||
        (cart.shipping_methods?.length ?? 0) < 1))

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isStripeLike(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isPaypal(paymentSession?.provider_id):
      return (
        <PayPalButtonGroup
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isWeChatPay(paymentSession?.provider_id):
      return (
        <WeChatPayButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton notReady={notReady} data-testid={dataTestId} />
      )
    default:
      return <Button disabled>Select a payment method</Button>
  }
}

/**
 * PayPal button group: shows PayPal native button + optionally credit card hosted fields.
 * Task 8.5 – 8.7: PayPal integration with cancellation handling and card field fallback.
 */
const PayPalButtonGroup = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const config = usePayPalConfig()
  const loading = usePayPalLoading()

  if (loading) {
    return (
      <div className="p-4 text-sm text-ui-fg-subtle text-center">
        Loading PayPal...
      </div>
    )
  }

  if (!config.enabled) {
    return (
      <div className="p-4 border border-ui-border-base rounded-lg text-sm text-ui-fg-subtle">
        PayPal is temporarily unavailable. Please choose a different payment method or contact our support team.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* PayPal native button (PayPal account / linked card) */}
      <PayPalPaymentButton
        cart={cart}
        notReady={notReady}
        data-testid={dataTestId}
      />

      {/* Credit card hosted fields — only when enabled by admin */}
      {config.card_fields_enabled ? (
        <PayPalCardFields cart={cart} notReady={notReady} />
      ) : (
        <p className="text-xs text-ui-fg-muted text-center">
          To pay with a credit card, please use your PayPal account or contact our support team for assistance.
        </p>
      )}
    </div>
  )
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const stripe = useStripe()
  const elements = useElements()
  const card = elements?.getElement("card")

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    setSubmitting(true)

    if (!stripe || !elements || !card || !cart) {
      setSubmitting(false)
      return
    }

    await stripe
      .confirmCardPayment(session?.data.client_secret as string, {
        payment_method: {
          card: card,
          billing_details: {
            name:
              cart.billing_address?.first_name +
              " " +
              cart.billing_address?.last_name,
            address: {
              city: cart.billing_address?.city ?? undefined,
              country: cart.billing_address?.country_code ?? undefined,
              line1: cart.billing_address?.address_1 ?? undefined,
              line2: cart.billing_address?.address_2 ?? undefined,
              postal_code: cart.billing_address?.postal_code ?? undefined,
              state: cart.billing_address?.province ?? undefined,
            },
            email: cart.email,
            phone: cart.billing_address?.phone ?? undefined,
          },
        },
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent

          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            onPaymentCompleted()
          }

          setErrorMessage(error.message || null)
          return
        }

        if (
          (paymentIntent && paymentIntent.status === "requires_capture") ||
          paymentIntent.status === "succeeded"
        ) {
          return onPaymentCompleted()
        }

        return
      })
  }

  return (
    <>
      <Button
        disabled={disabled || notReady}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const ManualTestPaymentButton = ({ notReady }: { notReady: boolean }) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = () => {
    setSubmitting(true)

    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        data-testid="submit-order-button"
      >
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

export default PaymentButton
