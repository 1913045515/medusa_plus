## Why

当前平台缺乏用户与客服之间的沟通渠道，用户遇到问题无法有效反馈，影响用户留存和满意度。随着课程业务增长，需要一套完整的工单支持系统来处理用户售前咨询、课程问题及退款投诉。

## What Changes

- 新增前台悬浮工单机器人按钮，点击进入工单聊天页面
- 登录用户以邮箱作为身份标识，未登录用户使用随机 Session ID 并引导注册
- 工单消息收发核心功能（用户端 + 管理端双向通信）
- Admin 后台新增工单管理模块：列表、状态管理、回复功能
- 工单持久化存储（PostgreSQL）

## Capabilities

### New Capabilities

- `ticket-core`: 工单与消息的数据模型、CRUD API、状态机（open/pending/resolved/closed）
- `ticket-storefront-widget`: 前台悬浮工单入口及聊天页面，支持登录/游客两种模式
- `ticket-admin-panel`: Admin 后台工单列表、详情、状态修改、回复消息管理

### Modified Capabilities

<!-- 无现有 spec 需要变更 -->

## Impact

- **后端**：`my-store/src/modules/ticket/`（新模块）、新增 Store API `/store/tickets` 和 Admin API `/admin/tickets`
- **前端**：`my-store-storefront/src/` 新增悬浮组件和工单聊天页路由
- **Admin 扩展**：`my-store/admin-extensions/` 新增工单管理页面
- **数据库**：新增 `ticket` 和 `ticket_message` 表
- **依赖**：无新增第三方依赖（使用 Medusa 内置模块系统 + Next.js 现有能力）

## Non-goals

- 实时推送（WebSocket / SSE）：初版使用轮询或手动刷新
- AI 自动回复 / 智能分类
- 多语言工单标签体系
- 工单附件上传（初版文本消息为主）
- SLA 超时告警、邮件通知（后续迭代）
