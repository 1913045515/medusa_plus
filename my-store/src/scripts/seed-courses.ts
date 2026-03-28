import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function seedCourses({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("Seeding course & lesson demo data (seed-courses)...")

  // 幂等：若已存在 demo 数据则不重复插入
  const existingCourses = await query.graph({
    entity: "course",
    fields: ["id"],
    filters: { id: ["course_demo_1", "course_demo_2"] },
  })

  const existingCourseIds = new Set((existingCourses.data ?? []).map((c: any) => c.id))

  const courseModule = container.resolve("course") as any

  const coursesToCreate = [
    {
      id: "course_demo_1",
      handle: "demo-course-1",
      title: "React 从零到一",
      description: "系统学习 React 核心概念，包含 Hooks、状态管理与项目实战。",
      thumbnail_url: "https://via.placeholder.com/640x360?text=React+Course",
      level: "beginner",
      lessons_count: 4,
      status: "published",
      metadata: {},
    },
    {
      id: "course_demo_2",
      handle: "demo-course-2",
      title: "Next.js 全栈开发",
      description: "深入 Next.js App Router，Server Components 与全栈部署实战。",
      thumbnail_url: "https://via.placeholder.com/640x360?text=Next.js+Course",
      level: "intermediate",
      lessons_count: 8,
      status: "published",
      metadata: {},
    },
  ].filter((c) => !existingCourseIds.has(c.id))

  if (coursesToCreate.length) {
    await courseModule.createCourses(coursesToCreate)
  }

  const existingLessons = await query.graph({
    entity: "lesson",
    fields: ["id"],
    filters: {
      id: [
        "lesson_c1_1",
        "lesson_c1_2",
        "lesson_c1_3",
        "lesson_c1_4",
        "lesson_c2_1",
        "lesson_c2_2",
        "lesson_c2_3",
        "lesson_c2_4",
        "lesson_c2_5",
        "lesson_c2_6",
        "lesson_c2_7",
        "lesson_c2_8",
      ],
    },
  })

  const existingLessonIds = new Set((existingLessons.data ?? []).map((l: any) => l.id))

  const lessonsToCreate = [
    // course_demo_1
    {
      id: "lesson_c1_1",
      course_id: "course_demo_1",
      title: "第1集：开发环境搭建",
      description: "安装 Node.js、VS Code 并初始化第一个 React 项目。",
      episode_number: 1,
      duration: 600,
      is_free: true,
      thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+1",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "published",
      metadata: {},
    },
    {
      id: "lesson_c1_2",
      course_id: "course_demo_1",
      title: "第2集：JSX 与组件基础",
      description: "学习 JSX 语法、函数组件与 Props 传递。",
      episode_number: 2,
      duration: 780,
      is_free: true,
      thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+2",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "published",
      metadata: {},
    },
    {
      id: "lesson_c1_3",
      course_id: "course_demo_1",
      title: "第3集：useState 与 useEffect",
      description: "深入理解 React 核心 Hooks 的使用场景与陷阱。",
      episode_number: 3,
      duration: 1200,
      is_free: false,
      thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+3",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "published",
      metadata: {},
    },
    {
      id: "lesson_c1_4",
      course_id: "course_demo_1",
      title: "第4集：项目实战 —— Todo App",
      description: "综合运用所学知识，构建一个完整的 Todo 应用并部署上线。",
      episode_number: 4,
      duration: 1800,
      is_free: false,
      thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+4",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "published",
      metadata: {},
    },

    // course_demo_2
    {
      id: "lesson_c2_1",
      course_id: "course_demo_2",
      title: "第1集：App Router 核心概念",
      description: "理解 Next.js App Router 目录结构与路由规则。",
      episode_number: 1,
      duration: 720,
      is_free: true,
      thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+1",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "published",
      metadata: {},
    },
    {
      id: "lesson_c2_2",
      course_id: "course_demo_2",
      title: "第2集：Server Components vs Client Components",
      description: "掌握两种组件模式的边界与最佳实践。",
      episode_number: 2,
      duration: 900,
      is_free: true,
      thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+2",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "published",
      metadata: {},
    },
    {
      id: "lesson_c2_3",
      course_id: "course_demo_2",
      title: "第3集：数据获取与缓存策略",
      description: "fetch 缓存与 revalidate 的使用。",
      episode_number: 3,
      duration: 1050,
      is_free: false,
      thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+3",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "published",
      metadata: {},
    },
    {
      id: "lesson_c2_4",
      course_id: "course_demo_2",
      title: "第4集：Server Actions 全解析",
      description: "使用 Server Actions 处理表单提交与数据变更。",
      episode_number: 4,
      duration: 960,
      is_free: false,
      thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+4",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "published",
      metadata: {},
    },
    {
      id: "lesson_c2_5",
      course_id: "course_demo_2",
      title: "第5集：中间件与鉴权",
      description: "利用 Middleware 实现路由守卫与鉴权。",
      episode_number: 5,
      duration: 1100,
      is_free: false,
      thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+5",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "published",
      metadata: {},
    },
    {
      id: "lesson_c2_6",
      course_id: "course_demo_2",
      title: "第6集：数据库集成 —— PostgreSQL",
      description: "在项目中集成并使用 PostgreSQL。",
      episode_number: 6,
      duration: 1350,
      is_free: false,
      thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+6",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "published",
      metadata: {},
    },
    {
      id: "lesson_c2_7",
      course_id: "course_demo_2",
      title: "第7集：部署",
      description: "部署全栈应用并配置环境变量。",
      episode_number: 7,
      duration: 840,
      is_free: false,
      thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+7",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "published",
      metadata: {},
    },
    {
      id: "lesson_c2_8",
      course_id: "course_demo_2",
      title: "第8集：性能优化与监控",
      description: "常用性能优化手段与监控接入。",
      episode_number: 8,
      duration: 1200,
      is_free: false,
      thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+8",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "published",
      metadata: {},
    },
  ].filter((l) => !existingLessonIds.has(l.id))

  if (lessonsToCreate.length) {
    await courseModule.createLessons(lessonsToCreate)
  }

  logger.info("Finished seeding course & lesson demo data (seed-courses).")
}
