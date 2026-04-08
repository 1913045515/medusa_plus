## Context

当前课程模块把 `thumbnail_url` 和 `video_url` 当作普通字符串字段处理：admin 直接录入 URL，storefront 直接消费这些地址渲染图片和视频。这个模型不适合受控媒体分发，因为课程视频需要依赖 S3 的临时授权访问，而 admin 还需要可替换、可删除、可追踪原始文件信息的上传流程。

本次变更同时跨越 `my-store` 的课程数据模型、admin API、store API、S3 集成，以及 `my-store-storefront` 的课程展示和视频播放逻辑，属于带外部依赖和数据迁移的跨模块改造。

## Goals / Non-Goals

**Goals:**
- 为 course 封面、lesson 封面、lesson 视频建立统一的后台上传到 S3 的服务端流程。
- 在 course 和 lesson 中持久化媒体的永久 S3 地址及其文件元数据，支持删除、替换和重新上传。
- storefront 只消费后端生成的临时签名地址，不接触永久 S3 地址。
- lesson 视频签名默认有效期 2 小时，过期后前台能明确提示并刷新新的访问授权。

**Non-Goals:**
- 不实现浏览器直传、断点续传、转码管线或 DRM。
- 不改变课程购买鉴权规则本身，只改变媒体地址生成和渲染方式。
- 不承诺浏览器环境下对临时签名地址做到绝对不可提取，只做应用层最小暴露和交互抑制。

## Decisions

### 1. 由后端统一负责上传到 S3，而不是浏览器直传

- Decision: admin 的文件上传按钮把文件发送给 `my-store`，由后端使用现有 AWS SDK 依赖写入 S3。
- Rationale: IAM 凭证只保留在服务端；可以在一个位置统一做文件类型、大小、命名规则和替换删除逻辑；与现有 Medusa admin session 模型更一致。
- Applied constraints: 默认 region 为 `ap-southeast-1`；单文件大小上限为 2 GB。
- Alternatives considered:
  - 浏览器直传 S3 + 预签名 PUT：减少后端流量，但需要额外的直传协议、回写确认和更复杂的失败恢复，不符合本次最小改造目标。

### 2. 复用现有 `thumbnail_url` / `video_url` 持久化永久地址，并新增结构化媒体元数据字段

- Decision: 保留 course/lesson 现有的 `thumbnail_url`、lesson 的 `video_url` 作为数据库中的永久 S3 地址，同时新增结构化 JSON 字段，例如 `thumbnail_asset` 与 `video_asset`，保存 `bucket`、`key`、`original_name`、`extension`、`mime_type`、`size_bytes`、`uploaded_at` 等元数据。
- Rationale: 这满足用户对永久地址和文件信息持久化的要求，同时将对象 key 和文件摘要从松散的 `metadata` 中分离出来，便于删除、替换和接口序列化。
- Alternatives considered:
  - 仅使用 `metadata`：迁移更小，但查询和类型约束弱，后续容易与其他业务元数据混杂。
  - 全量替换为独立媒体表：模型更规范，但对当前课程模块是过度设计。

### 3. storefront 侧所有课程媒体都通过后端按需签名

- Decision: store 端课程列表、lesson 列表、lesson 播放接口在响应时将永久地址转换为临时签名 URL；视频接口额外返回失效时间或剩余秒数，默认 7200 秒。
- Rationale: 这样 storefront 可以保持当前“从后端取课程数据再渲染”的模式，不需要持有任何 S3 凭证，也不会看到永久地址。
- Alternatives considered:
  - 前端自行请求签名：会把签名职责和鉴权分散到 storefront，不适合当前边界。

### 4. 过期恢复通过前端显式刷新授权，而不是后台静默长轮询

- Decision: lesson 播放器在视频加载失败、播放被拒绝或本地判断已过期时，展示“授权已过期，请刷新访问”的状态和刷新按钮；按钮重新调用 play 接口获取新的签名地址。
- Rationale: 2 小时签名是明确的业务约束，显式刷新更容易理解，也避免隐藏式刷新引入的状态复杂度。
- Alternatives considered:
  - 自动静默续签：体验更平滑，但需要处理并发、播放器状态恢复和重复鉴权，首版复杂度偏高。

### 5. “禁止复制视频地址”按应用层最小暴露实现

- Decision: storefront 不下发永久地址，不提供复制链接入口，对视频播放器禁用下载控件和常见右键菜单；依赖 S3 签名过期和资源策略提供真正的访问边界。
- Rationale: 浏览器无法完全阻止用户通过开发者工具观察网络请求，因此只能做到“不展示永久地址”和“减少直接复制途径”。

## Risks / Trade-offs

- [旧数据为空或仍为外部 URL] → 历史媒体不做批量迁移；迁移逻辑允许老记录继续存在，但只有 S3 媒体记录才参与签名。
- [对象删除失败导致孤儿文件] → 替换和删除流程记录日志并返回可见错误，必要时追加离线清理脚本。
- [2 小时签名过期影响长时间停留用户] → 前端提供明确过期提示和一键刷新授权。
- [Next.js 图片域名限制] → storefront 需要同步更新图片远程域名或改用后端代理可控地址。
- [无法绝对防止地址提取] → 设计文档明确仅承诺不暴露永久地址，并依赖 S3 临时授权和 bucket 策略兜底。

## Migration Plan

1. 为 course 和 lesson 增加媒体元数据字段并生成迁移。
2. 新增后端 S3 媒体服务、admin 上传/删除接口以及 store 响应签名逻辑。
3. 改造 admin 课程编辑界面为文件上传交互。
4. 改造 storefront 课程图片与视频播放的数据消费和过期提示。
5. 配置生产环境变量后，在预发环境验证上传、播放、过期刷新与删除替换。

回滚策略：保留原始 `thumbnail_url` / `video_url` 字段，回滚时可切回旧的 URL 直出序列化逻辑；新加 JSON 字段不会阻塞旧代码读取。

## Open Questions

- 是否需要对不同媒体类型设置不同的最大文件大小与 MIME 白名单。
