## ADDED Requirements

### Requirement: 标签 CRUD
系统 SHALL 提供标签的增删改查，字段包括：name、slug（唯一）、created_at、updated_at。

#### Scenario: 创建标签
- **WHEN** 管理员提交新标签名称
- **THEN** 系统 SHALL 创建标签，自动生成 slug

### Requirement: 文章-标签多对多
一篇文章 SHALL 可关联多个标签，一个标签 SHALL 可关联多篇文章。

#### Scenario: 添加标签到文章
- **WHEN** 管理员在文章编辑页输入标签名并保存
- **THEN** 系统 SHALL 创建或复用已有标签并建立关联

### Requirement: 前台标签归档页
前台 SHALL 提供 `/blog/tag/<slug>` 页面，展示该标签下所有可见的已发布文章。

#### Scenario: 访问标签归档页
- **WHEN** 访客访问 `/blog/tag/nextjs`
- **THEN** 系统 SHALL 显示含该标签的所有 visibility=all 且 status=published 的文章列表
