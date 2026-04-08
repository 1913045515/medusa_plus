// ─── Course Module Entry Point ────────────────────────────────────────────────
// 这是 DI 组装点。切换数据库时只需：
//   1. 新建 CourseOrmRepository / LessonOrmRepository
//   2. 替换下方 new XXXStaticRepository() 为 new XXXOrmRepository(orm)
//   Route / Service 层零改动。

import { CourseOrmRepository } from "./repositories/course.orm.repository"
import { LessonOrmRepository } from "./repositories/lesson.orm.repository"
import { PurchaseOrmRepository } from "./repositories/purchase.orm.repository"
import { HomepageContentOrmRepository } from "./repositories/homepage-content.orm.repository"
import { CourseStaticRepository } from "./repositories/course.repository"
import { LessonStaticRepository } from "./repositories/lesson.repository"
import { PurchaseStaticRepository } from "./repositories/purchase.repository"
import { CourseService } from "./services/course.service"
import { LessonService } from "./services/lesson.service"
import { PurchaseService } from "./services/purchase.service"
import { HomepageContentService } from "./services/homepage-content.service"
import { CourseMediaService } from "./services/media-asset.service"
import { Module } from "@medusajs/framework/utils"
import CourseModuleService from "./service"

export const COURSE_MODULE = "course"

// 让 Medusa CLI/运行时把该目录识别为 module
// 注意：当前仍以现有 service/repository 层提供能力（先跑通迁移生成）。
export default Module(COURSE_MODULE, {
  service: CourseModuleService,
})

// ── 当前使用 ORM 查询实现（PostgreSQL）────────────────────────────────────
// 注意：这些仓储依赖请求 scope。Route 层直接 import 单例时拿不到 scope。
// 为保持现有 Route 写法不变，这里使用全局容器（Medusa 内部）是不安全的。
// MVP 先在 repository 内部走 query.graph，后续会把 route 改成 req.scope 注入。

// 临时：在第一次访问时由 route 将 req.scope 传入 setScope。
let _scope: any = null
export const setCourseModuleScope = (scope: any) => {
  _scope = scope
}

const courseRepo = new CourseOrmRepository({ resolve: (k: any) => _scope.resolve(k) })
const lessonRepo = new LessonOrmRepository({ resolve: (k: any) => _scope.resolve(k) })
const purchaseRepo = new PurchaseOrmRepository({ resolve: (k: any) => _scope.resolve(k) })
const homepageContentRepo = new HomepageContentOrmRepository({ resolve: (k: any) => _scope.resolve(k) })
const courseMediaService = new CourseMediaService()

// ── 单例 Service（Route 层直接 import 使用）──────────────────────────────────
export const courseService = new CourseService(courseRepo, courseMediaService)
export const lessonService = new LessonService(lessonRepo, courseMediaService)
export const purchaseService = new PurchaseService(purchaseRepo)
export const homepageContentService = new HomepageContentService(homepageContentRepo)
export { courseMediaService }

// ── 类型 re-export（方便 Route 层 import）───────────────────────────────────
export type {
  CourseRecord,
  LessonRecord,
  CreateCourseInput,
  UpdateCourseInput,
  CreateLessonInput,
  UpdateLessonInput,
  ListCoursesFilters,
  ListLessonsFilters,
  PlayResponse,
  CoursePurchaseRecord,
  CreateCoursePurchaseInput,
  HomepageCta,
  HomepageHero,
  HomepageHighlightItem,
  HomepageFeaturedCourseItem,
  HomepageContentPayload,
  HomepageContentRecord,
  CreateHomepageContentInput,
  UpsertHomepageContentInput,
  StoreCourseRecord,
  StoreLessonRecord,
  StoredS3MediaAsset,
  SignedMediaAsset,
  CourseMediaField,
  CourseMediaUploadTarget,
} from "./types"
