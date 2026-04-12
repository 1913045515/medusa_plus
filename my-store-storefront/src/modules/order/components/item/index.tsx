import { HttpTypes } from "@medusajs/types"
import { Table, Text } from "@medusajs/ui"
import type { OrderDictionary } from "@lib/i18n/dictionaries"
import { readVirtualOrderFulfillment } from "@lib/util/virtual-order"

import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"

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
            <div className="flex items-start gap-2">
              <Text size="small" className="text-ui-fg-subtle whitespace-nowrap shrink-0">
                {dict.resourceLinkLabel}:
              </Text>
              {virtualFulfillment.virtual_product_type === "course" && virtualFulfillment.virtual_course_path && (
                <LocalizedClientLink
                  href={virtualFulfillment.virtual_course_path}
                  className="txt-small text-ui-fg-interactive hover:text-ui-fg-interactive-hover break-all"
                >
                  {virtualFulfillment.virtual_course_path}
                </LocalizedClientLink>
              )}
              {virtualFulfillment.virtual_product_type === "resource" && virtualFulfillment.resource_download_url && (
                <a
                  href={virtualFulfillment.resource_download_url}
                  target="_blank"
                  rel="noreferrer"
                  className="txt-small text-ui-fg-interactive hover:text-ui-fg-interactive-hover break-all"
                >
                  {virtualFulfillment.resource_download_url}
                </a>
              )}
            </div>
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
