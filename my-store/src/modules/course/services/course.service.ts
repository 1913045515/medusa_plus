import type { ICourseRepository } from "../repositories/course.repository"
import type {
  CourseRecord,
  CreateCourseInput,
  UpdateCourseInput,
  ListCoursesFilters,
  LocalizedCourseRecord,
} from "../types"
import { Modules } from "@medusajs/framework/utils"

// ─── CourseService ────────────────────────────────────────────────────────────
// 依赖 ICourseRepository 接口，不关心底层是静态 JSON 还是 ORM。
// 切换数据库时：构造函数注入不同的 Repository 实现即可。

export class CourseService {
  constructor(private readonly courseRepo: ICourseRepository) {}

  private resolveLocaleText(record: CourseRecord, locale?: string | null): LocalizedCourseRecord {
    const normalizedLocale = locale?.trim() || null
    const localized = normalizedLocale ? record.translations?.[normalizedLocale] : null

    return {
      ...record,
      title: localized?.title?.trim() || record.title,
      description:
        localized?.description !== undefined && localized?.description !== null
          ? localized.description
          : record.description,
      locale: normalizedLocale,
    }
  }

  async listCourses(filters?: ListCoursesFilters, locale?: string | null): Promise<LocalizedCourseRecord[]> {
    const items = await this.courseRepo.findAll(filters)
    return items.map((item) => this.resolveLocaleText(item, locale))
  }

  async getCourse(id: string, locale?: string | null): Promise<LocalizedCourseRecord | null> {
    const item = await this.courseRepo.findById(id)
    return item ? this.resolveLocaleText(item, locale) : null
  }

  async getCourseByHandle(handle: string, locale?: string | null): Promise<LocalizedCourseRecord | null> {
    const item = await this.courseRepo.findByHandle(handle)
    return item ? this.resolveLocaleText(item, locale) : null
  }

  private resolveProductModule(): any | null {
    const anyRepo = this.courseRepo as any
    const scope = anyRepo?.scope
    if (!scope?.resolve) return null

    try {
      return scope.resolve(Modules.PRODUCT)
    } catch {
      return null
    }
  }

  private async bindProductCourse(productId: string, courseId: string) {
    const productModule = this.resolveProductModule()
    if (!productModule) {
      throw new Error("Product module not available in current request scope")
    }

    const product = await productModule.retrieveProduct(productId, {
      select: ["id", "metadata"],
    })

    const existingMeta = product?.metadata ?? {}

    await productModule.updateProducts(productId, {
      metadata: {
        ...existingMeta,
        course_id: courseId,
      },
    })
  }

  async createCourse(input: CreateCourseInput): Promise<CourseRecord> {
    const created = await this.courseRepo.create(input)

    if (created.product_id) {
      await this.bindProductCourse(created.product_id, created.id)
    }

    return created
  }

  async updateCourse(
    id: string,
    input: UpdateCourseInput
  ): Promise<CourseRecord> {
    const updated = await this.courseRepo.update(id, input)
    if (!updated) throw new Error(`Course ${id} not found`)

    // 如果更新时传了 product_id，则重新绑定
    if (updated.product_id) {
      await this.bindProductCourse(updated.product_id, updated.id)
    }

    return updated
  }

  async deleteCourse(id: string): Promise<void> {
    const deleted = await this.courseRepo.delete(id)
    if (!deleted) throw new Error(`Course ${id} not found`)
  }
}
