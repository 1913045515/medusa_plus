"use client"

import { Dialog, Transition } from "@headlessui/react"
import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import X from "@modules/common/icons/x"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import { getCartDictionary } from "@lib/i18n/dictionaries"
import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { useRouter } from "next/navigation"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
  cartEnabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
  cartEnabled = true,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [showCartSuccess, setShowCartSuccess] = useState(false)
  const params = useParams()
  const countryCode = params.countryCode as string
  // 简单映射 countryCode 到 locale，支持 zh-CN、en-US，默认英文
  const locale = countryCode?.toLowerCase().startsWith("zh") ? "zh-CN" : "en-US"
  const cartDict = getCartDictionary(locale)

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname

    router.replace(nextUrl, { scroll: false })
  }, [isValidVariant, pathname, router, searchParams, selectedVariant])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async (): Promise<boolean> => {
    if (!selectedVariant?.id) return false

    setIsAdding(true)

    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity: 1,
        countryCode,
        isVirtualProduct: product.metadata?.is_virtual === true,
      })

      setIsAdding(false)
      return true
    } catch (error) {
      setIsAdding(false)
      return false
    }
  }

  const handleBuyNow = async () => {
    const ok = await handleAddToCart()
    if (ok) {
      router.push(`/${countryCode}/checkout?step=address`)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                    />
                  </div>
                )
              })}
              <Divider />
            </div>
          )}
        </div>

        <ProductPrice product={product} variant={selectedVariant} />

        <Button
          type="button"
          onClick={async () => {
            if (!cartEnabled) {
              await handleBuyNow()
            } else {
              const ok = await handleAddToCart()
              if (ok) setShowCartSuccess(true)
            }
          }}
          disabled={
            !inStock ||
            !selectedVariant ||
            !!disabled ||
            isAdding ||
            !isValidVariant
          }
          variant="primary"
          className="w-full h-10"
          isLoading={isAdding}
          data-testid="add-product-button"
        >
          {!selectedVariant && !options
            ? "Select variant"
            : !inStock || !isValidVariant
            ? "Out of stock"
            : cartEnabled
            ? "Add to cart"
            : "Buy Now"}
        </Button>
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
          onAddedToCart={() => setShowCartSuccess(true)}
          cartEnabled={cartEnabled}
          countryCode={countryCode}
        />
      </div>

      {/* Mobile add-to-cart success dialog — fixed at bottom center of viewport */}
      <Transition appear show={showCartSuccess} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[80] lg:hidden"
          onClose={() => setShowCartSuccess(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-x-0 bottom-0 flex justify-center px-4 pb-8">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-4"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-4"
            >
              <Dialog.Panel
                className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
                data-testid="mobile-cart-success-modal"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Dialog.Title className="text-base font-semibold text-ui-fg-base">
                      {cartDict.added}
                    </Dialog.Title>
                    <Dialog.Description className="mt-1 text-sm text-ui-fg-subtle">
                      {cartDict.addedDesc(product.title)}
                    </Dialog.Description>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCartSuccess(false)}
                    className="rounded-full p-1 text-ui-fg-muted transition-colors hover:bg-ui-bg-subtle"
                  >
                    <X />
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <LocalizedClientLink
                    href="/cart"
                    onClick={() => setShowCartSuccess(false)}
                  >
                    <Button
                      type="button"
                      className="w-full"
                      data-testid="mobile-success-go-to-cart-button"
                    >
                      {cartDict.viewCart}
                    </Button>
                  </LocalizedClientLink>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowCartSuccess(false)}
                    className="w-full"
                    data-testid="mobile-success-cancel-button"
                  >
                    {cartDict.continue}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
