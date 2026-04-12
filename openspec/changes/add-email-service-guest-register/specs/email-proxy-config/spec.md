## ADDED Requirements

### Requirement: Admin can configure QQ SMTP email proxy settings
管理员 SHALL 能够在 Admin 后台商店设置的"邮件代理配置"页面，填写并保存 QQ SMTP 参数：
- SMTP Host（默认 smtp.qq.com）
- SMTP Port（默认 465）
- 发件邮箱地址（QQ 邮箱）
- QQ 邮箱授权码
- 发件人名称（默认"商店通知"）

#### Scenario: Admin saves SMTP config
- **WHEN** 管理员填写 SMTP 参数并点击保存
- **THEN** 系统 SHALL 持久化配置至 store-settings（key: `email_proxy_config`），授权码 SHALL 存储但 UI 不回显明文

#### Scenario: Admin tests email connection
- **WHEN** 管理员点击"发送测试邮件"按钮
- **THEN** 系统 SHALL 向配置的发件邮箱发送一封测试邮件，并返回成功/失败状态

#### Scenario: Missing SMTP config does not break order flow
- **WHEN** SMTP 配置未设置时 `order.placed` 事件触发
- **THEN** 系统 SHALL 记录日志警告并跳过邮件发送，不抛出异常

### Requirement: Email proxy API
系统 SHALL 提供以下 Admin 端点：
- `GET /admin/store-settings/email-proxy` — 返回当前 SMTP 配置（授权码字段返回遮盖值 `***`）
- `PUT /admin/store-settings/email-proxy` — 更新 SMTP 配置
- `POST /admin/store-settings/email-proxy/test` — 发送测试邮件

#### Scenario: Get config masks password
- **WHEN** GET 端点被调用
- **THEN** 响应中授权码字段 SHALL 返回 `"***"` 而非明文

#### Scenario: Test email endpoint validates config first
- **WHEN** POST test 端点被调用但 SMTP 配置不完整
- **THEN** 系统 SHALL 返回 422 错误，提示缺少必填 SMTP 配置
