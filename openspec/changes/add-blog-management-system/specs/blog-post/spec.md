## ADDED Requirements

### Requirement: 文章基础字段
文章 SHALL 包含以下字段：title（必填）、content（富文本HTML）、excerpt（摘要，可手动填写或自动截取前200字）、cover_image（封面图URL）、category_id、status（draft/scheduled/published/archived）、is_pinned、password（可选密码保护）、read_count、word_count、slug（唯一URL别名）、seo_title、seo_description、allow_comments、visibility（all/user/group）、visibility_user_ids（jsonb）、visibility_group_ids（jsonb）、scheduled_at、author_id、updated_by、created_at、updated_at。

#### Scenario: 创建草稿文章
- **WHEN** 管理员提交包含 title 和 content 的文章，status 为 draft
- **THEN** 系统 SHALL 创建文章记录，状态为 draft，自动计算 word_count

#### Scenario: slug 唯一性校验
- **WHEN** 管理员提交与已有文章相同的 slug
- **THEN** 系统 SHALL 返回 400 错误，提示 slug 已存在

#### Scenario: 自动生成 slug
- **WHEN** 管理员创建文章时未填写 slug
- **THEN** 系统 SHALL 根据 title 自动生成 kebab-case slug

### Requirement: 文章状态流转
文章 SHALL 支持 draft → scheduled/published、scheduled → published（Job触发）、published → archived 的状态流转。

#### Scenario: 发布文章
- **WHEN** 管理员将文章状态改为 published
- **THEN** 系统 SHALL 立即设置 status=published，前台可见

#### Scenario: 定时发布
- **WHEN** 管理员设置 scheduled_at 为未来时间并保存
- **THEN** 系统 SHALL 设置 status=scheduled；到达 scheduled_at 时 Job 自动将状态改为 published

#### Scenario: 归档文章
- **WHEN** 管理员将 published 文章状态改为 archived
- **THEN** 系统 SHALL 设置 status=archived，前台不再显示该文章

### Requirement: 文章可见范围控制
文章 SHALL 支持三种可见范围：all（所有用户）、user（指定客户 ID 列表）、group（指定用户组 ID 列表）。

#### Scenario: 全体可见文章
- **WHEN** visibility=all 的已发布文章
- **THEN** 前台所有访客（含未登录）SHALL 能看到该文章列表项

#### Scenario: 指定用户可见
- **WHEN** visibility=user，当前登录 customer 的 id 在 visibility_user_ids 中
- **THEN** 前台 SHALL 显示该文章

#### Scenario: 用户组可见，用户不在组内
- **WHEN** visibility=group，当前登录 customer 未加入任何 visibility_group_ids 的用户组
- **THEN** 前台 SHALL 在列表和详情中不显示该文章，返回 404

### Requirement: 文章复制
管理员 SHALL 能复制一篇已有文章，形成新草稿。

#### Scenario: 复制文章
- **WHEN** 管理员点击复制按钮
- **THEN** 系统 SHALL 创建新文章，status=draft，title 加"(Copy)"后缀，slug 追加随机后缀保证唯一，read_count 重置为 0

### Requirement: 文章删除
管理员 SHALL 能软删除文章（deleted_at 标记），前台及列表不再显示。

#### Scenario: 删除文章
- **WHEN** 管理员确认删除某篇文章
- **THEN** 系统 SHALL 设置 deleted_at 时间戳，前台和列表均不显示，数据保留

### Requirement: 文章版本历史
系统 SHALL 在每次保存文章时记录版本快照（title + content），每篇文章最多保留 50 个版本。

#### Scenario: 查看历史版本
- **WHEN** 管理员打开文章版本历史面板
- **THEN** 系统 SHALL 显示最近 50 个保存记录，含保存时间

#### Scenario: 恢复历史版本
- **WHEN** 管理员选择某个历史版本并点击恢复
- **THEN** 系统 SHALL 将当前文章的 title 和 content 替换为该版本内容，并保存为新版本

### Requirement: 置顶文章
is_pinned=true 的已发布文章 SHALL 在前台列表页排在所有普通文章之前。

#### Scenario: 置顶排序
- **WHEN** 前台请求博客列表
- **THEN** 系统 SHALL 先返回 is_pinned=true 的文章，再按 published_at 倒序返回普通文章

### Requirement: 密码保护
文章 SHALL 支持设置访问密码。前台访客访问时须输入正确密码才能查看内容。

#### Scenario: 输入正确密码
- **WHEN** 访客访问有密码保护的文章，提交正确密码
- **THEN** 系统 SHALL 返回完整文章内容

#### Scenario: 输入错误密码
- **WHEN** 访客提交错误密码
- **THEN** 系统 SHALL 返回 403，前台显示密码输入框

### Requirement: 管理员文章列表
Admin 文章列表页 SHALL 支持按状态、分类、标签筛选，按关键词搜索，分页展示，并支持批量操作（批量发布/删除/修改状态）。

#### Scenario: 按状态筛选
- **WHEN** 管理员选择 status=draft 筛选器
- **THEN** 系统 SHALL 仅返回 status=draft 的文章列表

#### Scenario: 批量删除
- **WHEN** 管理员勾选多篇文章并点击批量删除
- **THEN** 系统 SHALL 对所有选中文章执行软删除

### Requirement: 前台文章预览
Admin 编辑页 SHALL 提供"预览"按钮，以草稿状态打开前台预览页（带 preview token，跳过发布状态检查）。

#### Scenario: 预览草稿文章
- **WHEN** 管理员点击 View/预览按钮
- **THEN** 系统 SHALL 在新标签页打开 `/blog/<slug>?preview=<token>`，前台展示草稿内容
