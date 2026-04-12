import { listProducts } from "@lib/data/products"
import { getStoreSettings } from "@lib/data/store-settings"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 */
export default async function ProductActionsWrapper({
  id,
  region,
}: {
  id: string
  region: HttpTypes.StoreRegion
}) {
  const [product, storeSettings] = await Promise.all([
    listProducts({
      queryParams: { id: [id] },
      regionId: region.id,
    }).then(({ response }) => response.products[0]),
    getStoreSettings(),
  ])

  if (!product) {
    return null
  }

  return <ProductActions product={product} region={region} cartEnabled={storeSettings.cartEnabled} />
}
