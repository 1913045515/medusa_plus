## ADDED Requirements

### Requirement: 分类 CRUD
系统 SHALL 提供分类的增删改查，字段包括：name、slug（唯一）、description、cover_image、parent_id（支持父子层级）、created_at、updated_at。

#### Scenario: 创建子分类
- **WHEN** 管理员创建分类时指定 parent_id
- **THEN** 系统 SHALL 创建该分类并关联父分类，最大支持 2 级层级

#### Scenario: 分类 slug 唯一
- **WHEN** 管理员创建分类时 slug 与已有分类重复
- **THEN** 系统 SHALL 返回 400 错误

### Requirement: 分类关联文章计数
每个分类 SHALL 在列表中显示关联的已发布文章数量。

#### Scenario: 文章计数展示
- **WHEN** 管理员查看分类列表
- **THEN** 系统 SHALL 返回每个分类下 status=published 的文章数量

### Requirement: 删除分类保护
若分类下存在文章，系统 SHALL 阻止删除，提示先移除关联文章。

#### Scenario: 删除有文章的分类
- **WHEN** 管理员尝试删除含有文章的分类
- **THEN** 系统 SHALL 返回 409 错误，提示该分类下有 N 篇文章

### Requirement: 前台分类归档页
前台 SHALL 提供 `/blog/category/<slug>` 页面，展示该分类下所有可见的已发布文章，支持分页/无限滚动。

#### Scenario: 访问分类归档页
- **WHEN** 访客访问 `/blog/category/tech`
- **THEN** 系统 SHALL 显示 category.slug=tech 下所有 visibility=all 且 status=published 的文章
