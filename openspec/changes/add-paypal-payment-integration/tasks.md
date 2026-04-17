## 1. 后端基础设置

- [x] 1.1 安装依赖：在 `my-store/package.json` 中添加 `node-fetch`（或使用内置 fetch，Node 18+）以支持 PayPal REST API 调用
- [x] 1.2 在 `my-store` 添加环境变量定义：`PAYPAL_CONFIG_ENCRYPTION_KEY`（32字节，用于 AES-256-GCM 加密 Client Secret）
- [x] 1.3 创建 `my-store/src/modules/paypal/index.ts`，定义 PayPal 模块入口并在 `medusa-config.ts` 中注册

## 2. 数据库模型

- [x] 2.1 创建 `my-store/src/modules/paypal/models/paypal-config.ts`，定义 `PaypalConfig` Entity（字段：`id`、`client_id`、`client_secret_encrypted`、`mode`、`card_fields_enabled`、`created_at`、`updated_at`）
- [x] 2.2 创建对应的 Medusa v2 数据库迁移文件（`my-store/src/modules/paypal/migrations/`），生成 `paypal_config` 表
- [x] 2.3 创建 `PaypalConfigService`（`my-store/src/modules/paypal/service.ts`），实现配置的 CRUD 与 AES-256-GCM 加解密逻辑

## 3. PayPal REST API 客户端

- [x] 3.1 创建 `my-store/src/modules/paypal/paypal-client.ts`，封装 PayPal OAuth Token 获取（`/v1/oauth2/token`）与 Access Token 内存缓存（含自动刷新逻辑）
- [x] 3.2 在 `paypal-client.ts` 中实现 `createOrder`（`POST /v2/checkout/orders`）方法
- [x] 3.3 在 `paypal-client.ts` 中实现 `captureOrder`（`POST /v2/checkout/orders/{id}/capture`）方法
- [x] 3.4 在 `paypal-client.ts` 中实现 `refundCapture`（`POST /v2/payments/captures/{id}/refund`）方法
- [x] 3.5 在 `paypal-client.ts` 中实现沙盒/正式环境 API baseUrl 动态切换逻辑

## 4. Medusa Payment Provider

- [x] 4.1 创建 `my-store/src/modules/paypal/paypal-payment-provider.ts`，继承 `AbstractPaymentProvider`，实现 `initiatePayment`（调用 `createOrder`）
- [x] 4.2 实现 `authorizePayment`（记录 PayPal Order ID，等待顾客批准）
- [x] 4.3 实现 `capturePayment`（调用 `captureOrder`，更新 payment session data）
- [x] 4.4 实现 `cancelPayment`（标记取消，不调用 PayPal API，PayPal 订单自动过期）
- [x] 4.5 实现 `refundPayment`（调用 `refundCapture`，传递退款金额）
- [x] 4.6 实现 `retrievePayment` 和 `getPaymentStatus`（从 payment session data 读取状态）
- [x] 4.7 在 `medusa-config.ts` 中将 `pp_paypal` 注册为 Payment Provider

## 5. Admin API 端点

- [x] 5.1 创建 `my-store/src/api/admin/paypal/route.ts`，实现 `GET`（读取配置，Client Secret 返回掩码）和 `POST`（写入/更新配置）
- [x] 5.2 创建 `my-store/src/api/admin/paypal/test-connection/route.ts`，实现 `POST`（测试 OAuth 连通性，返回成功/失败）
- [x] 5.3 为 Admin API 端点添加 Medusa admin 认证中间件，确保仅管理员可访问

## 6. Store API 端点

- [x] 6.1 创建 `my-store/src/api/store/paypal/config/route.ts`，实现 `GET`（返回 `client_id`、`mode`、`card_fields_enabled`，不含 Secret）
- [x] 6.2 在配置未设置时返回 `{ enabled: false }`

## 7. Admin 前端配置页面

- [x] 7.1 创建 `my-store/src/admin/routes/settings/paypal/page.tsx`，实现 PayPal 配置表单组件（Client ID、Client Secret、环境模式下拉、信用卡开关）
- [x] 7.2 实现正式环境橙色警示横幅（当 mode 为 `live` 时显示）
- [x] 7.3 实现 Client Secret 掩码切换显示按钮
- [x] 7.4 实现"测试连接"按钮及其成功/失败状态反馈 UI
- [x] 7.5 将 PayPal 设置页面注册到 admin Settings 侧边栏（`my-store/src/admin/routes/settings/paypal/`）
- [x] 7.6 添加 admin 所需的 i18n 文案（中英文）

## 8. Storefront 结账集成

- [x] 8.1 在 `my-store-storefront/package.json` 中添加 `@paypal/react-paypal-js` 依赖
- [x] 8.2 创建 `my-store-storefront/src/modules/checkout/components/paypal-provider/index.tsx`，封装 `PayPalScriptProvider`，在组件挂载时请求 `/store/paypal/config` 以获取 `client_id` 和 `mode`
- [x] 8.3 创建 `my-store-storefront/src/modules/checkout/components/paypal-button/index.tsx`，实现 `PayPalButtons` 组件（`createOrder` 调用后端、`onApprove` 触发捕获）
- [x] 8.4 创建 `my-store-storefront/src/modules/checkout/components/paypal-card-fields/index.tsx`，实现信用卡托管表单（`PayPalCardFieldsProvider` + 各 Field 组件 + 提交按钮）
- [x] 8.5 在结账页 Payment 步骤中集成 PayPal 组件：PayPal 配置可用时展示付款按钮；`card_fields_enabled` 时额外展示信用卡表单
- [x] 8.6 实现信用卡表单不可用时的降级提示
- [x] 8.7 实现顾客取消 PayPal 弹窗后的页面状态恢复与提示信息

## 9. 错误处理与安全加固

- [x] 9.1 确认所有 PayPal API 错误响应均被 `paypal-client.ts` 捕获并转换为友好的错误消息格式
- [x] 9.2 确认 `GET /store/paypal/config` 响应中不包含 `client_secret_encrypted` 或任何密钥信息
- [x] 9.3 确认 Admin API 的 `GET /admin/paypal` 响应中 Client Secret 字段仅返回掩码（如 `"••••••••"`）
- [x] 9.4 确认 `PAYPAL_CONFIG_ENCRYPTION_KEY` 未设置时系统有明确的错误日志且不崩溃

## 10. 测试与验证

- [x] 10.1 使用 PayPal 沙盒账号在 Admin 配置页填写密钥并通过连通性测试
- [x] 10.2 在 Storefront 结账页使用沙盒 PayPal 账号完成完整付款流程，验证订单状态正确
- [x] 10.3 使用沙盒信用卡测试号（PayPal 提供）测试信用卡托管表单付款流程
- [x] 10.4 测试取消场景：顾客关闭 PayPal 弹窗后不生成订单
- [x] 10.5 在 Admin 将 mode 切换为 `live`，验证正式环境警示横幅正确显示，验证配置正确切换
