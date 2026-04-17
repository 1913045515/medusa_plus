## Tasks

### 1. 数据模型与 Migration

- [ ] 在 `my-store/src/modules/` 新建 `menu/` 模块目录
- [ ] 创建 `my-store/src/modules/menu/models/menu-item.ts`（MenuItem 模型：id, menu_type, title, href, icon, parent_id, sort_order, is_visible, target）
- [ ] 创建 `my-store/src/modules/menu/index.ts` 导出模块
- [ ] 创建 `my-store/src/modules/menu/service.ts`（MenuService：list, create, update, delete, reorder）
- [ ] 在 `my-store/src/modules/menu/migrations/` 创建 migration 文件
- [ ] 在 `medusa-config.ts` 中注册 menu 模块

### 2. Admin 后端路由

- [ ] 创建 `my-store/src/api/admin/menu-items/route.ts`（GET list, POST create）
- [ ] 创建 `my-store/src/api/admin/menu-items/[id]/route.ts`（PUT update, DELETE delete）
- [ ] 创建 `my-store/src/api/admin/menu-items/reorder/route.ts`（POST reorder，批量更新 sort_order + parent_id）
- [ ] 确保 admin 路由有鉴权 middleware（已有全局 admin 鉴权，确认覆盖即可）

### 3. Store 公开路由

- [ ] 创建 `my-store/src/api/store/menu-items/route.ts`（GET，按 type 过滤，返回树形结构，只返回 is_visible=true 的项）
- [ ] 确认 `middlewares.ts` 中该路由为 public（无需登录）

### 4. 初始化数据 Script

- [ ] 创建 `my-store/src/scripts/seed-menu.ts`，插入前台初始菜单（首页/商店/课程/博客/账户）和 Admin 初始菜单（博客管理/课程管理/商品管理/订单管理/设置）

### 5. Admin 拖拽管理页面

- [ ] 在 `my-store-storefront`（admin 端）安装 `@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`（注意是在 my-store 的 admin extensions 或直接在后端 admin 路由中）
- [ ] 实际上 admin UI 在 `my-store/src/admin/routes/`，安装 dnd-kit 到 `my-store/package.json`
- [ ] 创建 `my-store/src/admin/routes/menu-items/page.tsx`，包含两个 tab（前台菜单 / Admin菜单）
- [ ] 实现 `SortableMenuItem` 组件（含展开/折叠子级）
- [ ] 实现同级拖拽排序（`@dnd-kit/sortable` 的 `SortableContext`）
- [ ] 实现跨级拖拽（拖到目标项缩进区域 → 成为子项，拖到根区域 → 成为一级）
- [ ] 实现拖拽结束自动调用 reorder API
- [ ] 实现新增菜单项（内联表单或弹窗）
- [ ] 实现编辑菜单项（内联编辑 title/href/is_visible）
- [ ] 实现删除菜单项（含子级级联删除确认弹窗）
- [ ] 在 `my-store/src/admin/routes/menu-items/page.tsx` 顶部加 `defineRouteConfig` 设置菜单显示名

### 6. 前台 SideMenu 改造

- [ ] 在 `my-store-storefront/src/lib/data/` 新增 `menu-items.ts`，封装 `getMenuItems(type)` 函数（server-side fetch）
- [ ] 修改 `my-store-storefront/src/modules/layout/templates/nav/index.tsx`，在 `Nav` Server Component 中调用 `getMenuItems('front')`，将结果作为 props 传给 SideMenu
- [ ] 修改 `my-store-storefront/src/modules/layout/components/side-menu/index.tsx`，接收 `menuItems` prop 替代硬编码，支持一二级渲染

### 7. 注册路由配置

- [ ] 在 `defineRouteConfig` 为菜单管理页设置图标和中文标签（`Bars3` 图标，label "菜单管理"）
