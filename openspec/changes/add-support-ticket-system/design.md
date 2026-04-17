## Context

平台当前为 Medusa v2 后端 + Next.js 15 前端 + Admin 扩展的 Monorepo 架构。用户无法在平台内向运营团队反馈问题，缺少一个轻量级的异步支持渠道。工单系统将作为 Medusa 自定义模块接入，复用现有的认证体系和数据库连接。

## Goals / Non-Goals

**Goals:**
- 用户（登录 / 游客）可通过前台悬浮按钮发起工单并收发消息
- 管理员可在 Admin 后台查看、回复、标记工单状态
- 工单数据持久化于 PostgreSQL，通过 Medusa Store/Admin REST API 暴露

**Non-Goals:**
- WebSocket / SSE 实时推送（初版轮询）
- AI 自动回复、智能分类
- 邮件 / 站内信通知
- 工单附件上传

## Decisions

### D1：使用 Medusa 自定义模块（Custom Module）而非独立服务

**选择**：在 `my-store/src/modules/ticket/` 创建 Medusa 自定义模块。

**理由**：
- 与现有 Medusa DI 容器、数据库连接无缝集成，无需额外服务进程
- 模块化隔离，后续可独立演进或提取为微服务
- 复用 Medusa 的路由层（`/store/tickets`, `/admin/tickets`）和认证中间件

**备选方案**：独立 Express 服务 → 引入部署复杂度，增加跨服务认证成本，否决。

---

### D2：游客身份标识使用 Session Token，而非 IP

**选择**：未登录用户在首次发起工单时，后端生成一个 UUID Session Token，通过响应返回并存储于 `localStorage`（前端），后续请求携带此 Token 作为 `guest_token`。

**理由**：
- IP 在 NAT / 代理环境下不唯一，无法可靠标识用户
- Session Token 可在同一设备跨页面保持会话连续性
- 游客登录后可通过接口将历史工单迁移到账号下

**安全考量**：guest_token 仅作为软身份，敏感操作（如查看他人工单）通过服务端校验阻止。

---

### D3：工单状态机

```
open → pending（管理员已看）→ resolved（管理员已回复结案）→ closed（用户或超时关闭）
                               ↓
                           reopened（用户追加消息后重新 open）
```

状态存储在 `ticket.status` 字段，状态转换在 API 层校验合法性。

---

### D4：消息模型 —— 单表扁平结构

`ticket_message` 表：`id, ticket_id, sender_type (user|admin), content, created_at`

**理由**：工单聊天是线性对话，无需树状结构。简单查询（`ORDER BY created_at`）即可还原对话时间线。

---

### D5：Admin 扩展使用 Medusa Admin UI Extension

延续项目现有 `admin-extensions/` 目录的扩展模式，新增 `ticket-admin/` 目录，通过 Medusa Admin SDK 的 Route/Widget 机制注入工单管理页面。

---

### D6：前台悬浮按钮实现为全局组件

在 Next.js 的根 `layout.tsx` 中引入 `<TicketWidget />` 客户端组件，保证全站可见。工单聊天页路由为 `/support/tickets`（新建工单）和 `/support/tickets/[id]`（查看工单）。

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 游客 Token 丢失（清除 localStorage）导致工单无法续联 | 引导游客注册以永久保存历史 |
| 工单量大时轮询频率导致后端压力 | 轮询间隔 ≥ 10s，后续可升级为 SSE |
| 游客工单被滥用（spam） | 单 Token 每小时限发 10 条消息（速率限制中间件） |
| Admin 扩展与 Medusa 版本耦合 | 锁定 Medusa 版本，升级前先测试扩展兼容性 |

## Migration Plan

1. 运行数据库迁移脚本创建 `ticket` / `ticket_message` 表
2. 部署后端模块（无 breaking change，纯新增）
3. 部署前台更新（`TicketWidget` 为懒加载，不影响现有页面性能）
4. 部署 Admin 扩展
5. 回滚：删除模块注册、前端组件、Admin 扩展即可，数据表保留

## Open Questions

- Q1：是否需要在工单创建时向管理员发送邮件通知？（当前排除，后续迭代）
- Q2：工单列表分页大小？（建议默认 20 条）
- Q3：游客 Token 有效期多长？（建议 90 天不活跃后失效）
