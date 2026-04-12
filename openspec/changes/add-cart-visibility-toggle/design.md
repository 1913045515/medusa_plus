## Context

当前系统没有全局购物车可见性控制。购物车逻辑分散在 Storefront 多个组件中（cart-button、cart-dropdown、product-actions、mobile-actions）。需要一个轻量级的全局配置存储，支持在 Admin 端切换并在 Storefront 端无需重新部署即可生效。

## Goals / Non-Goals

**Goals:**
- 用单条数据库记录存储全局商店配置（`cart_enabled: boolean`）
- Admin REST API 读写该配置，Storefront REST API 只读
- Admin 页面提供开关 UI
- Storefront 在每次请求时从 API 动态读取配置，条件渲染购物车相关 UI

**Non-Goals:**
- 每用户/每地区差异配置
- 配置历史记录或版本管理
- 结算流程本身的修改

## Decisions

### D1：使用独立的 `store-settings` Medusa 模块而非扩展现有模块

**选择**：新建 `my-store/src/modules/store-settings/`，遵循项目已有的 `product-detail`、`site-analytics` 等模块结构。

**理由**：与项目约定一致，模块边界清晰，未来可扩展更多设置项（如主题、语言等），而不污染业务逻辑模块。

**备选**：将配置写入文件系统 `.env` 或扩展 Medusa Store 实体——被否决，因环境变量需重启才生效，且 Medusa Store 扩展耦合度高。

### D2：Storefront 在服务端（Server Component）读取配置

**选择**：在 Next.js Server Components（如 `nav/index.tsx`）中调用 `/store/store-settings`，将 `cartEnabled` 作为 prop 传递给子组件。

**理由**：避免客户端 hydration 闪烁（先显示购物车再隐藏），性能更好，SEO 友好。

**备选**：客户端 `useEffect` 调用——被否决，会导致界面闪烁。

### D3：`cart_enabled` 默认值为 `true`（兼容现有行为）

**理由**：确保首次部署时行为不变，管理员需主动关闭才隐藏购物车。

## Risks / Trade-offs

- **[风险] 配置数据库表不存在** → 使用 Medusa migration 在部署时自动创建
- **[风险] Storefront 与 Backend 之间的网络延迟** → 在 Server Component 中调用，与其他数据获取一起 fetch，不增加用户感知延迟
- **[取舍] 无缓存** → 配置变更立即生效（下一次页面请求），无需缓存失效机制，适合低频配置更新场景
