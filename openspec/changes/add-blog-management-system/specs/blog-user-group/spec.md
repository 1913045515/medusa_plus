## ADDED Requirements

### Requirement: 用户组 CRUD
系统 SHALL 提供用户组的增删改查，字段包括：name、description、created_at、updated_at。

#### Scenario: 创建用户组
- **WHEN** 管理员提交用户组名称
- **THEN** 系统 SHALL 创建用户组记录

### Requirement: 用户组成员管理
管理员 SHALL 能向用户组中添加或移除 customer（客户）。

#### Scenario: 添加成员
- **WHEN** 管理员在用户组详情页搜索并添加某 customer
- **THEN** 系统 SHALL 在 blog_user_group_member 中插入记录

#### Scenario: 移除成员
- **WHEN** 管理员点击移除某成员
- **THEN** 系统 SHALL 删除对应的 blog_user_group_member 记录

### Requirement: 用户组关联文章可见范围
文章 visibility=group 时，SHALL 只有 visibility_group_ids 中列出的用户组的成员才能访问。

#### Scenario: 用户在组内可访问文章
- **WHEN** 登录 customer 属于 visibility_group_ids 中的某个用户组
- **THEN** 系统 SHALL 返回文章内容

#### Scenario: 用户不在组内不可访问
- **WHEN** 登录 customer 不属于任何 visibility_group_ids 的用户组
- **THEN** 系统 SHALL 返回 404

### Requirement: 删除用户组保护
若用户组已被文章的可见范围引用，系统 SHALL 警告管理员，确认后方可删除。

#### Scenario: 删除被引用的用户组
- **WHEN** 管理员删除某个被 1 篇及以上文章引用的用户组
- **THEN** 系统 SHALL 提示影响的文章数量，确认后执行删除并从文章 visibility_group_ids 中移除该组 ID
