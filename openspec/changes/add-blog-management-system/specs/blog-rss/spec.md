## ADDED Requirements

### Requirement: RSS 2.0 订阅端点
系统 SHALL 在 `/feed/rss.xml` 提供 RSS 2.0 格式的订阅源，包含最新 20 篇 status=published 且 visibility=all 的文章。

#### Scenario: 订阅源内容
- **WHEN** RSS 阅读器访问 `/feed/rss.xml`
- **THEN** 系统 SHALL 返回合法的 RSS 2.0 XML，每条 item 包含 title、link（完整URL）、description（excerpt）、pubDate、author、category

#### Scenario: RSS 缓存
- **WHEN** 同一请求在 10 分钟内重复访问 `/feed/rss.xml`
- **THEN** 系统 SHALL 返回缓存的 XML，响应头含 Cache-Control: max-age=600
