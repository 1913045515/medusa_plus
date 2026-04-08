import type {
  CourseRecord,
  CreateCourseInput,
  UpdateCourseInput,
  ListCoursesFilters,
} from "../types"

// ─── Repository Interface ─────────────────────────────────────────────────────
// 切换数据库时：新建 CourseOrmRepository implements ICourseRepository，
// 在 index.ts 中替换注入的实现即可，Route/Service 层零改动。

export interface ICourseRepository {
  findAll(filters?: ListCoursesFilters): Promise<CourseRecord[]>
  findById(id: string): Promise<CourseRecord | null>
  findByHandle(handle: string): Promise<CourseRecord | null>
  create(input: CreateCourseInput): Promise<CourseRecord>
  update(id: string, input: UpdateCourseInput): Promise<CourseRecord | null>
  delete(id: string): Promise<boolean>
}

// ─── Static JSON Data ─────────────────────────────────────────────────────────
// 替换 DB 时：删除此段，新建 ORM 实现文件即可。

const STATIC_COURSES: CourseRecord[] = [
  {
    id: "course_demo_1",
    product_id: null,
    handle: "demo-course-1",
    title: "React 从零到一",
    description: "系统学习 React 核心概念，包含 Hooks、状态管理与项目实战。",
    translations: {
      "en-US": {
        title: "React From Zero to One",
        description: "Learn React fundamentals, hooks, state management, and project delivery end to end.",
      },
    },
    thumbnail_url: "https://via.placeholder.com/640x360?text=React+Course",
    thumbnail_asset: null,
    level: "beginner",
    lessons_count: 4,
    status: "published",
    metadata: {},
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "course_demo_2",
    product_id: null,
    handle: "demo-course-2",
    title: "Next.js 全栈开发",
    description: "深入 Next.js 13+ App Router，Server Components 与全栈部署实战。",
    translations: {
      "en-US": {
        title: "Next.js Full-stack Development",
        description: "Deep dive into the App Router, Server Components, and full-stack deployment practices.",
      },
    },
    thumbnail_url: "https://via.placeholder.com/640x360?text=Next.js+Course",
    thumbnail_asset: null,
    level: "intermediate",
    lessons_count: 8,
    status: "published",
    metadata: {},
    created_at: "2024-02-01T00:00:00.000Z",
    updated_at: "2024-02-01T00:00:00.000Z",
  },
]

// ─── Static Implementation ────────────────────────────────────────────────────

export class CourseStaticRepository implements ICourseRepository {
  private store: CourseRecord[] = [...STATIC_COURSES]

  async findAll(filters?: ListCoursesFilters): Promise<CourseRecord[]> {
    let result = this.store
    if (filters?.status) {
      result = result.filter((c) => c.status === filters.status)
    }
    if (filters?.handle) {
      result = result.filter((c) => c.handle === filters.handle)
    }
    return result
  }

  async findById(id: string): Promise<CourseRecord | null> {
    return this.store.find((c) => c.id === id) ?? null
  }

  async findByHandle(handle: string): Promise<CourseRecord | null> {
    return this.store.find((c) => c.handle === handle) ?? null
  }

  async create(input: CreateCourseInput): Promise<CourseRecord> {
    const now = new Date().toISOString()
    const record: CourseRecord = {
      ...input,
      id: input.id ?? `course_${Date.now()}`,
      product_id: input.product_id ?? null,
      translations: input.translations ?? null,
      thumbnail_asset: input.thumbnail_asset ?? null,
      created_at: now,
      updated_at: now,
    }
    this.store.push(record)
    return record
  }

  async update(id: string, input: UpdateCourseInput): Promise<CourseRecord | null> {
    const idx = this.store.findIndex((c) => c.id === id)
    if (idx === -1) return null
    this.store[idx] = {
      ...this.store[idx],
      ...input,
      updated_at: new Date().toISOString(),
    }
    return this.store[idx]
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.store.findIndex((c) => c.id === id)
    if (idx === -1) return false
    this.store.splice(idx, 1)
    return true
  }
}
