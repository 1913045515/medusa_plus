## ADDED Requirements

### Requirement: 文章 SEO 字段
每篇文章 SHALL 支持独立的 SEO 字段：slug（URL别名）、seo_title（覆盖页面 `<title>`）、seo_description（覆盖 `<meta name="description">`）。

#### Scenario: 使用自定义 SEO 标题
- **WHEN** 文章设置了 seo_title
- **THEN** 前台页面 `<title>` SHALL 使用 seo_title，否则回退到 title

#### Scenario: 回退 SEO 描述
- **WHEN** 文章未设置 seo_description
- **THEN** 系统 SHALL 使用 excerpt 作为 meta description

### Requirement: Open Graph 元数据
前台文章详情页 SHALL 输出 Open Graph 和 Twitter Card 元标签，以支持社交媒体分享预览。

#### Scenario: OG 标签输出
- **WHEN** 搜索引擎或社交平台抓取文章详情页
- **THEN** 页面 `<head>` SHALL 包含 og:title、og:description、og:image（cover_image）、og:url、twitter:card 标签

### Requirement: 博客 Sitemap 集成
站点 sitemap SHALL 包含所有 status=published 且 visibility=all 的博客文章 URL（`/blog/<slug>`），以及分类归档页（`/blog/category/<slug>`）。

#### Scenario: Sitemap 含博客 URL
- **WHEN** 搜索引擎访问 sitemap.xml
- **THEN** sitemap SHALL 包含所有已发布公开文章的 URL，lastmod 为文章 updated_at

### Requirement: 面包屑导航
前台博客相关页面 SHALL 显示面包屑：首页 > 博客 [> 分类名] [> 文章标题]。

#### Scenario: 文章详情页面包屑
- **WHEN** 访客进入文章详情页
- **THEN** 页面 SHALL 显示"首页 > 博客 > {分类名} > {文章标题}"格式的面包屑导航
