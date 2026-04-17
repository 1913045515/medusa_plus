## Why

前台 `SideMenu` 和 Admin 的菜单导航均为硬编码，无法在不改代码的情况下调整菜单项顺序、层级或增删导航链接。需要支持运营人员通过 Admin 后台可视化管理前台及 Admin 自身的菜单配置。

## What Changes

- 新增 `menu_item` 数据模型（支持 parent_id 实现两级层级）
- Admin 后台新增"菜单管理"页面，支持拖拽排序、层级变更，自动同步到数据库
- 前台 `SideMenu` 改为从 `/store/menu-items` 接口动态读取，`menu_type = 'front'`
- Admin 菜单同样从数据库读取，`menu_type = 'admin'`（当前 Admin 路由为静态，本期只管理前台菜单；Admin 自身菜单在扩展中以独立列表展示）
- 提供初始化 seed 脚本，将当前硬编码菜单写入数据库

## Capabilities

### New Capabilities
- `menu-item-model`: MenuItem 数据模型与 migration
- `menu-admin-api`: Admin 侧菜单 CRUD 及批量排序接口
- `menu-store-api`: Store 侧公开菜单读取接口
- `menu-admin-ui`: Admin 拖拽菜单管理页面
- `menu-storefront-integration`: 前台 SideMenu 改为数据库驱动

### Modified Capabilities
（无）

## Impact

- **数据库**：新增 `menu_item` 表（含 migration）
- **后端**：新增 `/admin/menu-items` + `/store/menu-items` 路由
- **前台**：`SideMenu` 改为异步读取
- **Admin**：新增拖拽管理页（`routes/menu-items/page.tsx`）
- **依赖**：`@dnd-kit/core` `@dnd-kit/sortable` `@dnd-kit/utilities`（admin 端）

## Non-goals

- 不支持三级及以上菜单
- 不支持菜单权限控制（所有已登录 Admin 均可编辑）
- 不实现菜单预览功能
