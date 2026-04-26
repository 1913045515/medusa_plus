import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import type { OrderDictionary } from "@lib/i18n/dictionaries"

import Divider from "@modules/common/components/divider"
import Item from "@modules/order/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsProps = {
  order: HttpTypes.StoreOrder
  dict: OrderDictionary
}

const Items = ({ order, dict }: ItemsProps) => {
  const items = order.items

  return (
    <div className="flex flex-col">
      <Divider className="!mb-0" />
      <div data-testid="products-table" className="flex flex-col">
        {items?.length
          ? items
              .sort((a, b) => {
                return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
              })
              .map((item) => {
                return (
                  <Item
                    key={item.id}
                    item={item}
                    orderId={order.id}
                    currencyCode={order.currency_code}
                    dict={dict}
                  />
                )
              })
          : repeat(5).map((i) => {
              return <SkeletonLineItem key={i} />
            })}
      </div>
    </div>
  )
}

export default Items
