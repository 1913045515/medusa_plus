# 视频课程销售平台需求文档

> 基于 Medusa v2.13 + Next.js 15，改造为虚拟视频课程销售独立站

---

## 一、项目背景

本项目基于 **Medusa v2.13**（后端 `my-store/`）+ **Next.js 15**（前端 `my-store-storefront/`）电商框架，
改造为**虚拟视频课程销售平台**，类似爱奇艺/B站付费视频模式：

- 每个「产品」即一门「课程」，包含多集视频
- 前 3 集免费播放，后续集数需购买后解锁
- 产品详情页替换为视频播放详情页（左视频 + 右集数列表）
- 走 Medusa 标准结账购买流程，订单完成后自动解锁全部视频

---

## 二、后端改造（`my-store/src/`）

### 2.1 新建 `video` 自定义模块

**路径**：`src/modules/video/`

#### 数据模型：`VideoLesson`

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 主键，自动生成 |
| `product_id` | string | 关联 Medusa Product ID |
| `title` | string | 集标题，如"第1集：环境搭建" |
| `episode_number` | number | 集数，从 1 开始 |
| `video_url` | string | 视频播放地址（CDN/OSS URL 或 iframe src）|
| `duration` | number | 时长（秒） |
| `is_free` | boolean | 是否免费（前3集为 true）|
| `thumbnail_url` | string | 封面图 URL |
| `description` | string | 本集简介（可选）|
| `created_at` | Date | 创建时间 |
| `updated_at` | Date | 更新时间 |

#### Module 文件结构

```
src/modules/video/
  ├── index.ts                          # Module 注册导出
  ├── models/
  │   └── video-lesson.ts               # VideoLesson 数据模型
  ├── service.ts                        # VideoModuleService CRUD
  └── migrations/
      └── Migration20260316000000.ts    # 建表迁移文件
```

### 2.2 Store API 路由

#### GET `/store/products/:id/lessons`
- **作用**：返回该课程所有集列表
- **鉴权**：无需登录
- **返回字段**：`id, title, episode_number, duration, is_free, thumbnail_url`（不含 `video_url`）
- **排序**：按 `episode_number` 升序

#### GET `/store/lessons/:id/play`
- **作用**：鉴权后返回视频播放地址
- **鉴权规则**：
  - `is_free=true` → 直接返回 `{ video_url }`
  - `is_free=false` + 未登录 → `401 Unauthorized`
  - `is_free=false` + 已登录 + 未购买 → `403 Forbidden` + `{ message: "请先购买课程" }`
  - `is_free=false` + 已登录 + 已购买 → `200 OK` + `{ video_url }`
- **购买验证**：查询 customer 是否有 `status=completed` 的订单，且订单包含该课程对应的 `product_id`

### 2.3 Admin API 路由

#### POST `/admin/products/:id/lessons`
- 新增视频集，Body: `{ title, episode_number, video_url, duration, is_free, thumbnail_url, description }`

#### GET `/admin/products/:id/lessons`
- 获取该课程所有集列表（含 `video_url`）

#### PUT `/admin/lessons/:id`
- 编辑视频集信息

#### DELETE `/admin/lessons/:id`
- 删除视频集

### 2.4 medusa-config.ts 注册模块

在 `medusa-config.ts` 的 `modules` 字段中注册 `videoModuleService`。

---

## 三、前端改造（`my-store-storefront/src/`）

### 3.1 新增数据请求层

**文件**：`src/lib/data/lessons.ts`

```typescript
// 获取课程集列表（公开，无需登录）
getCourseLessons(productId: string): Promise<Lesson[]>

// 获取视频播放地址（含服务端鉴权）
getLessonPlayUrl(lessonId: string): Promise<{ video_url: string } | { error: string; code: 401 | 403 }>
```

### 3.2 类型定义

**文件**：`src/types/lesson.ts`

```typescript
export type Lesson = {
  id: string
  product_id: string
  title: string
  episode_number: number
  duration: number
  is_free: boolean
  thumbnail_url: string | null
  description: string | null
}

export type LessonWithUrl = Lesson & { video_url: string }
```

### 3.3 视频课程详情页模板

**文件**：`src/modules/products/templates/video-course-template.tsx`

#### 页面布局

