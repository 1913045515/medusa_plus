## Why

当前平台仅支持基础支付方式，缺少 PayPal 付款能力，导致国际用户无法使用最广泛的第三方支付工具完成购买。本次以个体工商户申请的 PayPal 商业版账号（非企业版）为基础，集成标准 PayPal 付款按钮与 PayPal 托管信用卡表单，支持沙盒/正式环境一键切换，并将密钥配置收敛到 admin 后台全局设置中统一管理。

## What Changes

- 在 admin 全局设置中新增"PayPal 支付配置"区块，支持填写 Client ID、Client Secret、沙盒/正式模式切换，并提供连通性测试按钮。
- 在 Medusa 后端新增 PayPal 支付提供商（`pp_paypal`），实现订单创建、授权、捕获、取消、退款标准生命周期接口，适配个体户商业版权限（不使用 Advanced/Enterprise API）。
- 在 Storefront 结账流程中嵌入 PayPal JS SDK：
  - PayPal 原生付款按钮（支持 PayPal 账号余额 & 已绑定银行卡）。
  - PayPal 托管信用卡表单（Hosted Fields / Advanced Card Fields），支持 Visa/Mastercard/AmEx 等主流卡种。
- 支持沙盒与正式环境通过数据库配置动态切换，无需重启服务。

## Capabilities

### New Capabilities
- `paypal-payment-provider`: Medusa 后端 PayPal 支付提供商，完整实现支付创建、捕获、取消、退款生命周期，适配个体户商业版 REST API 权限。
- `paypal-admin-config`: admin 全局设置中的 PayPal 密钥与环境配置页面，敏感字段加密存储，支持连通性测试。
- `paypal-storefront-checkout`: Storefront 结账页集成 PayPal 原生按钮和信用卡托管表单，支持沙盒/正式环境透传。

### Modified Capabilities
- 无。

## Non-goals

- 不使用 Braintree、PayPal Advanced Checkout 或任何需要企业认证级别权限的 API。
- 不实现 PayPal 订阅 / 定期扣款能力。
- 不改造现有支付方式或结账流程的其他部分（如 Stripe）。
- 不在本次变更中引入 3DS 强认证的自定义处理逻辑（由 PayPal 托管字段内建处理）。

## Impact

- Backend: `my-store` 新增 PayPal 支付提供商模块、环境变量、admin API 端点、数据库表（支付配置）。
- Admin: 全局设置新增 PayPal 配置区块，表单含密钥输入、环境切换、测试按钮。
- Storefront: 结账页组件改造，引入 `@paypal/react-paypal-js`，按后端返回的环境动态初始化 SDK。
- Security: Client Secret 加密存储，不在任何前台 API 响应中暴露；Client ID 仅作为公开标识符传递给浏览器。
