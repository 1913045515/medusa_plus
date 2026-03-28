# 开发规范（CONVENTIONS）

> 本文档是所有后续开发请求的**强制执行规范**。  
> 每新增一个业务模块，必须严格按照此结构落地。

---

## 一、后端架构分层（`my-store/src/`）

```
Route (api/)
  └─ 只做：参数提取 + 调用 Service + 格式化响应
Service (modules/xxx/services/)
  └─ 只做：业务规则 + 调用 Repository 接口
Repository Interface (modules/xxx/repositories/)
  └─ 定义数据访问契约（ICourseRepository / ILessonRepository）
Static Implementation (同文件)
  └─ 当前实现：内存静态 JSON 数据
  └─ 切换 DB：新建 XxxOrmRepository implements IXxxRepository
Module Entry (modules/xxx/index.ts)
  └─ DI 组装点：new StaticRepository() → Service → export 单例
```

### 1.1 目录结构模板

```
src/modules/{domain}/
  index.ts                          ← DI 组装点，export 单例 service
  types.ts                          ← 所有类型：Record / Input / Filters
  models/
    {entity}.ts                     ← Medusa model.define（与 DB 对齐）
  repositories/
    {entity}.repository.ts          ← Interface + Static 实现（同文件）
  services/
    {entity}.service.ts             ← 业务逻辑，依赖 Interface
  __tests__/
    {entity}.service.unit.spec.ts   ← Unit spec（mock repository）
```

### 1.2 Route 层规范

```typescript
// ✅ 正确：Route 只做胶水代码
import { entityService } from "../../../modules/domain"

export const GET = async (req, res) => {
  const items = await entityService.listItems()
  res.json({ items, count: items.length })
}

// ❌ 错误：Route 内不能有静态数据、业务判断、直接 DB 查询
```

### 1.3 Repository 规范

```typescript
// 接口与静态实现放在同一文件
export interface IXxxRepository {
  findAll(filters?: XxxFilters): Promise<XxxRecord[]>
  findById(id: string): Promise<XxxRecord | null>
  create(input: CreateXxxInput): Promise<XxxRecord>
  update(id: string, input: UpdateXxxInput): Promise<XxxRecord | null>
  delete(id: string): Promise<boolean>
}

// 静态数据段（切换 DB 时删除此段）
const STATIC_DATA: XxxRecord[] = [ ... ]

// 静态实现（切换 DB 时替换为 OrmRepository）
export class XxxStaticRepository implements IXxxRepository { ... }
```

### 1.4 切换数据库步骤（零改动 Route/Service）

1. 新建 `src/modules/{domain}/repositories/{entity}.orm.repository.ts`
2. 实现 `IXxxRepository` 接口，内部使用 MikroORM / Medusa ORM 查询
3. 在 `modules/{domain}/index.ts` 替换：
   ```typescript
   // 替换前
   const repo = new XxxStaticRepository()
   // 替换后
   const repo = new XxxOrmRepository(orm)
   ```
4. 删除 `repositories/{entity}.repository.ts` 中的 `STATIC_DATA` 常量和 `StaticRepository` 类

---

## 二、前端数据层规范（`my-store-storefront/src/`）

### 2.1 数据层位置

所有后端请求**必须**通过 `src/lib/data/` 下的 Server Action 文件发起，**禁止**在组件内直接 fetch。

```
src/lib/data/
  courses.ts    ← listCourses / getCourseByHandle
  lessons.ts    ← getCourseLessons / getLessonPlayUrl
  cart.ts       ← （已有）
  ...
```

### 2.2 data 函数模板

```typescript
"use server"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

const baseHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  ...(PUBLISHABLE_KEY ? { "x-publishable-api-key": PUBLISHABLE_KEY } : {}),
}

export async function listXxx(): Promise<Xxx[]> {
  const res = await fetch(`${BACKEND_URL}/store/xxx`, {
    method: "GET",
    headers: baseHeaders,
    cache: "no-store",
  })
  if (!res.ok) return []
  const data = (await res.json()) as { xxx?: Xxx[] }
  return data.xxx ?? []
}
```

### 2.3 数据流向

```
Page (Server Component)
  └─ 调用 src/lib/data/*.ts（Server Action）
       └─ fetch → back 服务 API（localhost:9000）
            └─ Route → Service → Repository
```

---

## 三、Spec 测试规范

### 3.1 文件命名与位置

