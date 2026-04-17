## Tasks

### Backend: Search API

- [x] 创建 `my-store/src/api/store/search/route.ts`，实现 `GET` handler，接收 `q` 和 `limit` 参数
- [x] 在 handler 中使用 `Promise.all` 并行查询 blog_post、product、course
- [x] blog 查询：`ILIKE '%q%'` 匹配 title/excerpt，过滤 `status='published'`，返回 `{id, title, slug, excerpt, cover_image}`
- [x] product 查询：`ILIKE '%q%'` 匹配 title/description，过滤 `status='published'`，返回 `{id, title, handle, thumbnail, description}`
- [x] course 查询：`ILIKE '%q%'` 匹配 title/description，过滤 `status='published'`，返回 `{id, title, handle, description, thumbnail_url}`
- [x] q 为空时返回 `{ blogs: [], products: [], courses: [], total: 0 }`
- [x] 在 `middlewares.ts` 确认 `/store/search` 路由无需鉴权（public）

### Frontend: Search UI Components

- [x] 安装无需额外依赖（使用原生 fetch + useState/useEffect）
- [x] 创建 `my-store-storefront/src/modules/layout/components/search-modal/index.tsx`，包含搜索图标按钮、Input、Results、Loading 状态
- [x] 在 SearchModal 中实现 300ms debounce（useRef + setTimeout）
- [x] 实现 ESC 键关闭、背景点击关闭、Ctrl+K 快捷键打开
- [x] 结果分组展示（博客 / 商品 / 课程），点击跳转对应详情
- [x] 空结果显示"未找到相关内容"，加载中显示 loading 动画
- [x] 将 SearchModal 插入 `templates/nav/index.tsx` 右侧区域（CartButton 左侧）
