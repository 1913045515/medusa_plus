## ADDED Requirements

### Requirement: 工单创建
系统 SHALL 允许已登录用户或游客创建工单，每张工单包含标题、初始消息内容，并自动关联创建者身份（用户邮箱或 guest_token）。

#### Scenario: 登录用户创建工单
- **WHEN** 已登录用户提交工单表单（标题 + 首条消息）
- **THEN** 系统创建 ticket 记录，status = open，customer_email = 登录用户邮箱，返回工单 ID

#### Scenario: 游客创建工单
- **WHEN** 未登录用户提交工单表单，请求体包含 guest_token
- **THEN** 系统创建 ticket 记录，status = open，guest_token = 请求中的值，返回工单 ID 及 guest_token

#### Scenario: 游客首次创建（无 token）
- **WHEN** 未登录用户提交工单表单，请求体不包含 guest_token
- **THEN** 系统生成新 UUID 作为 guest_token，创建 ticket，响应中返回 guest_token 供前端存储

---

### Requirement: 工单状态机
每张工单 SHALL 遵循以下状态路径：open → pending → resolved → closed。用户追加消息时可从 resolved 回到 open（reopen）。

#### Scenario: 管理员查看工单
- **WHEN** 管理员打开一张 status=open 的工单详情
- **THEN** 系统自动将该工单 status 更新为 pending

#### Scenario: 管理员回复工单
- **WHEN** 管理员发送回复消息
- **THEN** 工单 status 保持 pending，消息记录 sender_type = admin

#### Scenario: 管理员标记解决
- **WHEN** 管理员将工单 status 改为 resolved
- **THEN** 系统更新 status = resolved，记录 resolved_at 时间戳

#### Scenario: 用户关闭工单
- **WHEN** 用户调用关闭接口
- **THEN** 系统更新 status = closed

#### Scenario: 用户追加消息重新开启
- **WHEN** 工单 status = resolved 时，用户发送新消息
- **THEN** 系统更新 status = open（reopen），新消息正常记录

---

### Requirement: 工单消息收发
系统 SHALL 支持用户端和管理员端在同一工单下的双向消息传递，消息按时间升序排列。

#### Scenario: 用户发送消息
- **WHEN** 用户（登录或游客）向已有工单发送消息
- **THEN** 系统创建 ticket_message 记录，sender_type = user，content = 消息内容

#### Scenario: 管理员发送消息
- **WHEN** 管理员通过 Admin API 向工单发送消息
- **THEN** 系统创建 ticket_message 记录，sender_type = admin

#### Scenario: 查询工单消息列表
- **WHEN** 任意一方查询工单消息列表
- **THEN** 返回按 created_at 正序排列的消息数组

---

### Requirement: 速率限制
系统 SHALL 对游客（guest_token）发送消息的频率进行限制，防止滥用。

#### Scenario: 超出频率限制
- **WHEN** 同一 guest_token 在 1 小时内发送超过 10 条消息
- **THEN** 系统返回 429 Too Many Requests，拒绝本次请求

#### Scenario: 正常频率
- **WHEN** 同一 guest_token 在 1 小时内发送 ≤ 10 条消息
- **THEN** 系统正常处理请求

---

### Requirement: 游客工单迁移
系统 SHALL 提供接口，允许游客注册并登录后将历史工单绑定到账号。

#### Scenario: 迁移游客工单
- **WHEN** 已登录用户提交 guest_token 和自身 customer_id 调用迁移接口
- **THEN** 系统将该 guest_token 下所有工单的 customer_email 更新为登录用户邮箱，并清空 guest_token
