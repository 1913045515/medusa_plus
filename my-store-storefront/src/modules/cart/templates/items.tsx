import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Heading, Table } from "@medusajs/ui"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items
  return (
    <div className="min-w-0">
      <div className="flex items-center pb-4">
        <Heading className="text-[1.8rem] leading-9 text-[#231b14] sm:text-[2rem] sm:leading-[2.75rem]">
          Cart
        </Heading>
      </div>
      <div className="overflow-x-auto">
        <Table className="min-w-[680px] w-full">
          <Table.Header className="border-t-0">
            <Table.Row className="txt-medium-plus text-ui-fg-subtle">
              <Table.HeaderCell className="!pl-0 w-24" />
              <Table.HeaderCell>Item</Table.HeaderCell>
              <Table.HeaderCell className="whitespace-nowrap">Quantity</Table.HeaderCell>
              <Table.HeaderCell className="hidden small:table-cell whitespace-nowrap">
                Price
              </Table.HeaderCell>
              <Table.HeaderCell className="!pr-2 whitespace-nowrap text-right">
                Total
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {items
              ? items
                  .sort((a, b) => {
                    return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                  })
                  .map((item) => {
                    return (
                      <Item
                        key={item.id}
                        item={item}
                        currencyCode={cart?.currency_code}
                      />
                    )
                  })
              : repeat(5).map((i) => {
                  return <SkeletonLineItem key={i} />
                })}
          </Table.Body>
        </Table>
      </div>
    </div>
  )
}

export default ItemsTemplate
