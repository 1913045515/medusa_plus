## 1. 数据库 & 后端模块骨架

- [x] 1.1 在 `my-store/src/modules/ticket/` 创建模块目录结构（models、services、index.ts）
- [x] 1.2 创建 `ticket` 数据模型（id、title、status、customer_email、guest_token、created_at、updated_at、resolved_at）
- [x] 1.3 创建 `ticket_message` 数据模型（id、ticket_id、sender_type、content、created_at）
- [x] 1.4 生成并执行 Medusa 数据库迁移脚本（创建 ticket / ticket_message 表）
- [x] 1.5 在 `medusa-config.ts` 中注册 ticket 自定义模块

## 2. 后端 Service 层

- [x] 2.1 实现 `TicketModuleService.createTicket()`（支持 customer_email 和 guest_token 两种身份）
- [x] 2.2 实现 `TicketModuleService.listTickets()`（按 customer_email 或 guest_token 过滤，支持 status 筛选和分页）
- [x] 2.3 实现 `TicketModuleService.getTicket()`（返回工单详情 + 消息列表）
- [x] 2.4 实现 `TicketModuleService.updateTicketStatus()`（校验合法状态转换路径）
- [x] 2.5 实现 `TicketModuleService.addMessage()`（支持 user/admin sender_type，resolved→open 的 reopen 逻辑）
- [x] 2.6 实现 `TicketModuleService.migrateGuestTickets()`（将 guest_token 工单绑定到 customer_email）
- [x] 2.7 实现 `TicketModuleService.getTicketStats()`（返回各状态工单数量统计）

## 3. Store API 路由

- [x] 3.1 创建 `my-store/src/api/store/tickets/route.ts`：`GET /store/tickets`（查询用户/游客工单列表）
- [x] 3.2 创建 `my-store/src/api/store/tickets/route.ts`：`POST /store/tickets`（创建工单，处理 guest_token 生成逻辑）
- [x] 3.3 创建 `my-store/src/api/store/tickets/[id]/route.ts`：`GET /store/tickets/:id`（获取工单详情及消息）
- [x] 3.4 创建 `my-store/src/api/store/tickets/[id]/route.ts`：`POST /store/tickets/:id/messages`（用户发送消息，触发 reopen 逻辑）
- [x] 3.5 创建 `my-store/src/api/store/tickets/[id]/route.ts`：`PATCH /store/tickets/:id`（用户关闭工单）
- [x] 3.6 创建 `my-store/src/api/store/tickets/migrate/route.ts`：`POST /store/tickets/migrate`（游客工单迁移接口）
- [x] 3.7 在 Store API 中间件中添加游客速率限制（1h/10 条，基于 guest_token）

## 4. Admin API 路由

- [x] 4.1 创建 `my-store/src/api/admin/tickets/route.ts`：`GET /admin/tickets`（列表 + status 筛选 + 关键字搜索 + 分页）
- [x] 4.2 创建 `my-store/src/api/admin/tickets/[id]/route.ts`：`GET /admin/tickets/:id`（详情，触发 open→pending 状态自动更新）
- [x] 4.3 创建 `my-store/src/api/admin/tickets/[id]/route.ts`：`PATCH /admin/tickets/:id`（状态修改：pending/resolved/closed/open）
- [x] 4.4 创建 `my-store/src/api/admin/tickets/[id]/route.ts`：`POST /admin/tickets/:id/messages`（管理员发送回复）
- [x] 4.5 创建 `my-store/src/api/admin/tickets/stats/route.ts`：`GET /admin/tickets/stats`（返回各状态计数）
- [x] 4.6 为所有 Admin API 路由添加管理员身份验证中间件（复用现有 admin auth 模式）

## 5. Admin 前端扩展

- [x] 5.1 在 `my-store/admin-extensions/` 下创建 `ticket-admin/` 目录结构
- [x] 5.2 实现工单列表页组件（表格：ID、标题、来源、状态、时间；支持状态筛选 Tab 和关键字搜索框）
- [x] 5.3 实现顶部统计卡片组件（Open / Pending / Resolved / Closed 计数，调用 `/admin/tickets/stats`）
- [x] 5.4 实现工单详情页组件（工单信息展示 + 消息气泡列表）
- [x] 5.5 实现管理员回复输入框（文本域 + 发送按钮，发送后刷新消息列表）
- [x] 5.6 实现状态操作按钮组（标记已解决 / 关闭 / 重新开启，根据当前状态条件展示）
- [x] 5.7 在 Medusa Admin 路由配置中注册工单管理页面（`/tickets` 路径）

## 6. 前台工单组件（Storefront）

- [x] 6.1 创建 `my-store-storefront/src/modules/ticket/` 目录和 API Client 函数（封装 `/store/tickets` 请求）
- [x] 6.2 创建 `<TicketWidget />` 悬浮按钮客户端组件（`src/components/ticket-widget.tsx`）
- [x] 6.3 在根布局 `src/app/layout.tsx` 中引入 `<TicketWidget />`
- [x] 6.4 创建工单列表页 `src/app/support/tickets/page.tsx`（展示工单列表 / 空状态 / 新建工单入口）
- [x] 6.5 实现工单创建表单组件（标题 + 首条消息，处理 guest_token 生成和 localStorage 存取）
- [x] 6.6 创建工单聊天页 `src/app/support/tickets/[id]/page.tsx`（消息气泡列表 + 发送输入框）
- [x] 6.7 实现 10 秒轮询逻辑（`useEffect` + `setInterval`，组件卸载时清除定时器）
- [x] 6.8 实现游客注册引导横幅组件（工单页顶部，仅在 guest 模式展示，含注册链接）

## 7. 联调 & 验证

- [x] 7.1 本地端到端测试：游客创建工单 → 管理员回复 → 游客查看回复
- [x] 7.2 本地端到端测试：登录用户创建工单 → 关闭 → 重新开启
- [x] 7.3 本地端到端测试：游客注册后迁移工单到账号
- [x] 7.4 验证游客速率限制（连续发送 11 条消息，第 11 条返回 429）
- [x] 7.5 验证 Admin 工单列表筛选、搜索、分页功能
- [x] 7.6 验证统计卡片数据与实际工单状态一致