| 类型 | 位置 | 文件命名 | 运行命令 |
|------|------|----------|----------|
| 后端 Unit | `src/modules/{domain}/__tests__/` | `*.unit.spec.ts` | `TEST_TYPE=unit npm test` |
| 后端 Integration | `integration-tests/http/` | `*.spec.ts` | `TEST_TYPE=integration:http npm test` |
| 前端 Unit | `src/lib/data/__tests__/` 或组件同级 `__tests__/` | `*.spec.ts` | `jest` |

### 3.2 Unit Spec 模板（后端 Service）

```typescript
import { XxxService } from "../services/xxx.service"
import type { IXxxRepository } from "../repositories/xxx.repository"
import type { XxxRecord } from "../types"

// ── Factory helpers ───────────────────────────────────────────────────────────
const makeRecord = (overrides: Partial<XxxRecord> = {}): XxxRecord => ({
  id: "xxx_1",
  // ...默认字段
  ...overrides,
})

const makeRepo = (overrides: Partial<IXxxRepository> = {}): IXxxRepository => ({
  findAll: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockResolvedValue(makeRecord()),
  update: jest.fn().mockResolvedValue(null),
  delete: jest.fn().mockResolvedValue(false),
  ...overrides,
})

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("XxxService", () => {
  describe("listXxx", () => {
    it("returns records from repository", async () => {
      const record = makeRecord()
      const repo = makeRepo({ findAll: jest.fn().mockResolvedValue([record]) })
      const service = new XxxService(repo)

      const result = await service.listXxx()

      expect(repo.findAll).toHaveBeenCalledWith(undefined)
      expect(result).toEqual([record])
    })
  })
  // ...更多场景
})
```

### 3.3 Integration Spec 模板（后端 HTTP）

```typescript
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"

jest.setTimeout(60 * 1000)

medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api }) => {
    describe("GET /store/xxx", () => {
      it("returns 200 with xxx array", async () => {
        const response = await api.get("/store/xxx")
        expect(response.status).toEqual(200)
        expect(Array.isArray(response.data.xxx)).toBe(true)
      })
    })
  },
})
```

### 3.4 前端 data 层 Spec 模板

```typescript
import { listXxx } from "../xxx"

const mockFetch = (status: number, body: unknown) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  })
}

afterEach(() => jest.restoreAllMocks())

describe("listXxx", () => {
  it("returns data on 200", async () => {
    mockFetch(200, { xxx: [{ id: "1" }] })
    const result = await listXxx()
    expect(result).toHaveLength(1)
  })

  it("returns empty array on error", async () => {
    mockFetch(500, {})
    expect(await listXxx()).toEqual([])
  })
})
```

---

## 四、Store API 字段安全规范

| 接口 | 不可暴露字段 | 说明 |
|------|-------------|------|
| `GET /store/courses/:id/lessons` | `video_url` | 仅 `/play` 接口按权限返回 |
| `GET /store/lessons/:id/play` | — | 需鉴权，free=true 直接返回，否则验证购买 |
| `GET /admin/*` | — | 全字段返回，需 admin token |

---

## 五、模块新增 Checklist

新增业务模块时，必须创建以下文件：

- [ ] `src/modules/{domain}/types.ts` — 类型定义
- [ ] `src/modules/{domain}/models/{entity}.ts` — Medusa 数据模型
- [ ] `src/modules/{domain}/repositories/{entity}.repository.ts` — Interface + Static 实现
- [ ] `src/modules/{domain}/services/{entity}.service.ts` — 业务逻辑
- [ ] `src/modules/{domain}/index.ts` — DI 组装 + export 单例
- [ ] `src/modules/{domain}/__tests__/{entity}.service.unit.spec.ts` — Unit spec
- [ ] `src/api/store/{domain}/route.ts` — Store GET 路由
- [ ] `src/api/admin/{domain}/route.ts` — Admin CRUD 路由
- [ ] `integration-tests/http/{domain}.spec.ts` — HTTP Integration spec
- [ ] `my-store-storefront/src/lib/data/{domain}.ts` — 前端 data 函数
- [ ] `my-store-storefront/src/lib/data/__tests__/{domain}.spec.ts` — 前端 data spec

---

## 六、OpenAPI Spec 规范（`my-store/openapi/`）

> 每新增或修改一个 API 接口，**必须同步更新对应的 Spec 文件**，并通过 lint 校验后才能合并。

### 6.1 文件结构

