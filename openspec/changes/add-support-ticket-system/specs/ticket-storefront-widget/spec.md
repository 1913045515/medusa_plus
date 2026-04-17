## ADDED Requirements

### Requirement: 悬浮工单按钮
前台 SHALL 在所有页面右下角展示一个悬浮的工单入口按钮，点击后导航至工单聊天页面。

#### Scenario: 按钮可见
- **WHEN** 用户访问网站任意页面
- **THEN** 右下角显示悬浮工单按钮（图标 + 文字"支持"或"工单"）

#### Scenario: 点击按钮（已登录）
- **WHEN** 已登录用户点击悬浮按钮
- **THEN** 跳转至 `/support/tickets` 页面

#### Scenario: 点击按钮（未登录）
- **WHEN** 未登录用户点击悬浮按钮
- **THEN** 跳转至 `/support/tickets` 页面，展示游客模式提示及注册引导横幅

---

### Requirement: 工单列表页（用户端）
`/support/tickets` 页面 SHALL 展示当前用户（或游客）的工单列表。

#### Scenario: 登录用户查看列表
- **WHEN** 已登录用户访问 `/support/tickets`
- **THEN** 显示该用户邮箱下的所有工单（状态、标题、最后更新时间）

#### Scenario: 游客查看列表
- **WHEN** 未登录用户访问 `/support/tickets`，localStorage 存在 guest_token
- **THEN** 使用 guest_token 查询工单列表并展示

#### Scenario: 游客无历史工单
- **WHEN** 未登录用户访问 `/support/tickets`，无历史工单
- **THEN** 显示空状态 + "创建新工单"按钮 + 注册引导文字

#### Scenario: 新建工单入口
- **WHEN** 用户点击"新建工单"按钮
- **THEN** 显示工单创建表单（标题 + 首条消息输入框）

---

### Requirement: 工单聊天页（用户端）
`/support/tickets/[id]` 页面 SHALL 以聊天气泡样式展示工单消息，并允许用户追加消息。

#### Scenario: 消息展示
- **WHEN** 用户打开工单详情页
- **THEN** 按时间升序展示所有消息，用户消息靠右、管理员消息靠左

#### Scenario: 发送消息
- **WHEN** 用户输入消息并点击"发送"
- **THEN** 消息立即显示在聊天区域，并通过 API 持久化

#### Scenario: 游客注册引导
- **WHEN** 游客在工单聊天页发送消息
- **THEN** 页面顶部持续显示横幅："注册账号以保存工单历史，点击注册"

#### Scenario: 工单已关闭
- **WHEN** 工单 status = closed
- **THEN** 输入区域禁用，显示"此工单已关闭"提示

---

### Requirement: 轮询刷新
前台聊天页 SHALL 每 10 秒自动轮询一次消息列表，以获取管理员的新回复。

#### Scenario: 自动刷新
- **WHEN** 用户停留在 `/support/tickets/[id]` 页面
- **THEN** 页面每 10 秒发起一次消息列表请求并更新界面（仅在有新消息时滚动到底部）

#### Scenario: 离开页面停止轮询
- **WHEN** 用户离开工单详情页
- **THEN** 轮询定时器被清除，不再发起请求
