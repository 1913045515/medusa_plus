## Why

用户无法跨平台搜索内容（Blog、商品、课程），只能逐一进入各页面浏览。全文检索功能可显著提升用户体验，帮助用户快速定位感兴趣的内容。

## What Changes

- 在前台导航栏右侧增加搜索图标，点击弹出搜索覆盖层
- 新增 `GET /store/search` 接口，并行查询 blog_post、product、course 三张表
- 搜索支持标题 + 描述的 PostgreSQL 全文模糊检索（ILIKE + tsvector）
- 结果按类型分组（博客 / 商品 / 课程），点击跳转对应详情页
- 输入框 debounce 300ms 自动触发，Esc / 点击背景关闭

## Capabilities

### New Capabilities
- `global-search-api`: 后端搜索接口，并行查询三张表，返回统一结构
- `global-search-ui`: 前台搜索入口图标 + 搜索弹窗组件

### Modified Capabilities
（无已有 spec 需要修改）

## Impact

- **后端**：新增 `/store/search` 路由文件，无数据库 schema 变更（利用现有表）
- **前端**：修改 Nav 组件（`templates/nav/index.tsx`），新增 `SearchModal` 和 `SearchIcon` 组件
- **依赖**：无新引入

## Non-goals

- 不实现 Meilisearch / Elasticsearch / pgvector 语义搜索（Phase 2）
- 不支持搜索结果分页（首次返回 top 5 per type）
- 不搜索内容页（content-pages）、用户评论等次要内容
