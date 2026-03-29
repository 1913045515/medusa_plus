import type { ProductDetailRecord, CreateProductDetailInput, UpdateProductDetailInput } from "../types"

export interface IProductDetailRepository {
  findByProductId(productId: string): Promise<ProductDetailRecord | null>
  upsert(productId: string, input: UpdateProductDetailInput): Promise<ProductDetailRecord>
  delete(productId: string): Promise<boolean>
}
