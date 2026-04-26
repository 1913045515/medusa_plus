import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

type CartQueryItem = {
  id: string
  requires_shipping: boolean
  product?: {
    metadata?: Record<string, unknown> | null
  } | null
}

const isVirtualMetadata = (metadata: Record<string, unknown> | null | undefined) => {
  return metadata?.is_virtual === true || metadata?.is_virtual === "true"
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve("query") as any
  const cartModule = req.scope.resolve(Modules.CART) as any

  const cartRes = await query.graph({
    entity: "cart",
    fields: [
      "id",
      "items.id",
      "items.requires_shipping",
      "items.product.id",
      "items.product.metadata",
    ],
    filters: { id: req.params.id },
  })

  const cart = (cartRes?.data ?? [])[0] as
    | { id: string; items?: CartQueryItem[] }
    | undefined

  if (!cart) {
    return res.status(404).json({ message: "Cart not found" })
  }

  const itemsToNormalize = (cart.items ?? []).filter(
    (item) => item.requires_shipping && isVirtualMetadata(item.product?.metadata)
  )

  for (const item of itemsToNormalize) {
    await cartModule.updateLineItems(item.id, {
      requires_shipping: false,
    })
  }

  return res.json({
    cart_id: cart.id,
    normalized_count: itemsToNormalize.length,
    normalized_line_item_ids: itemsToNormalize.map((item) => item.id),
  })
}