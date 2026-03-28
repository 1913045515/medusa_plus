import type { CoursePurchaseRecord, CreateCoursePurchaseInput } from "../types"

export interface IPurchaseRepository {
  hasPurchased(customerId: string, courseId: string): Promise<boolean>
  create(input: CreateCoursePurchaseInput): Promise<CoursePurchaseRecord>
}

// 默认仍提供一个 in-memory 实现，方便单测/本地无 DB 启动。
export class PurchaseStaticRepository implements IPurchaseRepository {
  private store: CoursePurchaseRecord[] = []

  async hasPurchased(customerId: string, courseId: string): Promise<boolean> {
    return this.store.some(
      (p) => p.customer_id === customerId && p.course_id === courseId
    )
  }

  async create(input: CreateCoursePurchaseInput): Promise<CoursePurchaseRecord> {
    const now = new Date().toISOString()
    const record: CoursePurchaseRecord = {
      id: `purchase_${Date.now()}`,
      ...input,
      created_at: now,
      updated_at: now,
    }

    // upsert 语义：同一 customer+course 只保留一条
    const idx = this.store.findIndex(
      (p) => p.customer_id === record.customer_id && p.course_id === record.course_id
    )
    if (idx >= 0) this.store[idx] = record
    else this.store.push(record)

    return record
  }
}
