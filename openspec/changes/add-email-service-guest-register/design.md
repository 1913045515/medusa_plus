## Context

项目目前无邮件发送能力，`subscribers/` 目录为空，`medusa-config.ts` 未配置 notification 模块。Medusa v2 提供了 Notification 模块框架，但其官方 provider（Resend、SendGrid）均需付费或绑定域名/信用卡。

选用 `nodemailer` + QQ SMTP 方案：零运营成本，QQ 邮箱 SMTP 每日可发约 500-1000 封，足够个人项目早期使用。管理员在 Admin 中输入 QQ 邮箱地址和授权码（非登录密码），系统动态加载配置发送邮件。

游客注册逻辑需要调用 Medusa 内置的 Auth 模块（`@medusajs/auth-emailpassword` provider）。

## Goals / Non-Goals

**Goals:**
- 实现可在 Admin 中配置的 QQ SMTP 邮件代理模块
- 游客下单后自动创建同邮箱账号，随机密码通过邮件通知
- 若邮箱已存在账号则跳过注册，不发送重复密码邮件

**Non-Goals:**
- 不使用 Medusa 官方 Notification 模块（避免依赖外部付费 provider）
- 不实现忘记密码 / 密码重置流程
- 不发送订单确认邮件（本期仅发注册通知）

## Decisions

### 决策 1：邮件发送方式 - Medusa Notification 模块 vs 自建模块

**选择**: 自建 `email-proxy` 模块，直接调用 nodemailer，不走 Medusa Notification 模块。

**理由**: Medusa Notification 模块设计用于对接 SaaS provider（Resend/SendGrid），需要 webhook URL、API Key 等，不支持 SMTP 直连。自建模块更直接，且 SMTP 配置可存入已有 store-settings，无需额外架构。

**备选**: 自写 Medusa Notification Provider 适配器 — 增加 30% 代码量，收益为零（项目只有一个 provider）。

### 决策 2：SMTP 配置存储 - 环境变量 vs 数据库

**选择**: 数据库（store-settings 模块）存储 host/port/user，授权码（password）优先读取环境变量 `QQ_SMTP_PASS`，若未设置则从数据库读取（加密存储或明文，由管理员决定）。

**理由**: 管理员可在 Admin UI 中热更新 SMTP 配置无需重启服务。授权码敏感，推荐环境变量；但提供 UI 配置兜底，降低部署门槛。

**备选**: 纯环境变量 — 修改需重启容器，不符合"在 Admin 配置"需求。

### 决策 3：游客注册触发时机

**选择**: 监听 `order.placed` Subscriber 事件，在订单创建成功后异步触发注册和邮件发送。

**理由**: 注册逻辑不应阻断下单流程。即使注册失败或邮件发送失败，订单已成功创建。

**备选**: 在 `setAddresses` cart action 中同步注册 — 阻断下单流程，体验差。

### 决策 4：随机密码生成

**选择**: 生成 10 位随机密码（大小写字母 + 数字），使用 `crypto.randomBytes` 生成（Node.js 内置，无需额外依赖）。

**理由**: 安全性优于 `Math.random()`，无需 npm 依赖。

### 决策 5：已存在用户的处理

**选择**: 调用 Medusa Auth API 查询邮箱是否已有 customer，若存在则跳过注册，不发送密码邮件（避免混淆）。

**理由**: 保护已有用户的密码不被覆盖，也避免用户疑惑收到意外邮件。

## Risks / Trade-offs

- **QQ SMTP 限速** → 每日 500-1000 封上限；初期流量小可接受；若超限需切换 Resend 等
- **授权码泄露** → 建议用环境变量，UI 配置为次选；授权码仅控制 SMTP 发信权限，风险可控
- **邮件进垃圾箱** → QQ 邮箱发往海外用户可能被标垃圾邮件；国内用户体验佳
- **注册失败不通知用户** → 游客不会收到密码邮件，但仍可通过忘记密码找回（Medusa 内置）；可在后续迭代中增加重试

## Migration Plan

1. 安装 nodemailer：`npm install nodemailer` in `my-store/`
2. 创建 email-proxy 模块并在 `medusa-config.ts` 注册
3. 创建 Admin 配置页，首次部署后手动填写 SMTP 配置
4. 部署 subscriber，自动生效于新订单
5. 回滚方案：删除 subscriber 文件即可禁用自动注册（不影响已有数据）

## Open Questions

- 无
