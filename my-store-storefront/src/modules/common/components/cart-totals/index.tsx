"use client"

import { convertToLocale } from "@lib/util/money"
import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    currency_code: string
    item_subtotal?: number | null
    shipping_subtotal?: number | null
    discount_subtotal?: number | null
  }
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals }) => {
  const {
    currency_code,
    total,
    tax_total,
    item_subtotal,
    shipping_subtotal,
    discount_subtotal,
  } = totals

  return (
    <div>
      <div className="flex flex-col gap-y-3 text-sm leading-6 text-[#5d5145]">
        <div className="flex items-start justify-between gap-4">
          <span className="min-w-0">Subtotal (excl. shipping and taxes)</span>
          <span className="shrink-0 font-medium text-[#241d16]" data-testid="cart-subtotal" data-value={item_subtotal || 0}>
            {convertToLocale({ amount: item_subtotal ?? 0, currency_code })}
          </span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <span className="min-w-0">Shipping</span>
          <span className="shrink-0 font-medium text-[#241d16]" data-testid="cart-shipping" data-value={shipping_subtotal || 0}>
            {convertToLocale({ amount: shipping_subtotal ?? 0, currency_code })}
          </span>
        </div>
        {!!discount_subtotal && (
          <div className="flex items-start justify-between gap-4">
            <span className="min-w-0">Discount</span>
            <span
              className="shrink-0 text-ui-fg-interactive"
              data-testid="cart-discount"
              data-value={discount_subtotal || 0}
            >
              -{" "}
              {convertToLocale({
                amount: discount_subtotal ?? 0,
                currency_code,
              })}
            </span>
          </div>
        )}
        <div className="flex items-start justify-between gap-4">
          <span className="min-w-0">Taxes</span>
          <span className="shrink-0 font-medium text-[#241d16]" data-testid="cart-taxes" data-value={tax_total || 0}>
            {convertToLocale({ amount: tax_total ?? 0, currency_code })}
          </span>
        </div>
      </div>
      <div className="my-5 h-px w-full border-b border-[#e3d6c4]" />
      <div className="mb-2 flex items-end justify-between gap-4 text-[#241d16]">
        <span className="text-sm font-semibold uppercase tracking-[0.16em]">
          Total
        </span>
        <span
          className="text-[1.7rem] font-semibold leading-none"
          data-testid="cart-total"
          data-value={total || 0}
        >
          {convertToLocale({ amount: total ?? 0, currency_code })}
        </span>
      </div>
      <div className="mt-5 h-px w-full border-b border-[#e3d6c4]" />
    </div>
  )
}

export default CartTotals
