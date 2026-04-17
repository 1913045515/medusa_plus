## Context

当前 `SideMenu` 硬编码 `SideMenuItems` 对象；Admin 路由完全由文件系统决定。需要数据库驱动的菜单系统支持两种场景：
1. **前台菜单（front）**：用户可见的导航，SSR 渲染，需低延迟读取
2. **Admin 菜单（admin）**：仅在菜单管理页面中维护，Admin 自身的路由仍由框架生成，但可配置显示顺序和标签

## Goals / Non-Goals

**Goals:**
- MenuItem 模型支持 `menu_type`（front/admin）、`parent_id`（两级）、`sort_order`、`is_visible`
- Admin 端：完整 CRUD + `POST /admin/menu-items/reorder` 批量更新排序
- Store 端：`GET /store/menu-items?type=front` 返回树形结构
- 前台 SideMenu 从 API 读取
- Admin 拖拽 UI：`@dnd-kit` 实现同级拖拽排序 + 跨级拖拽（成为子菜单）

**Non-Goals:**
- 三级菜单
- 菜单权限

## Decisions

### 1. 数据模型：邻接表（Adjacency List）

```
menu_item {
  id: uuid PK
  menu_type: 'front' | 'admin'
  title: text          -- 显示文本
  href: text           -- 链接路径
  icon: text nullable  -- 图标名
  parent_id: uuid FK nullable  -- null = 一级
  sort_order: int default 0
  is_visible: boolean default true
  target: text default '_self'
  created_at / updated_at
}
```

约束：`parent_id` 指向的记录的 `parent_id` 必须为 null（层级不超过 2）。
**理由**：简单、PostgreSQL 原生支持、前端树形渲染只需一次 JOIN。

**备选**：Nested Set / LTREE → 查询快但写入复杂，放弃。

### 2. 排序存储：sort_order 整数

每次拖拽后，前端计算新的完整排序数组，调用 `POST /admin/menu-items/reorder`（body: `[{id, parent_id, sort_order}]`），后端批量 UPDATE。
**理由**：避免实现间距算法，简单可靠。

### 3. 拖拽库：@dnd-kit

`@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`。
- 支持键盘无障碍
- 不依赖 React DnD，轻量
- SortableContext 原生支持嵌套列表场景

跨级拖拽（将一级移入另一级）：通过 `onDragOver` 检测是否拖到目标项的子区域（indent > threshold），动态更新 `parent_id`。

### 4. 前台 SSR 读取

`SideMenu` 变为 Server Component 场景下的异步读取，通过 `getMenuItems()` lib 函数请求内部 API（`/store/menu-items?type=front`）。注意：`SideMenu` 本身已有 `"use client"` 标记，因此改为在父级 `Nav`（Server Component）中 fetch，以 props 传入。

## Risks / Trade-offs

- [Admin 自身菜单编辑后不影响路由访问] → 路由由文件系统决定，菜单只控制展示，说明文档标注清楚
- [拖拽跨级 UX 复杂] → 增加视觉拖放提示（缩进高亮），限制最多 2 级
- [sort_order 批量更新] → 每次拖拽保存全量 sort_order，条目少（< 50）性能无问题

## Migration Plan

1. 运行 migration 创建 `menu_item` 表
2. 运行 seed 脚本插入初始菜单数据
3. 部署后端新路由
4. 部署前端：SideMenu 读 API，Admin 新增菜单管理页

## Open Questions

无
