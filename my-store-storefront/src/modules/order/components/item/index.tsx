"use client"

import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import type { OrderDictionary } from "@lib/i18n/dictionaries"
import { readVirtualOrderFulfillment } from "@lib/util/virtual-order"
import { useCallback, useEffect, useRef, useState } from "react"

import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"

const FILE_ASSET_PROXY_BASE = "/api/file-assets"

type ResourceDownloadSectionProps = {
  fileAssetId: string
  orderId: string
  dict: OrderDictionary
}

const ResourceDownloadSection = ({ fileAssetId, orderId, dict }: ResourceDownloadSectionProps) => {
  const [remainingDownloads, setRemainingDownloads] = useState<number | null>(null)
  const [downloadAvailableUntil, setDownloadAvailableUntil] = useState<Date | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch(
        `${FILE_ASSET_PROXY_BASE}/${fileAssetId}/status?order_id=${encodeURIComponent(orderId)}`,
        {
        credentials: "include",
        cache: "no-store",
        }
      )

      if (!res.ok) {
        return
      }

      const json = await res.json()
      setRemainingDownloads(json.remaining_downloads ?? 0)

      if (json.download_available_until) {
        setDownloadAvailableUntil(new Date(json.download_available_until))
      }
    } catch {
      // Silently ignore status fetch errors
    }
  }, [fileAssetId, orderId])

  useEffect(() => {
    void refreshStatus()
  }, [refreshStatus])

  // Check expiry every 30 seconds
  useEffect(() => {
    if (!downloadAvailableUntil) return
    const check = () => {
      setIsExpired(new Date() > downloadAvailableUntil)
    }
    check()
    intervalRef.current = setInterval(check, 30_000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current)
    }
  }, [downloadAvailableUntil])

  const triggerBrowserDownload = () => {
    const search = new URLSearchParams({
      order_id: orderId,
      ts: String(Date.now()),
    })
    const link = document.createElement("a")
    link.href = `${FILE_ASSET_PROXY_BASE}/${fileAssetId}/download?${search.toString()}`
    link.download = ""
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    window.setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link)
      }
    }, 1000)
  }

  const handleDownload = async () => {
    if (isExpired || remainingDownloads === 0 || isDownloading) return
    setIsDownloading(true)
    setError(null)

    try {
      if (remainingDownloads !== null && remainingDownloads <= 0) {
        setRemainingDownloads(0)
        setError(dict.downloadLimitReached)
        return
      }

      triggerBrowserDownload()
      refreshTimeoutRef.current = setTimeout(() => {
        void refreshStatus()
        setIsDownloading(false)
      }, 1200)
    } catch {
      setError("Unable to start the download. Please try again.")
      setIsDownloading(false)
    }
  }

  const isLimitReached = remainingDownloads !== null && remainingDownloads <= 0

  return (
    <div className="relative z-10 mt-2 flex flex-col gap-2">
      {isExpired && !isLimitReached ? (
        <div className="flex flex-col gap-1">
          <Text size="small" className="text-ui-fg-subtle">{dict.downloadExpired}</Text>
          <button
            onClick={() => window.location.reload()}
            className="txt-small text-ui-fg-interactive hover:text-ui-fg-interactive-hover underline self-start"
          >
            {dict.downloadRefreshPage}
          </button>
        </div>
      ) : isLimitReached ? (
        <Text size="small" className="text-ui-fg-subtle">{dict.downloadLimitReached}</Text>
      ) : (
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="relative z-10 inline-flex items-center gap-1 rounded-xl border border-[#d8c4aa] bg-[#f6ede0] px-3 py-2 text-sm font-semibold text-[#3d3024] transition-colors hover:bg-[#eee0cc] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDownloading ? "…" : dict.downloadFileBtn}
          </button>
          {remainingDownloads !== null && (
            <Text size="xsmall" className="text-ui-fg-muted">
              {dict.downloadRemainingToday.replace("{{n}}", String(remainingDownloads))}
            </Text>
          )}
        </div>
      )}
      {error && (
        <Text size="xsmall" className="text-ui-fg-error">{error}</Text>
      )}
    </div>
  )
}

type ItemProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  orderId: string
  currencyCode: string
  dict: OrderDictionary
}

const Item = ({ item, orderId, currencyCode, dict }: ItemProps) => {
  const virtualFulfillment = readVirtualOrderFulfillment((item.metadata ?? null) as Record<string, unknown> | null)

  return (
    <div
      className="flex flex-col gap-4 border-b border-[#eadcc8] py-4 first:pt-0 last:border-b-0 last:pb-0 sm:flex-row sm:items-start"
      data-testid="product-row"
    >
      <div className="w-16 shrink-0">
        <div className="flex w-16 overflow-hidden rounded-[18px]">
          <Thumbnail thumbnail={item.thumbnail} size="square" />
        </div>
      </div>

      <div className="min-w-0 flex-1 text-left">
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-name"
        >
          {item.product_title}
        </Text>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
        {virtualFulfillment && (
          <div className="mt-3 flex flex-col gap-1">
            {virtualFulfillment.virtual_product_type === "course" && virtualFulfillment.virtual_course_path && (
              <div className="flex items-start gap-2">
                <Text size="small" className="text-ui-fg-subtle whitespace-nowrap shrink-0">
                  {dict.resourceLinkLabel}:
                </Text>
                <LocalizedClientLink
                  href={virtualFulfillment.virtual_course_path}
                  className="txt-small text-ui-fg-interactive hover:text-ui-fg-interactive-hover break-all"
                >
                  {virtualFulfillment.virtual_course_path}
                </LocalizedClientLink>
              </div>
            )}
            {virtualFulfillment.virtual_product_type === "resource" && (
              virtualFulfillment.resource_file_asset_id ? (
                <ResourceDownloadSection
                  fileAssetId={virtualFulfillment.resource_file_asset_id}
                  orderId={orderId}
                  dict={dict}
                />
              ) : virtualFulfillment.resource_download_url ? (
                // Legacy: old orders with direct URL
                <div className="flex flex-col gap-1">
                  <Text size="small" className="text-ui-fg-subtle italic">
                    {dict.downloadLegacyNotice}
                  </Text>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-start justify-center sm:items-end">
        <span className="flex flex-col items-start justify-center sm:items-end">
          <span className="flex gap-x-1">
            <Text className="text-ui-fg-muted">
              <span data-testid="product-quantity">{item.quantity}</span>x{" "}
            </Text>
            <LineItemUnitPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
            />
          </span>

          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </div>
    </div>
  )
}

export default Item