```
┌─────────────────────────────────┬─────────────────────┐
│                                 │  📚 课程标题          │
│     🎬 视频播放器区域             │  ─────────────────  │
│     （左侧 70% 宽度）             │  集数列表            │
│                                 │  ▶ 第1集  免费 ✅    │
│     - 免费集：直接播放            │    第2集  免费       │
│     - 付费集未购买：显示遮罩       │    第3集  免费       │
│       + 购买按钮                 │  🔒 第4集  VIP      │
│     - 付费集已购买：正常播放       │  🔒 第5集  VIP      │
├─────────────────────────────────│  ─────────────────  │
│  📝 课程简介 / 当前集介绍          │  [立即购买] 按钮     │
└─────────────────────────────────┴─────────────────────┘
```

### 3.4 子组件列表

| 组件 | 路径 | 说明 |
|------|------|------|
| `EpisodeList` | `components/episode-list/index.tsx` | 右侧集数列表，高亮当前集，锁定图标 |
| `VideoPlayer` | `components/video-player/index.tsx` | 左侧播放器，接收 `video_url` |
| `PurchaseLock` | `components/purchase-lock/index.tsx` | 付费遮罩 + 购买按钮 |
| `VideoCourseTemplate` | `templates/video-course-template.tsx` | 页面整体布局 |

### 3.5 产品详情页入口修改

**文件**：`src/app/[countryCode]/(main)/products/[handle]/page.tsx`

- 将 `<ProductTemplate>` 替换为 `<VideoCourseTemplate>`
- 同时传入 `lessons` 数据（服务端预取集列表）

### 3.6 购买流程

1. 点击「立即购买」→ 调用 `addToCart`（复用现有 `src/lib/data/cart.ts`）
2. 跳转至 `/checkout` 标准结账页
3. 订单完成后，重新请求 `/store/lessons/:id/play` 接口验证权限（无需 webhook）

---

## 四、核心订单鉴权说明

> 核心业务逻辑通过 Medusa 内置 Module 调用，不在 lib 包里。

| 需求场景 | 文件位置 |
|----------|---------|
| 订单创建后触发自定义逻辑 | `src/subscribers/order-placed.ts` |
| 自定义订单处理 Workflow | `src/workflows/` 下新建 workflow |
| API 中查询订单鉴权 | `req.scope.resolve("order")` 获取 OrderModuleService |
| 扩展订单关联字段 | `src/links/` 下建立 Module Link |

---

## 五、技术约束

| 项目 | 约束 |
|------|------|
| 后端框架 | Medusa v2.13，TypeScript，PostgreSQL |
| 前端框架 | Next.js 15，TypeScript，Tailwind CSS |
| 视频播放 | 优先原生 `<video>` 标签，支持阿里云/腾讯云点播 iframe |
| 认证系统 | 复用 Medusa 内置 Customer Session（`_medusa_jwt` Cookie）|
| 架构原则 | 不引入独立视频中间件，保持架构简洁 |

---

## 六、交付文件清单

### 后端（`my-store/`）

```
src/modules/video/index.ts
src/modules/video/models/video-lesson.ts
src/modules/video/service.ts
src/modules/video/migrations/Migration20260316000000.ts
src/api/store/products/[id]/lessons/route.ts
src/api/store/lessons/[id]/play/route.ts
src/api/admin/products/[id]/lessons/route.ts
src/api/admin/lessons/[id]/route.ts
medusa-config.ts                                        ← 注册 video module
```

### 前端（`my-store-storefront/`）

```
src/types/lesson.ts
src/lib/data/lessons.ts
src/modules/products/templates/video-course-template.tsx
src/modules/products/components/episode-list/index.tsx
src/modules/products/components/video-player/index.tsx
src/modules/products/components/purchase-lock/index.tsx
src/app/[countryCode]/(main)/products/[handle]/page.tsx ← 替换模板入口
```

---

## 七、开发优先级

| 优先级 | 模块 | 说明 |
|--------|------|------|
| P0 | 后端 video module + 迁移 | 数据基础 |
| P0 | Store GET /lessons API | 前端列表依赖 |
| P0 | Store GET /play API（鉴权） | 核心付费逻辑 |
| P1 | 前端 VideoPlayer + EpisodeList | 核心 UI |
| P1 | 前端 PurchaseLock + 购买流程 | 转化核心 |
| P2 | Admin API（增删改） | 运营管理 |