```
my-store/openapi/
  store.yaml                        ← Store API 主文件（/store/* 路由）
  admin.yaml                        ← Admin API 主文件（/admin/* 路由）
  components/
    parameters.yaml                 ← 公共路径参数 / Header 参数
    schemas/
      course.yaml                   ← Course / CreateCourseInput / UpdateCourseInput
      lesson.yaml                   ← Lesson / LessonAdmin / CreateLessonInput / UpdateLessonInput
      common.yaml                   ← Error / DeleteResponse / PlayUrlResponse
  dist/                             ← bundle 产物（gitignore，CI 生成）
    store.bundle.yaml
    admin.bundle.yaml
```

### 6.2 常用命令

| 命令 | 说明 |
|------|------|
| `npm run spec:lint` | 校验 store.yaml + admin.yaml（**提交前必须执行**） |
| `npm run spec:preview:store` | 在 http://localhost:8080 预览 Store API 文档 |
| `npm run spec:preview:admin` | 在 http://localhost:8081 预览 Admin API 文档 |
| `npm run spec:bundle` | bundle 两个 spec 为单文件（生成至 `openapi/dist/`） |

### 6.3 Spec 编写规范

#### Schema 放置原则

| Schema 类型 | 放置位置 |
|-------------|---------|
| 实体对象（响应用） | `components/schemas/{domain}.yaml` |
| 创建/更新请求体 | 同上，命名 `CreateXxxInput` / `UpdateXxxInput` |
| 路径参数 / Header | `components/parameters.yaml` |
| 通用响应（Error / Delete） | `components/schemas/common.yaml` |

#### 必须遵守的 lint 规则

| 规则 | 级别 | 说明 |
|------|------|------|
| `operation-summary` | error | 每个 operation 必须有 `summary` |
| `operation-operationId` | error | 每个 operation 必须有唯一 `operationId` |
| `operation-tag-defined` | error | tag 必须在顶层 `tags` 中声明 |
| `path-parameters-defined` | error | 路径参数必须在 `parameters` 中定义 |
| `no-ambiguous-paths` | error | 路径不能有歧义 |
| `scalar-property-missing-example` | warn | 每个标量字段建议提供 `example` |

#### operationId 命名约定

```
{scope}-{action}-{resource}

# 示例
store-list-courses           ← GET  /store/courses
store-list-course-lessons    ← GET  /store/courses/{id}/lessons
store-get-lesson-play-url    ← GET  /store/lessons/{id}/play
admin-list-courses           ← GET  /admin/courses
admin-create-course          ← POST /admin/courses
admin-get-course             ← GET  /admin/courses/{id}
admin-update-course          ← PUT  /admin/courses/{id}
admin-delete-course          ← DELETE /admin/courses/{id}
```

#### $ref 引用规范

```yaml
# ✅ 正确：引用 components 目录下的文件
schema:
  $ref: './components/schemas/course.yaml#/Course'

parameters:
  - $ref: './components/parameters.yaml#/CourseIdParam'

# ❌ 错误：在 path 内联定义可复用的 schema
schema:
  type: object
  properties:
    id:
      type: string
```

### 6.4 新增接口 Checklist

新增一个 API 接口时，必须完成以下步骤：

- [ ] 在 `route.ts` 中实现接口逻辑
- [ ] 在对应的 `store.yaml` 或 `admin.yaml` 中新增 path + operation
- [ ] 补充 `summary`、`operationId`、`tags`、`parameters`、`requestBody`（POST/PUT）
- [ ] 补充所有响应码（200 / 201 / 401 / 403 / 404）的 `schema` 和 `example`
- [ ] 如有新 Schema，在 `components/schemas/` 下对应文件中定义，使用 `$ref` 引用
- [ ] 执行 `npm run spec:lint` —— **必须 0 errors**（warnings 允许但需说明）
- [ ] 在 `integration-tests/http/` 中的对应 spec 文件补充该接口的测试用例

### 6.5 Store vs Admin 字段差异

| 字段 | Store API | Admin API | 说明 |
|------|-----------|-----------|------|
| `video_url`（Lesson） | ❌ 不返回 | ✅ 返回 | Store 通过 `/play` 鉴权后获取 |
| `status=draft` 的课程 | ❌ 不返回 | ✅ 返回 | Store 只返回 `published` |
| 所有课时字段 | 返回（不含 `video_url`） | 返回全部 | Admin 使用 `LessonAdmin` schema |
