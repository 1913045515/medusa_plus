## Why

游客下单后无账号，无法追踪订单历史或重复购买课程，且下单邮箱已收集——自动为其创建账号可提升用户留存。同时项目无邮件发送能力，订单确认、密码通知等均无法实现，需补全基础邮件基础设施。

## What Changes

- **新增** QQ 邮箱 SMTP 邮件代理模块（`email-proxy` module），支持在 Admin 中配置 SMTP 参数
- **新增** Admin"邮件代理配置"页面（在商店设置中），用于填写 QQ 邮箱授权码等 SMTP 参数
- **新增** 游客下单成功后自动注册账号逻辑：查询邮箱是否已存在 → 不存在则创建账号 → 生成随机密码 → 发送包含临时密码的欢迎邮件
- **新增** 订单完成 Subscriber，监听 `order.placed` 事件，触发游客注册逻辑
- Email 字段在结算中始终必填（与 `add-checkout-field-config` 联动）

## Capabilities

### New Capabilities

- `email-proxy-config`: Admin 可配置 QQ SMTP 邮件代理参数，系统通过 nodemailer 发送邮件
- `guest-auto-register`: 游客下单后系统自动注册账号，随机密码通过邮件发送到下单邮箱

### Modified Capabilities

（无已有 spec 变更）

## Impact

- **后端**: 新增 `my-store/src/modules/email-proxy/` 模块；新增 `order.placed` subscriber；新增 Admin API `/admin/store-settings/email-proxy`
- **依赖**: 新增 `nodemailer` npm 包（零成本 SMTP 客户端）
- **Admin 扩展**: 新增邮件代理配置页面
- **安全**: SMTP 授权码通过环境变量或加密存储，不明文存入前端

## Non-goals

- 不集成第三方 SaaS 邮件服务（Resend、SendGrid 等）
- 不实现邮件模板管理系统
- 不实现"忘记密码"流程（仅处理首次临时密码）
- 不处理邮件退信/bounce 追踪
- 不实现批量邮件发送
