## 1. 后端：store-settings 模块

- [x] 1.1 创建模块目录结构 `my-store/src/modules/store-settings/`，含 `models/store-setting.ts`（定义 `cart_enabled` 字段，默认 `true`）
- [x] 1.2 创建 `my-store/src/modules/store-settings/service.ts`，实现 `getSettings()` 和 `updateSettings(data)` 方法（读不存在时自动创建默认记录）
- [x] 1.3 创建 `my-store/src/modules/store-settings/migrations/` 初始 migration，创建 `store_settings` 表
- [x] 1.4 创建 `my-store/src/modules/store-settings/index.ts`，导出模块定义和 `STORE_SETTINGS_MODULE` 常量
- [x] 1.5 在 `my-store/medusa-config.ts` 中注册 `store-settings` 模块

## 2. 后端：Admin API

- [x] 2.1 创建 `my-store/src/api/admin/store-settings/route.ts`，实现 `GET` 读取设置（返回 `{ store_settings: { cart_enabled } }`）
- [x] 2.2 在同一文件实现 `PUT` 更新设置（接受 `{ cart_enabled: boolean }` 并返回更新后的设置）

## 3. 后端：Store API

- [x] 3.1 创建 `my-store/src/api/store/store-settings/route.ts`，实现无鉴权的 `GET`，返回 `{ store_settings: { cart_enabled } }`

## 4. Admin 前端：商店设置页面

- [x] 4.1 创建 `my-store/src/admin/routes/store-settings/page.tsx`，页面加载时调用 `GET /admin/store-settings` 获取 `cart_enabled`
- [x] 4.2 页面添加 `@medusajs/ui` 的 Switch（或 Toggle）组件作为购物车显示/隐藏开关，并添加保存按钮
- [x] 4.3 点击保存时调用 `PUT /admin/store-settings`，成功后显示 `toast` 成功提示，失败时显示错误提示并恢复开关状态
- [x] 4.4 在页面文件中导出 `config`，使其显示在 Admin 侧边栏（参考 `site-analytics/page.tsx` 的 `defineRouteConfig` 用法）

## 5. Storefront：读取配置

- [x] 5.1 在 `my-store-storefront/src/lib/data/` 新增 `store-settings.ts`，导出 `getStoreSettings()` 函数，调用 `GET /store/store-settings` 并返回 `{ cartEnabled: boolean }`
- [x] 5.2 在 `my-store-storefront/src/modules/layout/templates/nav/index.tsx`（或对应的 Server Component）中调用 `getStoreSettings()`，将 `cartEnabled` 传递给 `CartButton` 和相关组件

## 6. Storefront：购物车图标条件渲染

- [x] 6.1 修改 `my-store-storefront/src/modules/layout/components/cart-button/index.tsx`，接受 `cartEnabled` prop，当 `cartEnabled` 为 `false` 时返回 `null`
- [x] 6.2 修改调用 `CartButton` 的父组件，传入 `cartEnabled` prop

## 7. Storefront：产品页 Buy Now 逻辑

- [x] 7.1 修改 `my-store-storefront/src/modules/products/components/product-actions/index.tsx`，接受 `cartEnabled` prop
- [x] 7.2 当 `cartEnabled` 为 `false` 时，将按钮文本改为"Buy Now"，点击后调用 `handleAddToCart()` 成功后使用 `router.push` 跳转到 `/{countryCode}/checkout`（不显示购物车成功弹窗）
- [x] 7.3 修改 `my-store-storefront/src/modules/products/components/product-actions/mobile-actions.tsx`，接受 `cartEnabled` prop，`cart_enabled=false` 时按钮改为"Buy Now"并直接跳转结算页（不显示加购成功弹窗）
- [x] 7.4 在调用 `ProductActions` 的父组件（产品详情页）中获取 `cartEnabled` 并传入（使用 Server Component 调用 `getStoreSettings()`）
