## ADDED Requirements

### Requirement: 全文搜索端点
系统 SHALL 在 `GET /store/blogs?q=<keyword>` 支持按关键词搜索，匹配范围为 title、excerpt 和 content（PostgreSQL tsvector GIN 索引）。仅返回 status=published 且可见的文章。

#### Scenario: 关键词搜索命中
- **WHEN** 访客请求 `/store/blogs?q=nextjs`
- **THEN** 系统 SHALL 返回 title/excerpt/content 中包含 "nextjs" 的已发布可见文章列表

#### Scenario: 无结果搜索
- **WHEN** 关键词无任何文章匹配
- **THEN** 系统 SHALL 返回空数组和 200 状态码

#### Scenario: 中文关键词降级
- **WHEN** 关键词含中文字符且 tsvector 无法正确分词
- **THEN** 系统 SHALL 降级为 ILIKE 模糊匹配

### Requirement: 前台搜索 UI
前台博客列表页 SHALL 提供搜索框，输入关键词后触发搜索并实时更新文章列表。

#### Scenario: 输入关键词搜索
- **WHEN** 访客在博客列表页搜索框输入关键词并回车或点击搜索
- **THEN** 页面 SHALL 更新显示匹配的文章列表，URL 更新为 `/blog?q=<keyword>`

### Requirement: 相关文章推荐
文章详情页 SHALL 在底部显示最多 3 篇相关文章，推荐规则：相同分类 + 有共同标签，按 published_at 倒序，排除当前文章。

#### Scenario: 显示相关文章
- **WHEN** 访客查看文章详情页
- **THEN** 系统 SHALL 在页面底部显示最多 3 篇相关文章卡片（含标题、封面图、摘要）

#### Scenario: 无相关文章
- **WHEN** 当前文章所在分类无其他已发布文章
- **THEN** 系统 SHALL 不显示相关文章区块

### Requirement: 上一篇/下一篇导航
文章详情页 SHALL 显示同分类下按 published_at 排序的上一篇和下一篇文章链接。

#### Scenario: 展示上下篇
- **WHEN** 访客查看文章详情页，同分类下存在其他已发布文章
- **THEN** 页面底部 SHALL 显示上一篇（更早）和下一篇（更新）的标题和链接

### Requirement: 文章内容目录（TOC）
详情页 SHALL 根据文章 HTML 内容中的 h2、h3 标签自动生成目录（Table of Contents），展示在文章右侧（桌面端浮动，移动端折叠）。

#### Scenario: 生成目录
- **WHEN** 文章包含至少 2 个 h2 或 h3 标签
- **THEN** 系统 SHALL 在详情页侧边栏生成目录，点击条目平滑滚动至对应标题

#### Scenario: 无标题不显示目录
- **WHEN** 文章内容不含 h2/h3 标签
- **THEN** 系统 SHALL 不显示目录区块

### Requirement: 社交分享按钮
文章详情页 SHALL 提供社交分享按钮，支持：复制链接、Twitter/X、Facebook、微信（二维码弹窗）、微博。

#### Scenario: 复制链接
- **WHEN** 访客点击复制链接按钮
- **THEN** 系统 SHALL 将当前文章 URL 复制到剪贴板，并显示成功提示
