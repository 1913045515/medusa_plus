## Context

前台导航（`layout/templates/nav/index.tsx`）目前只有固定的 Courses / Blog / Account 链接，无搜索入口。博客、商品、课程分别存储在 `blog_post`、Medusa 内置 `product` 及 `course` 表中，字段已有 title 和 description/excerpt，可直接利用 ILIKE 做全文模糊匹配。

## Goals / Non-Goals

**Goals:**
- 新增 `GET /store/search?q=&limit=` 接口，并行查询三张表
- 前台导航栏右侧搜索图标 → 弹窗，debounce 输入，分组展示结果

**Non-Goals:**
- Phase 2 Meilisearch / pgvector
- 搜索结果分页

## Decisions

### 1. 全文检索策略：ILIKE 优先，GIN 索引备用

使用 `ILIKE '%keyword%'` 对 title + excerpt/description 匹配：
- 无需数据库扩展，直接可用
- 数据量 < 5 万条时 ILIKE 配合 pg_trgm GIN 索引响应 < 20ms
- 后续升级 Meilisearch 时只改后端接口，前端不动

**备选**：`to_tsvector + tsquery`（中文需装 zhparser，环境约束大，放弃）

### 2. API 结构：单接口并行查询

```
GET /store/search?q=keyword&limit=5
Response:
{
  "blogs": [{ id, title, slug, excerpt, cover_image }],
  "products": [{ id, title, handle, thumbnail, description }],
  "courses": [{ id, title, handle, description, thumbnail_url }],
  "total": N
}
```

在 Medusa route handler 中用 `Promise.all` 并行执行三条 SQL，整体响应 < 50ms。

### 3. 前端组件结构

```
Nav (server component)
└─ SearchIcon (client component) -- 搜索图标按钮
   └─ SearchModal (client component) -- 弹窗/覆盖层
      ├─ SearchInput - 输入框 + debounce
      └─ SearchResults - 分组结果列表
```

`SearchModal` 挂载到 `document.body` via Portal，避免 z-index 层叠问题。

### 4. 防抖策略

输入后 300ms debounce 触发 fetch，query 长度 < 2 时不请求，返回空态。

## Risks / Trade-offs

- [ILIKE 不支持中文分词] → 字符级模糊匹配仍可用，"课程"能搜到"Python 课程"
- [并发写入时索引维护] → GIN 索引异步维护，写峰期略微影响搜索精度，可接受
- [无结果缓存] → 相同关键词重复请求直接打 DB → 后续可加 Redis 缓存层

## Migration Plan

1. 部署后端新路由（无 schema 变更，无数据迁移）
2. 部署前端新组件

无需回滚计划（纯新增，删除路由和组件即可回滚）

## Open Questions

无
