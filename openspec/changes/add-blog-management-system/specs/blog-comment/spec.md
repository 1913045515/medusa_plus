## ADDED Requirements

### Requirement: 评论提交
已登录 customer SHALL 能对 allow_comments=true 的已发布文章提交评论，字段包括：content（必填）、created_at、status（pending 默认值）。

#### Scenario: 提交评论
- **WHEN** 已登录 customer 提交评论内容
- **THEN** 系统 SHALL 创建 status=pending 的评论记录，前台不立即显示

#### Scenario: 未登录不可评论
- **WHEN** 未登录访客提交评论
- **THEN** 系统 SHALL 返回 401

#### Scenario: 文章关闭评论
- **WHEN** 文章 allow_comments=false 时访客提交评论
- **THEN** 系统 SHALL 返回 403，提示评论已关闭

### Requirement: 评论审核
管理员 SHALL 能在 Admin 文章详情页对评论执行审核（approved）或拒绝（rejected）操作。

#### Scenario: 批准评论
- **WHEN** 管理员将评论状态改为 approved
- **THEN** 系统 SHALL 更新 status=approved，前台随之显示该评论

#### Scenario: 拒绝评论
- **WHEN** 管理员将评论状态改为 rejected
- **THEN** 系统 SHALL 更新 status=rejected，前台不显示

### Requirement: 前台评论展示
前台文章详情页 SHALL 显示该文章所有 status=approved 的评论，按创建时间升序排列（一级评论，不支持嵌套）。

#### Scenario: 显示批准评论
- **WHEN** 访客查看文章详情页
- **THEN** 系统 SHALL 在评论区显示 status=approved 的评论，含评论者名称和时间

### Requirement: 管理员删除评论
管理员 SHALL 能直接删除任意评论（硬删除）。

#### Scenario: 删除评论
- **WHEN** 管理员点击删除评论
- **THEN** 系统 SHALL 从 blog_comment 表中删除该记录，前台不再显示
