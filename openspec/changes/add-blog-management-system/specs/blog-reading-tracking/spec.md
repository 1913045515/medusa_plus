## ADDED Requirements

### Requirement: 阅读数累计
前台访问文章详情页时，系统 SHALL 自动向 `POST /store/blogs/:id/view` 发起请求，后端去重后将 blog_post.read_count 加 1。去重规则：同一 ip + 同一 post_id，24小时内仅计一次。

#### Scenario: 新访客阅读
- **WHEN** 新 IP 首次请求 `/store/blogs/:id/view`
- **THEN** 系统 SHALL 插入 blog_post_read 记录，并将 read_count 原子加 1

#### Scenario: 重复访问不计数
- **WHEN** 同一 IP 在 24 小时内再次请求 `/store/blogs/:id/view`
- **THEN** 系统 SHALL 不增加 read_count

### Requirement: 字数自动计算
文章 SHALL 在保存时自动计算 word_count（剥离 HTML 标签后的字符数）。

#### Scenario: 保存时更新字数
- **WHEN** 管理员保存文章
- **THEN** 系统 SHALL 剥离 content 的 HTML 标签，计算字符数写入 word_count

### Requirement: 预计阅读时长
前台文章详情和列表摘要 SHALL 显示预计阅读时长，计算公式：`ceil(word_count / 300)` 分钟，最小 1 分钟。

#### Scenario: 展示阅读时长
- **WHEN** 前台渲染文章卡片或详情页
- **THEN** 系统 SHALL 显示"约 N 分钟阅读"
