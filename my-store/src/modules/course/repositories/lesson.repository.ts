import type {
  LessonRecord,
  CreateLessonInput,
  UpdateLessonInput,
  ListLessonsFilters,
} from "../types"

// ─── Repository Interface ─────────────────────────────────────────────────────
// 切换数据库时：新建 LessonOrmRepository implements ILessonRepository，
// 在 index.ts 中替换注入的实现即可，Route/Service 层零改动。

export interface ILessonRepository {
  findAll(filters?: ListLessonsFilters): Promise<LessonRecord[]>
  findById(id: string): Promise<LessonRecord | null>
  findByCourseId(courseId: string): Promise<LessonRecord[]>
  create(input: CreateLessonInput): Promise<LessonRecord>
  update(id: string, input: UpdateLessonInput): Promise<LessonRecord | null>
  delete(id: string): Promise<boolean>
}

// ─── Static JSON Data ─────────────────────────────────────────────────────────
// 替换 DB 时：删除此段，新建 ORM 实现文件即可。

const STATIC_LESSONS: LessonRecord[] = [
  // ── course_demo_1 ──────────────────────────────────────────────────────────
  {
    id: "lesson_c1_1",
    course_id: "course_demo_1",
    title: "第1集：开发环境搭建",
    description: "安装 Node.js、VS Code 并初始化第一个 React 项目。",
    translations: {
      "en-US": {
        title: "Episode 1: Environment Setup",
        description: "Install Node.js and VS Code, then bootstrap the first React project.",
      },
    },
    episode_number: 1,
    duration: 600,
    is_free: true,
    thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+1",
    thumbnail_asset: null,
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
    video_asset: null,
    status: "published",
    metadata: {},
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "lesson_c1_2",
    course_id: "course_demo_1",
    title: "第2集：JSX 与组件基础",
    description: "学习 JSX 语法、函数组件与 Props 传递。",
    translations: null,
    episode_number: 2,
    duration: 780,
    is_free: true,
    thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+2",
    thumbnail_asset: null,
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
    video_asset: null,
    status: "published",
    metadata: {},
    created_at: "2024-01-02T00:00:00.000Z",
    updated_at: "2024-01-02T00:00:00.000Z",
  },
  {
    id: "lesson_c1_3",
    course_id: "course_demo_1",
    title: "第3集：useState 与 useEffect",
    description: "深入理解 React 核心 Hooks 的使用场景与陷阱。",
    translations: null,
    episode_number: 3,
    duration: 1200,
    is_free: false,
    thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+3",
    thumbnail_asset: null,
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
    video_asset: null,
    status: "published",
    metadata: {},
    created_at: "2024-01-03T00:00:00.000Z",
    updated_at: "2024-01-03T00:00:00.000Z",
  },
  {
    id: "lesson_c1_4",
    course_id: "course_demo_1",
    title: "第4集：项目实战 —— Todo App",
    description: "综合运用所学知识，构建一个完整的 Todo 应用并部署上线。",
    translations: null,
    episode_number: 4,
    duration: 1800,
    is_free: false,
    thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+4",
    thumbnail_asset: null,
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
    video_asset: null,
    status: "published",
    metadata: {},
    created_at: "2024-01-04T00:00:00.000Z",
    updated_at: "2024-01-04T00:00:00.000Z",
  },
  // ── course_demo_2 ──────────────────────────────────────────────────────────
  {
    id: "lesson_c2_1",
    course_id: "course_demo_2",
    title: "第1集：App Router 核心概念",
    description: "理解 Next.js 13+ App Router 目录结构与路由规则。",
    translations: null,
    episode_number: 1,
    duration: 720,
    is_free: true,
    thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+1",
    thumbnail_asset: null,
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
    video_asset: null,
    status: "published",
    metadata: {},
    created_at: "2024-02-01T00:00:00.000Z",
    updated_at: "2024-02-01T00:00:00.000Z",
  },
  {
    id: "lesson_c2_2",
    course_id: "course_demo_2",
    title: "第2集：Server Components vs Client Components",
    description: "掌握两种组件模式的边界与最佳实践。",
    translations: null,
    episode_number: 2,
    duration: 900,
    is_free: true,
    thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+2",
    thumbnail_asset: null,
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
    video_asset: null,
    status: "published",
    metadata: {},
    created_at: "2024-02-02T00:00:00.000Z",
    updated_at: "2024-02-02T00:00:00.000Z",
  },
  {
    id: "lesson_c2_3",
    course_id: "course_demo_2",
    title: "第3集：数据获取与缓存策略",
    description: "fetch 缓存、revalidate 与 unstable_cache 的使用。",
    translations: null,
    episode_number: 3,
    duration: 1050,
    is_free: false,
    thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+3",
    thumbnail_asset: null,
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
    video_asset: null,
    status: "published",
    metadata: {},
    created_at: "2024-02-03T00:00:00.000Z",
    updated_at: "2024-02-03T00:00:00.000Z",
  },
  {
    id: "lesson_c2_4",
    course_id: "course_demo_2",
    title: "第4集：Server Actions 全解析",
    description: "使用 Server Actions 处理表单提交与数据变更。",
    translations: null,
    episode_number: 4,
    duration: 960,
    is_free: false,
    thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+4",
    thumbnail_asset: null,
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
    video_asset: null,
    status: "published",
    metadata: {},
    created_at: "2024-02-04T00:00:00.000Z",
    updated_at: "2024-02-04T00:00:00.000Z",
  },
  {
    id: "lesson_c2_5",
    course_id: "course_demo_2",
    title: "第5集：中间件与鉴权",
    description: "利用 Next.js Middleware 实现路由守卫与 JWT 鉴权。",
    translations: null,
    episode_number: 5,
    duration: 1100,
    is_free: false,
    thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+5",
    thumbnail_asset: null,
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
    video_asset: null,
    status: "published",
    metadata: {},
    created_at: "2024-02-05T00:00:00.000Z",
    updated_at: "2024-02-05T00:00:00.000Z",
  },
  {
    id: "lesson_c2_6",
    course_id: "course_demo_2",
    title: "第6集：数据库集成 —— Prisma + PostgreSQL",
    description: "在 Next.js 项目中集成 Prisma ORM 并连接 PostgreSQL。",
    translations: null,
    episode_number: 6,
    duration: 1350,
    is_free: false,
    thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+6",
    thumbnail_asset: null,
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
    video_asset: null,
    status: "published",
    metadata: {},
    created_at: "2024-02-06T00:00:00.000Z",
    updated_at: "2024-02-06T00:00:00.000Z",
  },
  {
    id: "lesson_c2_7",
    course_id: "course_demo_2",
    title: "第7集：部署到 Vercel",
    description: "一键部署 Next.js 全栈应用到 Vercel，配置环境变量。",
    translations: null,
    episode_number: 7,
    duration: 840,
    is_free: false,
    thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+7",
    thumbnail_asset: null,
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
    video_asset: null,
    status: "published",
    metadata: {},
    created_at: "2024-02-07T00:00:00.000Z",
    updated_at: "2024-02-07T00:00:00.000Z",
  },
  {
    id: "lesson_c2_8",
    course_id: "course_demo_2",
    title: "第8集：性能优化与监控",
    description: "Image 优化、Bundle 分析与 Sentry 错误监控接入。",
    translations: null,
    episode_number: 8,
    duration: 1200,
    is_free: false,
    thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+8",
    thumbnail_asset: null,
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
    video_asset: null,
    status: "published",
    metadata: {},
    created_at: "2024-02-08T00:00:00.000Z",
    updated_at: "2024-02-08T00:00:00.000Z",
  },
]

