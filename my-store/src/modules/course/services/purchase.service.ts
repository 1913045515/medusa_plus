import type { IPurchaseRepository } from "../repositories/purchase.repository"
import type { CoursePurchaseRecord, CreateCoursePurchaseInput } from "../types"

export class PurchaseService {
  constructor(private readonly purchaseRepo: IPurchaseRepository) {}

  async hasPurchased(customerId: string, courseId: string): Promise<boolean> {
    return this.purchaseRepo.hasPurchased(customerId, courseId)
  }

  async createPurchase(
    input: CreateCoursePurchaseInput
  ): Promise<CoursePurchaseRecord> {
    return this.purchaseRepo.create(input)
  }
}
