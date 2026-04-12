import { deleteProductVariantsWorkflow } from "@medusajs/core-flows"
import { MedusaRequest, MedusaResponse, refetchEntity } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * Custom DELETE handler for product variants.
 *
 * Overrides the native Medusa route to force-clear inventory reservations
 * before deleting the variant. The default Medusa handler throws 400 if any
 * inventory item linked to the variant has `reserved_quantity > 0` (pending
 * order reservations). This handler:
 *   1. Queries the variant's linked inventory items via query graph.
 *   2. Soft-deletes all reservation items for those inventory items.
 *   3. Delegates to `deleteProductVariantsWorkflow` (same as native route).
 */
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const productId = req.params.id
  const variantId = req.params.variant_id

  const inventoryService = req.scope.resolve(Modules.INVENTORY) as any
  const query = req.scope.resolve("query") as any

  // 1. Find inventory items linked to this variant via query graph (Medusa v2 link table)
  const { data: variantData } = await query.graph({
    entity: "variants",
    fields: ["id", "manage_inventory", "inventory.id"],
    filters: { id: variantId },
  }).catch(() => ({ data: [] as any[] }))

  const variant = variantData?.[0]
  const inventoryItemIds: string[] =
    variant?.manage_inventory && variant?.inventory?.length
      ? variant.inventory.map((i: any) => i.id)
      : []

  // 2. Delete all reservation items for those inventory items so Medusa allows deletion
  if (inventoryItemIds.length) {
    const reservations = await inventoryService
      .listReservationItems(
        { inventory_item_id: inventoryItemIds },
        { select: ["id"] }
      )
      .catch(() => [] as any[])

    const reservationIds: string[] = reservations.map((r: any) => r.id)
    if (reservationIds.length) {
      await inventoryService.softDeleteReservationItems(reservationIds)
    }
  }

  // 3. Run the standard delete workflow (reservations are now cleared)
  await deleteProductVariantsWorkflow(req.scope).run({
    input: { ids: [variantId] },
  })

  // 4. Re-fetch the parent product to return in response (same as native route)
  const product = await refetchEntity({
    entity: "product",
    idOrFilter: productId,
    scope: req.scope,
    fields: [
      "*",
      "variants.*",
      "variants.options.*",
      "options.*",
      "images.*",
      "tags.*",
      "type.*",
    ],
  }).catch(() => null)

  res.status(200).json({
    id: variantId,
    object: "variant",
    deleted: true,
    parent: product,
  })
}