// ─── Static Implementation ────────────────────────────────────────────────────

export class LessonStaticRepository implements ILessonRepository {
  private store: LessonRecord[] = [...STATIC_LESSONS]

  async findAll(filters?: ListLessonsFilters): Promise<LessonRecord[]> {
    let result = this.store
    if (filters?.course_id) {
      result = result.filter((l) => l.course_id === filters.course_id)
    }
    if (filters?.status) {
      result = result.filter((l) => l.status === filters.status)
    }
    if (filters?.is_free !== undefined) {
      result = result.filter((l) => l.is_free === filters.is_free)
    }
    return result.sort((a, b) => a.episode_number - b.episode_number)
  }

  async findById(id: string): Promise<LessonRecord | null> {
    return this.store.find((l) => l.id === id) ?? null
  }

  async findByCourseId(courseId: string): Promise<LessonRecord[]> {
    return this.store
      .filter((l) => l.course_id === courseId)
      .sort((a, b) => a.episode_number - b.episode_number)
  }

  async create(input: CreateLessonInput): Promise<LessonRecord> {
    const now = new Date().toISOString()
    const record: LessonRecord = {
      ...input,
      id: `lesson_${Date.now()}`,
      translations: input.translations ?? null,
      thumbnail_asset: input.thumbnail_asset ?? null,
      video_asset: input.video_asset ?? null,
      created_at: now,
      updated_at: now,
    }
    this.store.push(record)
    return record
  }

  async update(id: string, input: UpdateLessonInput): Promise<LessonRecord | null> {
    const idx = this.store.findIndex((l) => l.id === id)
    if (idx === -1) return null
    this.store[idx] = {
      ...this.store[idx],
      ...input,
      updated_at: new Date().toISOString(),
    }
    return this.store[idx]
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.store.findIndex((l) => l.id === id)
    if (idx === -1) return false
    this.store.splice(idx, 1)
    return true
  }
}
