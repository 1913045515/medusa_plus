import type { ProductImageMetaRecord, UpsertProductImageMetaInput } from "../types"

export interface IProductImageMetaRepository {
  findByProductId(productId: string): Promise<ProductImageMetaRecord[]>
  bulkUpsert(productId: string, items: UpsertProductImageMetaInput[]): Promise<ProductImageMetaRecord[]>
  deleteByProductId(productId: string): Promise<boolean>
}
