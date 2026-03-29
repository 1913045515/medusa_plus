import type { ProductImageMetaRecord, UpsertProductImageMetaInput } from "../types"
import type { IProductImageMetaRepository } from "./product-image-meta.repository"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { generateEntityId } from "@medusajs/framework/utils"

export class ProductImageMetaOrmRepository implements IProductImageMetaRepository {
  constructor(private readonly scope: any) {}

  private get knex() {
    return this.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION ?? "pg_connection")
  }

  async findByProductId(productId: string): Promise<ProductImageMetaRecord[]> {
    const rows = await this.knex("product_image_meta")
      .select("id", "product_id", "image_id", "is_main", "sort_order", "created_at", "updated_at")
      .where({ product_id: productId })
      .whereNull("deleted_at")
      .orderBy("sort_order", "asc")
    return rows as ProductImageMetaRecord[]
  }

  async bulkUpsert(productId: string, items: UpsertProductImageMetaInput[]): Promise<ProductImageMetaRecord[]> {
    const existing = await this.findByProductId(productId)
    const existingMap = new Map(existing.map((r) => [r.image_id, r]))

    const now = new Date()
    const results: ProductImageMetaRecord[] = []

    for (const item of items) {
      const ex = existingMap.get(item.image_id)
      if (ex) {
        await this.knex("product_image_meta")
          .where({ id: ex.id })
          .update({
            is_main: item.is_main,
            sort_order: item.sort_order,
            updated_at: now,
          })
        results.push({ ...ex, is_main: item.is_main, sort_order: item.sort_order, updated_at: now.toISOString() })
      } else {
        const id = generateEntityId("", "pimg")
        const record: any = {
          id,
          product_id: productId,
          image_id: item.image_id,
          is_main: item.is_main,
          sort_order: item.sort_order,
          created_at: now,
          updated_at: now,
        }
        await this.knex("product_image_meta").insert(record)
        results.push({ ...record, created_at: now.toISOString(), updated_at: now.toISOString() })
      }
    }

    // Soft-delete meta rows for images no longer in the list
    const incomingImageIds = new Set(items.map((i) => i.image_id))
    const toRemove = existing.filter((r) => !incomingImageIds.has(r.image_id))
    if (toRemove.length > 0) {
      await this.knex("product_image_meta")
        .whereIn("id", toRemove.map((r) => r.id))
        .update({ deleted_at: now })
    }

    return results.sort((a, b) => a.sort_order - b.sort_order)
  }

  async deleteByProductId(productId: string): Promise<boolean> {
    const count = await this.knex("product_image_meta")
      .where({ product_id: productId })
      .whereNull("deleted_at")
      .update({ deleted_at: new Date() })
    return count > 0
  }
}
