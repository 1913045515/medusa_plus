## Context

当前平台的支付提供商仅支持 Medusa 默认集成方式（如 Stripe）。PayPal 是全球使用最广泛的第三方支付平台，支持账号余额付款与信用卡付款两种路径，适合个体工商户（Individual/Sole Trader）商业账号使用标准 REST API v2。

本次集成采用 PayPal Orders API v2（个体户权限范围），通过 Medusa v2 自定义支付提供商（Payment Provider）模式实现后端，前端使用 `@paypal/react-paypal-js` SDK 渲染原生付款按钮和信用卡托管表单。

## Goals / Non-Goals

**Goals:**
- 在 Medusa v2 自定义 Payment Provider 框架内实现完整 PayPal 支付生命周期（创建 → 授权 → 捕获 → 取消 / 退款）。
- 通过 admin 全局设置持久化 PayPal 配置（Client ID / Secret / 环境模式），敏感字段加密存储。
- Storefront 结账页动态加载 PayPal SDK，支持付款按钮和信用卡托管表单两种混合模式。
- 沙盒与正式环境通过数据库配置切换，配置变更无需重启 Medusa 服务。

**Non-Goals:**
- 不接入 Braintree / PayPal Advanced Checkout（需要企业认证）。
- 不实现 PayPal 订阅、定期扣款、分批付款（Pay Later）。
- 不自定义 3DS 强认证流程（由 PayPal 托管字段内建处理）。

## Decisions

### D1：使用 Medusa v2 Payment Provider 接口而非第三方插件

**选择**：自行实现 `AbstractPaymentProvider` 子类，不依赖社区 PayPal 插件。
**理由**：目前 Medusa v2 尚无稳定的官方 PayPal 插件，社区插件维护状态不稳定且不支持个体户账号的权限边界。自定义实现可精确控制 API 调用范围与错误处理逻辑。

### D2：PayPal Orders API v2 + Client Credentials Flow

**选择**：后端使用 PayPal REST API v2 + OAuth 2.0 Client Credentials 获取 Access Token，直接通过 HTTPS 调用，不引入 `@paypal/checkout-server-sdk`（已废弃）。
**理由**：官方 SDK 已停止维护，直接使用 REST API 更灵活且无额外依赖负担。个体户商业账号完全支持 Orders API v2 的创建/捕获路径。

### D3：Client ID 前端可见，Client Secret 后端持有

**选择**：Admin 配置的 Client ID 在结账时由 `/store/paypal/config` 接口返回给 Storefront，Client Secret 永不离开后端。
**理由**：PayPal JS SDK 初始化仅需 Client ID，Secret 用于服务端 OAuth，符合 PayPal 安全规范。

### D4：配置存储于自定义 `paypal_config` 数据库表，Client Secret 使用 AES-256-GCM 加密

**选择**：不直接使用环境变量存储密钥，改用数据库表持久化，Secret 列加密。
**理由**：支持 admin 界面热更新配置（切换沙盒/正式、更新密钥），无需重启进程；加密可防止数据库直接读取暴露密钥，加密密钥来自环境变量 `PAYPAL_CONFIG_ENCRYPTION_KEY`。

### D5：信用卡使用 PayPal Advanced Card Fields（自定义卡号表单）

**选择**：使用 `@paypal/react-paypal-js` 提供的 `PayPalCardFieldsProvider` + 各个 Field 组件渲染托管 iframe 表单。
**理由**：个体户商业账号在通过 PayPal 后台开启"Advanced Credit and Debit Card Payments"后即可使用，不需要企业资质。托管字段由 PayPal 处理 PCI 合规，卡号数据不经过本平台服务器。

### D6：沙盒/正式环境通过 `paypal_config.mode` 字段切换

**选择**：`mode: 'sandbox' | 'live'`，由后端读取后决定 OAuth endpoint 和 Orders API endpoint，同时将 mode 传递给前端以初始化正确的 SDK 环境。
**理由**：支持在不改变代码的情况下通过 admin 界面切换环境，便于测试与上线切换。

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| PayPal 个体户账号未开启 Advanced Card Fields 导致信用卡表单不可用 | Admin 配置页面提供功能开关，可单独禁用信用卡表单，仅展示 PayPal 按钮 |
| 加密密钥 `PAYPAL_CONFIG_ENCRYPTION_KEY` 丢失导致配置不可读 | 文档说明该变量必须持久化，企业可考虑 KMS；提供 admin 重置配置入口 |
| PayPal Access Token 缓存过期导致支付失败 | 后端在内存中缓存 Token，并在过期前 60 秒主动刷新；失败时自动重试一次 |
| 信用卡托管 iframe 在部分浏览器被阻断 | 降级展示"仅支持 PayPal 账号付款"提示，不阻断整个结账流程 |
| 沙盒密钥意外上到正式环境 | Admin 配置页面根据 mode 字段高亮显示当前环境，警示色区分沙盒/正式 |

## Migration Plan

1. 部署前在服务器环境变量中设置 `PAYPAL_CONFIG_ENCRYPTION_KEY`（32 字节随机值）。
2. 部署新版本，Medusa 启动时自动执行数据库迁移创建 `paypal_config` 表。
3. 管理员进入 admin → 全局设置 → 支付配置 → PayPal，填写沙盒密钥并测试连通性。
4. 在 Storefront 结账页验证沙盒支付流程完整性。
5. 确认后切换 mode 为 `live`，更新正式密钥，再次测试连通性后上线。

**回滚**：从 Medusa 配置中移除 PayPal Payment Provider 注册，Storefront 结账页自动不显示 PayPal 选项；数据库表保留供回滚处理中历史订单。

## Open Questions

- PayPal 个体户账号是否已在 PayPal 后台开启"Advanced Credit and Debit Card Payments"？（影响信用卡表单可用性）
- 是否需要在 admin 订单详情中展示 PayPal 交易 ID 和 PayPal 订单状态？（本次暂不规划，后续可补充）
