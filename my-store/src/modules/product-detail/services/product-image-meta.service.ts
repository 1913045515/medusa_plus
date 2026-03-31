import type { IProductImageMetaRepository } from "../repositories/product-image-meta.repository"
import type { ProductImageMetaRecord, UpsertProductImageMetaInput } from "../types"

export class ProductImageMetaService {
  constructor(private readonly repo: IProductImageMetaRepository) {}

  async getByProductId(productId: string): Promise<ProductImageMetaRecord[]> {
    return this.repo.findByProductId(productId)
  }

  async bulkUpsert(productId: string, items: UpsertProductImageMetaInput[]): Promise<ProductImageMetaRecord[]> {
    // Ensure exactly one is_main per product
    const hasMain = items.some((i) => i.is_main)
    if (!hasMain && items.length > 0) {
      items[0].is_main = true
    }
    // Ensure only one main
    let mainSet = false
    for (const item of items) {
      if (item.is_main && mainSet) {
        item.is_main = false
      }
      if (item.is_main) mainSet = true
    }
    return this.repo.bulkUpsert(productId, items)
  }

  async deleteByProductId(productId: string): Promise<boolean> {
    return this.repo.deleteByProductId(productId)
  }
}
