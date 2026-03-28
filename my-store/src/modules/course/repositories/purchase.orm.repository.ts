import type {
  CoursePurchaseRecord,
  CreateCoursePurchaseInput,
} from "../types"
import type { IPurchaseRepository } from "./purchase.repository"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export class PurchaseOrmRepository implements IPurchaseRepository {
  constructor(private readonly scope: any) {}

  private get knex() {
    // 在 Medusa v2 中，直接通过 pg_connection 解析共享的 Knex 实例
    // typeORM 的 manager 已经被移除
    const knex = this.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION ?? "pg_connection")
    if (!knex) {
      throw new Error("Could not resolve 'pg_connection' from request scope")
    }
    return knex
  }

  async hasPurchased(customerId: string, courseId: string): Promise<boolean> {
    console.log("[hasPurchased] querying course_purchase with:", { customerId, courseId })

    const row = await this.knex("course_purchase")
      .select("id", "customer_id", "course_id", "deleted_at")
      .where({ customer_id: customerId, course_id: courseId })
      .whereNull("deleted_at")
      .first()

    console.log("[hasPurchased] result row=", row ?? null)
    console.log("[hasPurchased] purchased=", !!row)

    return !!row
  }

  async create(input: CreateCoursePurchaseInput): Promise<CoursePurchaseRecord> {
    const id = `cp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    
    await this.knex("course_purchase").insert({
      id,
      customer_id: input.customer_id,
      course_id: input.course_id,
      order_id: input.order_id ?? null,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const created = await this.knex("course_purchase").where({ id }).first();
    return created as CoursePurchaseRecord;
  }
}
