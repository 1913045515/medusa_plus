"use client"

import { HttpTypes } from "@medusajs/types"
import { Table, Text } from "@medusajs/ui"
import type { OrderDictionary } from "@lib/i18n/dictionaries"
import { readVirtualOrderFulfillment } from "@lib/util/virtual-order"
import { useEffect, useRef, useState } from "react"

import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

type ResourceDownloadSectionProps = {
  fileAssetId: string
  dict: OrderDictionary
}

const ResourceDownloadSection = ({ fileAssetId, dict }: ResourceDownloadSectionProps) => {
  const [remainingDownloads, setRemainingDownloads] = useState<number | null>(null)
  const [downloadAvailableUntil, setDownloadAvailableUntil] = useState<Date | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Fetch download status on mount
    const fetchStatus = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/store/file-assets/${fileAssetId}/status`,
          {
            credentials: "include",
            headers: {
              "x-publishable-api-key": PUBLISHABLE_KEY,
            },
          }
        )
        if (!res.ok) return
        const json = await res.json()
        setRemainingDownloads(json.remaining_downloads ?? 0)
        if (json.download_available_until) {
          setDownloadAvailableUntil(new Date(json.download_available_until))
        }
      } catch {
        // Silently ignore status fetch errors
      }
    }
    void fetchStatus()
  }, [fileAssetId])

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
    }
  }, [downloadAvailableUntil])

  const handleDownload = async () => {
    if (isExpired || remainingDownloads === 0) return
    setIsDownloading(true)
    setError(null)
    try {
      // This triggers 302 redirect to presigned URL — browser follows it
      const res = await fetch(
        `${BACKEND_URL}/store/file-assets/${fileAssetId}/download`,
        {
          credentials: "include",
          headers: { "x-publishable-api-key": PUBLISHABLE_KEY },
          redirect: "manual",
        }
      )
      if (res.status === 302 || res.type === "opaqueredirect") {
        // The browser won't follow the redirect automatically due to "redirect: manual"
        // Navigate directly to the download URL via an anchor tag
        const location = res.headers.get("Location")
        if (location) {
          const a = document.createElement("a")
          a.href = location
          a.download = ""
          a.target = "_blank"
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
        // Decrement local count
        setRemainingDownloads((prev) => (prev !== null ? Math.max(0, prev - 1) : null))
      } else if (res.status === 429) {
        const json = await res.json().catch(() => ({}))
        setError(json.message || dict.downloadLimitReached)
        setRemainingDownloads(0)
      } else if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setError(json.message || "Download failed")
      }
    } catch {
      // CORS "opaque" responses — navigate directly (simpler fallback)
      window.open(
        `${BACKEND_URL}/store/file-assets/${fileAssetId}/download`,
        "_blank"
      )
    } finally {
      setIsDownloading(false)
    }
  }

  const isLimitReached = remainingDownloads !== null && remainingDownloads <= 0

  return (
    <div className="mt-2 flex flex-col gap-2">
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
            className="inline-flex items-center gap-1 rounded-md bg-ui-button-neutral px-3 py-1.5 txt-small text-ui-fg-base border border-ui-border-base hover:bg-ui-button-neutral-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
  currencyCode: string
  dict: OrderDictionary
}

const Item = ({ item, currencyCode, dict }: ItemProps) => {
  const virtualFulfillment = readVirtualOrderFulfillment((item.metadata ?? null) as Record<string, unknown> | null)

  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <div className="flex w-16">
          <Thumbnail thumbnail={item.thumbnail} size="square" />
        </div>
      </Table.Cell>

      <Table.Cell className="text-left">
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
      </Table.Cell>

      <Table.Cell className="!pr-0">
        <span className="!pr-0 flex flex-col items-end h-full justify-center">
          <span className="flex gap-x-1 ">
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
      </Table.Cell>
    </Table.Row>
  )
}

export default Item

