## 1. 后端：Store Settings 扩展 - 结算字段配置

- [x] 1.1 在 `my-store/src/modules/store-settings/` 中定义结算字段配置的默认值常量（`checkout-field-defaults.ts`），包含所有字段的 visible/required 初始值
- [x] 1.2 在 `my-store/src/api/admin/store-settings/` 下新增 `checkout-fields/route.ts`，实现 GET 端点（读取配置，不存在则返回默认值）
- [x] 1.3 在同路由文件中实现 PUT 端点（校验 country visible 不可为 false，持久化 JSON 配置至 store-settings key: `checkout_field_config`）
- [x] 1.4 在 PUT 端点中验证 Email 字段不可通过 API 修改（过滤掉 email 相关配置）

## 2. Admin 扩展：结算字段配置页面

- [x] 2.1 在 `my-store/src/admin/` 下新增结算字段配置页面组件（`checkout-field-config/page.tsx`），列出所有可配置字段及其 visible/required 开关
- [x] 2.2 在页面中标注 Email、Country visible 为系统锁定（禁用对应 toggle，显示提示说明）
- [x] 2.3 集成保存功能：PUT `/admin/store-settings/checkout-fields`，保存成功后展示 toast 提示
- [x] 2.4 在 Admin 路由配置中注册新页面（`my-store/src/admin/routes.tsx` 或对应 admin-extensions 入口）

## 3. 前端：配置数据获取

- [x] 3.1 在 `my-store-storefront/src/lib/data/` 中新增 `checkout-config.ts`，封装 `getCheckoutFieldConfig()` 函数（调用 `/store/checkout-fields` 或直接通过 server action 调用 admin API）
- [x] 3.2 新增 Store API 端点 `GET /store/checkout-fields`（无需 auth），供前端 Server Component 调用
- [x] 3.3 在 `my-store-storefront/src/modules/checkout/templates/` 中的 checkout layout 层面调用 `getCheckoutFieldConfig()`，将配置传递给 Addresses 组件

## 4. 前端：动态字段渲染

- [x] 4.1 修改 `my-store-storefront/src/modules/checkout/components/shipping-address/index.tsx`，接收 `fieldConfig` prop，按配置控制每个字段的 `hidden` 和 `required` 属性
- [x] 4.2 修改 `my-store-storefront/src/modules/checkout/components/billing_address/index.tsx`，同样接收并应用 `fieldConfig`
- [x] 4.3 修改 `my-store-storefront/src/modules/checkout/components/addresses/index.tsx`，将 `fieldConfig` 和 `isVirtualCart` 传递给子组件

## 5. 前端：虚拟购物车简化模式

- [x] 5.1 在 `my-store-storefront/src/modules/checkout/components/addresses/index.tsx` 中新增 `isVirtualCart` 计算逻辑（`cart.items.every(item => item.product?.metadata?.is_virtual === true)`）
- [x] 5.2 当 `isVirtualCart === true` 时，ShippingAddress 组件仅渲染 Email 字段和 billing-same-as-shipping checkbox，隐藏所有地址字段
- [x] 5.3 验证简化模式下表单提交仅包含 email 字段，地址字段不参与验证

## 6. 验证与测试

- [ ] 6.1 在 Admin 中测试：配置字段后刷新前端结算页确认字段按配置显示/隐藏
- [ ] 6.2 测试虚拟产品购物车自动触发简化模式
- [ ] 6.3 测试 Country 字段在 Admin 隐藏 toggle 被禁用，PUT 接口拒绝 country.visible=false
- [ ] 6.4 测试配置 API 异常时前端回退到默认配置正常渲染
