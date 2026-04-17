## ADDED Requirements

### Requirement: Storefront 获取 PayPal 公开配置
系统 SHALL 提供 `GET /store/paypal/config` 接口，返回 `{ client_id, mode, card_fields_enabled }`，不包含 Client Secret。Storefront 在结账页初始化时调用此接口以决定是否渲染 PayPal 组件及使用哪个环境的 SDK。

#### Scenario: 配置已设置时正常返回
- **WHEN** Storefront 发起 `GET /store/paypal/config`
- **THEN** 接口返回 `{ client_id: "...", mode: "sandbox"|"live", card_fields_enabled: true|false }`，HTTP 200

#### Scenario: 配置未设置时返回禁用状态
- **WHEN** 数据库中尚未写入 PayPal 配置
- **THEN** 接口返回 `{ enabled: false }`，Storefront 不渲染 PayPal 组件，HTTP 200

---

### Requirement: PayPal 付款按钮
Storefront 结账页 SHALL 使用 `@paypal/react-paypal-js` 的 `PayPalButtons` 组件渲染 PayPal 原生付款按钮，支持顾客通过 PayPal 账号余额或 PayPal 已绑定银行卡完成付款。按钮 SHALL 在顾客点击后调用后端创建 PayPal 订单，批准后触发捕获并跳转至订单确认页。

#### Scenario: 顾客点击 PayPal 按钮完成付款
- **WHEN** 顾客在结账页点击 PayPal 付款按钮并在弹窗中登录 PayPal 账号批准付款
- **THEN** Storefront 调用后端捕获接口，成功后跳转至订单确认页，显示订单号

#### Scenario: 顾客取消 PayPal 弹窗
- **WHEN** 顾客在 PayPal 弹窗中点击关闭或取消
- **THEN** Storefront 保持在结账页，显示"付款已取消，请重试"提示，不创建 Medusa 订单

#### Scenario: PayPal 付款失败
- **WHEN** PayPal 捕获接口返回错误（如余额不足、风控拒绝）
- **THEN** Storefront 在结账页显示具体错误信息，顾客可重试或选择其他支付方式

---

### Requirement: PayPal 信用卡托管表单
当 `card_fields_enabled` 为 `true` 时，Storefront 结账页 SHALL 使用 `PayPalCardFieldsProvider` 渲染卡号、有效期、CVV、持卡人姓名的托管 iframe 字段，支持 Visa/Mastercard/AmEx/Discover 等主流信用卡。表单提交后后端执行捕获。

#### Scenario: 顾客填写信用卡信息并付款
- **WHEN** 顾客在托管信用卡表单中填写有效卡信息并点击"立即付款"
- **THEN** PayPal SDK 在托管 iframe 中处理 PCI 合规提交，后端捕获成功后跳转至订单确认页

#### Scenario: 信用卡信息无效
- **WHEN** 顾客提交的信用卡号或 CVV 不合法
- **THEN** PayPal 托管字段在 iframe 内显示内联错误提示，Storefront 不发起后端捕获请求

#### Scenario: 信用卡表单不可用时降级
- **WHEN** `card_fields_enabled` 为 `false`（管理员关闭或功能未开通）
- **THEN** Storefront 仅显示 PayPal 付款按钮，不渲染信用卡表单，并展示"如需信用卡付款请联系客服"的提示

---

### Requirement: PayPal SDK 环境隔离
Storefront SHALL 根据后端返回的 `mode` 字段决定 PayPal JS SDK 的 `environment` 参数，沙盒时使用 `sandbox` 端点，正式时使用 `production` 端点，二者不可混用。

#### Scenario: 沙盒配置生效
- **WHEN** 后端返回 `mode: "sandbox"`
- **THEN** `PayPalScriptProvider` 以 `{ "client-id": "...", "data-sdk-integration-source": "integrationbuilder_ac" }` 初始化，PayPal 控制台显示沙盒测试记录而非真实交易

#### Scenario: 正式配置生效
- **WHEN** 后端返回 `mode: "live"`
- **THEN** PayPal JS SDK 连接正式 PayPal 端点，产生真实交易记录

