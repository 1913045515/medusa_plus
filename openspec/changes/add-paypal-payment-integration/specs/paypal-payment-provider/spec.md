## ADDED Requirements

### Requirement: PayPal Payment Provider 注册
系统 SHALL 在 Medusa v2 中注册一个 ID 为 `pp_paypal` 的自定义 Payment Provider，实现 `AbstractPaymentProvider` 接口的以下方法：`initiatePayment`、`authorizePayment`、`capturePayment`、`cancelPayment`、`refundPayment`、`retrievePayment`、`getPaymentStatus`。

#### Scenario: 结账时创建 PayPal 订单
- **WHEN** 顾客在结账时选择 PayPal 支付并提交
- **THEN** 后端调用 PayPal Orders API v2 `POST /v2/checkout/orders` 创建订单，返回 PayPal Order ID，存入 Medusa payment session data

#### Scenario: 捕获付款
- **WHEN** 顾客在 Storefront 完成 PayPal 授权（点击批准按钮或填写信用卡后提交）
- **THEN** 后端调用 `POST /v2/checkout/orders/{id}/capture`，捕获成功后 Medusa 将订单标记为已付款

#### Scenario: 取消支付
- **WHEN** 顾客在 PayPal 弹窗中点击取消或会话超时
- **THEN** PayPal Payment Provider 调用 `cancelPayment`，Medusa payment session 标记为 `canceled`，不触发订单完成

#### Scenario: 退款
- **WHEN** admin 对已完成 PayPal 支付的订单发起退款
- **THEN** 后端调用 PayPal Payments API `POST /v2/payments/captures/{id}/refund`，退款金额与 Medusa 退款请求一致，退款结果写回 payment session

---

### Requirement: Access Token 管理
系统 SHALL 在内存中缓存 PayPal Access Token，并在 Token 过期前 60 秒自动刷新，避免每次支付请求均重新获取 Token。沙盒与正式环境分别使用对应的 OAuth 端点。

#### Scenario: Token 即将过期时自动刷新
- **WHEN** 距 Token 过期时间不足 60 秒时发起支付请求
- **THEN** 系统在发起 PayPal API 调用前先刷新 Token，再继续请求，用户无感知

#### Scenario: Token 获取失败时重试
- **WHEN** 首次获取 Access Token 网络超时或返回 4xx
- **THEN** 系统自动重试一次，若第二次仍失败则返回支付错误给 Storefront

---

### Requirement: 支付接口仅限服务端调用
系统 SHALL 拒绝任何签名 PayPal 捕获或退款请求从不受信来源发起，捕获操作 SHALL 仅由 Medusa 后端在收到 Storefront 提交 PayPal Order ID 后内部调用，不暴露为可直接调用的公开端点。

#### Scenario: 捕获请求来自后端
- **WHEN** Storefront 向 Medusa Store API 提交 `{ paypal_order_id }` 完成支付
- **THEN** Medusa 内部调用 PayPal 捕获接口，不将捕获细节暴露给 Storefront

#### Scenario: 直接捕获请求被拒绝
- **WHEN** 任何客户端尝试直接调用原始 PayPal capture API
- **THEN** 请求因缺少 Client Secret 而无法成功，Medusa 暴露的接口不包含 Secret

