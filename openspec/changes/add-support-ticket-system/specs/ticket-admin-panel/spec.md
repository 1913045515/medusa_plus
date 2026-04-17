## ADDED Requirements

### Requirement: 工单列表（Admin）
Admin 后台 SHALL 提供工单列表页，支持按状态筛选、分页浏览。

#### Scenario: 查看全部工单
- **WHEN** 管理员访问工单管理页
- **THEN** 展示所有工单列表，包含：ID、标题、来源（用户邮箱/游客）、状态、创建时间、最后更新时间

#### Scenario: 按状态筛选
- **WHEN** 管理员选择筛选条件（open / pending / resolved / closed）
- **THEN** 列表只显示符合该状态的工单

#### Scenario: 分页
- **WHEN** 工单总数超过每页显示数量（默认 20 条）
- **THEN** 显示分页控件，管理员可导航至其他页

---

### Requirement: 工单详情与消息回复（Admin）
管理员 SHALL 可以在 Admin 后台查看工单详情和完整对话，并发送回复消息。

#### Scenario: 查看工单详情
- **WHEN** 管理员点击某条工单
- **THEN** 显示工单元信息（来源、状态、创建时间）及按时间升序排列的完整消息列表

#### Scenario: 管理员回复
- **WHEN** 管理员输入回复内容并提交
- **THEN** 系统创建 sender_type=admin 的消息记录，并在详情页立即展示

#### Scenario: 自动标记 pending
- **WHEN** 管理员打开一张 status=open 的工单详情
- **THEN** 工单 status 自动更新为 pending

---

### Requirement: 工单状态管理（Admin）
管理员 SHALL 可以手动修改工单状态。

#### Scenario: 标记为已解决
- **WHEN** 管理员点击"标记为已解决"按钮
- **THEN** 工单 status 更新为 resolved，列表页状态标签刷新

#### Scenario: 关闭工单
- **WHEN** 管理员点击"关闭工单"按钮
- **THEN** 工单 status 更新为 closed，用户端聊天输入区禁用

#### Scenario: 重新开启工单
- **WHEN** 管理员点击"重新开启"按钮（仅在 resolved/closed 状态）
- **THEN** 工单 status 更新为 open

---

### Requirement: 工单搜索（Admin）
Admin 后台 SHALL 提供按工单标题或用户邮箱的关键字模糊搜索。

#### Scenario: 按标题搜索
- **WHEN** 管理员在搜索框输入关键字并提交
- **THEN** 列表仅展示标题包含该关键字的工单

#### Scenario: 按邮箱搜索
- **WHEN** 管理员在搜索框输入邮箱关键字
- **THEN** 列表仅展示 customer_email 包含该关键字的工单

---

### Requirement: 工单统计概览（Admin）
Admin 工单首页 SHALL 显示当前各状态工单数量的统计卡片。

#### Scenario: 查看统计数据
- **WHEN** 管理员访问工单管理首页
- **THEN** 顶部展示 4 个统计卡片：Open / Pending / Resolved / Closed 数量
