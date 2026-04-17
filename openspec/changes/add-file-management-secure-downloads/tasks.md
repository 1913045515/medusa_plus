## 1. 数据库模型与迁移

- [x] 1.1 创建 `my-store/src/modules/file-asset/models/file-asset.ts`，定义 `FileAsset` Entity（字段：`id`、`name`、`original_filename`、`s3_key`、`s3_bucket`、`mime_type`、`size_bytes`、`description`、`created_at`、`updated_at`）
- [x] 1.2 创建 `my-store/src/modules/file-asset/models/file-download-log.ts`，定义 `FileDownloadLog` Entity（字段：`id`、`customer_id`、`file_asset_id`、`order_id`、`downloaded_at`）
- [x] 1.3 创建 `my-store/src/modules/file-asset/migrations/` 目录，生成 `file_asset` 表的 Medusa 迁移文件
- [x] 1.4 生成 `file_download_log` 表迁移，并在 `(customer_id, file_asset_id)` 和 `downloaded_at` 上建立复合索引

## 2. 文件资产服务（后端）

- [x] 2.1 创建 `my-store/src/modules/file-asset/service.ts`，实现 `FileAssetService`：`listFileAssets`（分页+搜索）、`getFileAsset`、`createFileAsset`（含 S3 上传）、`updateFileAsset`（name/description）、`deleteFileAsset`（含引用检查 + S3 删除）
- [x] 2.2 在 `FileAssetService.createFileAsset` 中复用现有 S3 工具（`my-store/src/modules/`，参考 add-s3-course-media-storage），将文件写入私有 S3 桶，key 格式：`file-assets/{uuid}/{original_filename}`
- [x] 2.3 在 `FileAssetService.deleteFileAsset` 中实现引用检查：查询 `product.metadata.resource_file_asset_id` 是否引用该文件，若有则返回 409
- [x] 2.4 实现 `countDownloadsByCustomerAndDate(customerId, fileAssetId, date)`：查询 `file_download_log` 计算当日下载次数
- [x] 2.5 实现 `recordDownload(customerId, fileAssetId, orderId)`：插入下载日志记录
- [x] 2.6 实现 `generatePresignedDownloadUrl(fileAssetId)`：调用 AWS SDK 生成 30 分钟有效的 presigned GET URL
- [x] 2.7 创建 `my-store/src/modules/file-asset/index.ts`，在 `medusa-config.ts` 中注册模块

## 3. Admin API 端点（文件管理）

- [x] 3.1 创建 `my-store/src/api/admin/file-assets/route.ts`，实现 `GET`（列表，支持 `q`、`limit`、`offset` 查询参数）和 `POST`（上传，`multipart/form-data`，大小上限 500 MB）
- [x] 3.2 创建 `my-store/src/api/admin/file-assets/[id]/route.ts`，实现 `GET`（单个文件详情）、`PATCH`（更新 name/description）、`DELETE`（删除，含引用检查）
- [x] 3.3 为所有 Admin 文件资产端点添加 Medusa admin 认证中间件

## 4. Store API 端点（受控下载）

- [x] 4.1 创建 `my-store/src/api/store/file-assets/[id]/download/route.ts`，实现 `GET`：验证顾客已登录（HTTP 401）、已购买含该文件的产品（HTTP 403）、检查当日下载次数（HTTP 429）、生成 presigned URL、记录日志、返回 HTTP 302
- [x] 4.2 实现订单所有权验证：查询 `order_line_item.metadata.resource_file_asset_id === id` 且订单属于当前顾客
- [x] 4.3 确保 presigned URL 不出现在任何 JSON 响应体中（仅通过 302 Location 头传递）
- [x] 4.4 调整订单详情 Store API（`/store/orders/{id}`），在 `resource` 类型 line item 中附加 `download_available_until`（当前时间 + 30 分钟，UTC）和 `remaining_downloads`（当日剩余次数），不返回任何 S3 URL

## 5. 虚拟产品配置改造（后端）

