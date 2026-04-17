## Context

项目已有 blog 模块（完整的 Medusa v2 模块 + Admin 路由 + TipTapEditor 富文本组件）作为参考实现。内容页面（Content Pages）与 blog 的不同在于：内容页是"永久性公共文档"而非"博文"，不需要分类/标签/评论/访问控制，但需要页脚展示控制和登录流程引用能力。

## Goals / Non-Goals

**Goals:**
- 新建独立的 `content-pages` Medusa v2 模块（model + service + migration）
- Admin CRUD：列表、新建、编辑（含 TipTapEditor）、删除，支持草稿/发布状态
- slug 由 admin 配置，URL 最终为 `/[countryCode]/content/[slug]`
- `show_in_footer` 控制页脚linkage，`sort_order` 控制顺序
- Store API：`GET /store/content-pages`（页脚用）和 `GET /store/content-pages/:slug`（渲染用）
- Admin API：完整 CRUD `GET/POST /admin/content-pages` + `GET/PUT/DELETE /admin/content-pages/:id`
- Storefront：动态路由页面渲染 + 页脚动态链接 + 登录/注册 checkbox 链接

**Non-Goals:**
- 多语言内容版本
- 页面访问权限/密码保护
- 内容版本历史

## Decisions

### 1. 独立模块而非复用 blog 模块

blog 模块职责已经复杂（分类、标签、用户组、权限）。内容页面语义完全不同，合并进 blog 会导致过滤逻辑混乱。独立模块保持关注点分离。

### 2. 数据模型设计

```
content_page {
  id           PK
  title        text          // 页面标题，显示为 <h1> 和 <title>
  slug         text UNIQUE   // URL 路径段，admin 可配置
  body         text nullable // Tiptap HTML 内容（存储为 HTML 字符串）
  status       text          // draft | published（default: draft）
  show_in_footer boolean     // 是否出现在页脚链接
  footer_label text nullable // 页脚显示名（null 时退化用 title）
  sort_order   number        // 页脚排序
  seo_title    text nullable
  seo_description text nullable
  published_at dateTime nullable
  created_at   dateTime
  updated_at   dateTime
}
```

不用 `page_type` 枚举，改用约定 slug（`privacy-policy`、`terms-of-use`）。代码中用常量引用这两个 slug，内容完全由 admin 管理。

### 3. 富文本：直接复用现有 TipTapEditor 组件

`my-store/src/admin/components/blog/TipTapEditor.tsx` 已满足需求（bold/italic/heading/link/image/placeholder）。Content Pages 编辑页直接 import，不拷贝不修改。

### 4. 内容存储格式：HTML 字符串

与 blog.content 保持一致，存储 Tiptap 输出的 HTML 字符串。Store API 直接返回 HTML，storefront 用 `dangerouslySetInnerHTML` 渲染（已有 homepage template 的相同模式）。

### 5. 发布机制：简化版（无草稿预览）

blog 有版本历史功能，内容页不需要。发布时更新 `status=published` + `published_at`，撤回时 `status=draft`。Admin 列表用 badge 区分状态即可。

### 6. Store API 只返回已发布内容

`GET /store/content-pages` 和 `GET /store/content-pages/:slug` 只返回 `status=published` 的记录，防止草稿泄露。

### 7. 页脚集成：API 驱动

Footer 组件调用 `GET /store/content-pages?show_in_footer=true`，按 `sort_order` 排序。这样 admin 可以增删页脚链接无需前端发版。

## Risks / Trade-offs

- **slug 唯一性冲突** → 创建/更新时后端校验 slug 唯一，返回 `409` 并在 Admin UI 显示错误提示。
- **`dangerouslySetInnerHTML` XSS** → Store API 只读取数据库已存内容，Admin 写入内容时后端对 `body` 做 DOMPurify 或 sanitize-html 过滤（复用 homepage 的 sanitize 逻辑），移除 `<script>`、事件属性、`javascript:` 链接。
- **页脚 API 调用增加 Footer 渲染成本** → Footer 是 Server Component，请求在服务端发起（与 collections 请求并发），对用户无感知。可加 `next: { revalidate: 300 }` 缓存5分钟。

## Migration Plan

1. 新增 `content_page` 表 migration（Medusa v2 module migration）
2. 注册模块至 `medusa-config.ts`
3. 添加 API 路由，无 breaking changes
4. 部署 storefront，Footer 调用新 API（若返回空列表则降级为无链接，页脚不崩溃）
5. Admin 创建初始页面（隐私协议、用户协议、关于我们），发布

回滚：删除 API 路由 + 模块注册（不删 migration，空表无影响）。
