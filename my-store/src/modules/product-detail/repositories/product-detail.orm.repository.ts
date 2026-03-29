import type { ProductDetailRecord, UpdateProductDetailInput } from "../types"
import type { IProductDetailRepository } from "./product-detail.repository"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { generateEntityId } from "@medusajs/framework/utils"

export class ProductDetailOrmRepository implements IProductDetailRepository {
  constructor(private readonly scope: any) {}

  private get knex() {
    return this.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION ?? "pg_connection")
  }

  async findByProductId(productId: string): Promise<ProductDetailRecord | null> {
    const row = await this.knex("product_detail")
      .select("id", "product_id", "long_desc_html", "created_at", "updated_at")
      .where({ product_id: productId })
      .whereNull("deleted_at")
      .first()
    return (row ?? null) as ProductDetailRecord | null
  }

  async upsert(productId: string, input: UpdateProductDetailInput): Promise<ProductDetailRecord> {
    const existing = await this.findByProductId(productId)

    if (existing) {
      await this.knex("product_detail")
        .where({ id: existing.id })
        .update({
          long_desc_html: input.long_desc_html ?? null,
          updated_at: new Date(),
        })
      return {
        ...existing,
        long_desc_html: input.long_desc_html ?? null,
        updated_at: new Date().toISOString(),
      }
    }

    const id = generateEntityId("", "pdtl")
    const now = new Date()
    const record: any = {
      id,
      product_id: productId,
      long_desc_html: input.long_desc_html ?? null,
      created_at: now,
      updated_at: now,
    }
    await this.knex("product_detail").insert(record)
    return { ...record, created_at: now.toISOString(), updated_at: now.toISOString() }
  }

  async delete(productId: string): Promise<boolean> {
    const count = await this.knex("product_detail")
      .where({ product_id: productId })
      .whereNull("deleted_at")
      .update({ deleted_at: new Date() })
    return count > 0
  }
}