- [x] 5.1 修改 `my-store/src/api/admin/products/[id]/route.ts`（或对应的虚拟产品校验逻辑），新增对 `resource_file_asset_id` 字段的读取与写入，并在 `virtual_product_type === 'resource'` 时强制要求该字段存在（HTTP 400 校验）
- [x] 5.2 禁止新写入 `resource_download_url`：若请求体含 `resource_download_url` 但不含 `resource_file_asset_id`，返回 HTTP 400 错误提示
- [x] 5.3 在订单行快照写入逻辑（subscriber 或 workflow）中，优先写入 `resource_file_asset_id`；若商品只有旧的 `resource_download_url` 字段，则写入 `resource_download_url`（降级兼容）

## 6. Admin 前端 - 文件管理模块

- [x] 6.1 创建 `my-store/src/admin/routes/file-assets/page.tsx`，实现文件管理列表页（表格展示文件名、MIME、大小、上传时间，含搜索框和分页）
- [x] 6.2 创建文件上传区域（拖拽 / 点击选择），实现上传进度展示，上传完成后刷新列表
- [x] 6.3 实现文件删除确认弹窗，展示引用检查结果（若被引用则显示阻止提示）
- [x] 6.4 实现文件名 / 描述内联编辑功能
- [x] 6.5 将文件管理路由注册到 admin 侧边栏（Settings 或主导航）
- [x] 6.6 添加 i18n 文案（中英文）

## 7. Admin 前端 - 虚拟产品文件选择器

- [x] 7.1 创建 `my-store/src/admin/components/file-asset-picker/index.tsx`，实现文件选择弹窗（搜索、列表、单选确认）
- [x] 7.2 修改商品虚拟配置表单（`admin-extensions/course-admin/` 或对应的虚拟产品 widget），将 `resource_download_url` 输入框替换为 `FileAssetPicker` 组件
- [x] 7.3 在文件选择器中展示已选文件的名称和大小（而非文件 ID）
- [x] 7.4 实现旧版外部 URL 降级警告：若商品现有 `resource_download_url` 但无 `resource_file_asset_id`，展示"待迁移"警告标识

## 8. Storefront - 订单详情下载入口

- [x] 8.1 修改 `my-store-storefront/src/modules/account/components/order-overview/`（或订单详情组件），在 `resource` 类型 line item 中展示下载区块
- [x] 8.2 实现"下载文件"按钮：点击时调用 `/store/file-assets/{id}/download`，通过 302 重定向触发浏览器下载
- [x] 8.3 展示 `remaining_downloads`：在下载按钮旁显示"今日剩余 N 次"
- [x] 8.4 实现签名过期检测：根据 `download_available_until` 时间戳，超时后按钮禁用并展示"下载链接已过期，请刷新页面以重新获取"提示
- [x] 8.5 实现"刷新页面"按钮（或提示），点击后重新加载订单详情页
- [x] 8.6 实现当日次数耗尽态（`remaining_downloads === 0`）：按钮展示"今日已达下载上限"并禁用
- [x] 8.7 实现旧版外部 URL 降级展示："下载配置待管理员更新，请联系客服"

## 9. 安全与配置核查

- [x] 9.1 确认 S3 桶策略禁止公开 GetObject（在部署文档 / README 中添加 S3 桶配置说明）
- [x] 9.2 确认 `GET /store/file-assets/{id}/download` 在所有错误场景（401/403/429）下不泄露 presigned URL
- [x] 9.3 确认订单详情 Store API 响应中不包含任何 S3 地址
- [x] 9.4 确认文件上传接口对文件大小做服务端校验（500 MB 上限），不仅依赖前端校验

## 10. 测试与验证

- [x] 10.1 E2E 测试：admin 上传文件 → 商品选择文件 → 用户购买 → 订单详情展示下载按钮 → 成功下载
- [x] 10.2 测试每日限额：同一用户同一文件下载 3 次后第 4 次返回 429
- [x] 10.3 测试 30 分钟过期：模拟过期时间戳，验证前端展示正确的过期提示
- [x] 10.4 测试文件删除引用检查：被商品引用的文件删除返回 409，未引用的文件正常删除
- [x] 10.5 测试旧版降级：含 `resource_download_url` 的旧订单展示"待更新"提示，不报错
