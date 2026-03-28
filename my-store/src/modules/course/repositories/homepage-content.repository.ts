import type {
  CreateHomepageContentInput,
  HomepageContentRecord,
  UpsertHomepageContentInput,
} from "../types"

export interface IHomepageContentRepository {
  listAll(): Promise<HomepageContentRecord[]>
  findById(id: string): Promise<HomepageContentRecord | null>
  findByHandle(handle: string): Promise<HomepageContentRecord | null>
  findActivePublished(siteKey?: string): Promise<HomepageContentRecord | null>
  create(input: CreateHomepageContentInput): Promise<HomepageContentRecord>
  update(id: string, input: UpsertHomepageContentInput): Promise<HomepageContentRecord | null>
  publish(id: string, siteKey?: string): Promise<HomepageContentRecord | null>
  delete(id: string): Promise<boolean>
}