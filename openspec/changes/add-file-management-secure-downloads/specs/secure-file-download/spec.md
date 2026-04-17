## ADDED Requirements

### Requirement: 受控文件下载接口
系统 SHALL 提供 `GET /store/file-assets/{id}/download` 接口，仅允许已登录且已购买对应产品的顾客访问，通过所有校验后生成 30 分钟有效的 S3 预签名 GET URL，以 HTTP 302 重定向响应，并记录本次下载日志。接口 SHALL 拒绝未认证请求（HTTP 401）和未授权购买（HTTP 403）。

#### Scenario: 已购买顾客成功下载
- **WHEN** 已登录且已购买含该文件资产的产品的顾客请求下载接口
- **THEN** 系统记录下载日志（`file_download_log`），生成 30 分钟有效 S3 presigned URL，返回 HTTP 302 重定向至该 URL

#### Scenario: 未登录顾客被拒绝
- **WHEN** 未登录用户请求下载接口
- **THEN** 系统返回 HTTP 401

#### Scenario: 未购买顾客被拒绝
- **WHEN** 已登录但未购买对应产品的顾客请求下载接口
- **THEN** 系统返回 HTTP 403，提示"您未购买该产品，无下载权限"

---

### Requirement: 每日下载次数限制
系统 SHALL 对每个文件资产（`file_asset_id`）、每位顾客（`customer_id`）、每个自然日（UTC）限制最多 3 次下载调用，超额时返回 HTTP 429，并提示"今日下载次数已达上限（3次），请明日再试"。下载日志 SHALL 记录：`customer_id`、`file_asset_id`、`order_id`、`downloaded_at`。

#### Scenario: 第 3 次下载成功
- **WHEN** 顾客当日对同一文件资产已下载 2 次，发起第 3 次请求
- **THEN** 系统允许本次下载，记录日志，返回 HTTP 302

#### Scenario: 超过每日限额被拒绝
- **WHEN** 顾客当日对同一文件资产已下载 3 次，发起第 4 次请求
- **THEN** 系统返回 HTTP 429，响应体包含 `{ "message": "今日下载次数已达上限（3次），请明日再试", "limit": 3, "used": 3 }`

#### Scenario: 次日重置下载次数
- **WHEN** 顾客在新的自然日（UTC 0:00 后）首次请求同一文件资产的下载
- **THEN** 系统认为当日下载次数为 0，允许下载

---

### Requirement: Storefront 订单详情下载入口
storefront 已购买订单详情 SHALL 为 `resource` 类型虚拟产品展示受控下载按钮，按钮状态根据后端返回的 `download_available_until`（UTC 时间戳）和剩余下载次数动态控制；签名过期后按钮变为"链接已过期"并提示刷新页面；当日次数耗尽时按钮变为"今日已达上限"并禁用。

#### Scenario: 下载按钮可用
- **WHEN** 顾客进入订单详情页，距签名有效期尚有时间且当日下载次数未耗尽
- **THEN** 页面展示可点击的"下载文件"按钮，按钮旁显示剩余下载次数（如"今日剩余 2 次"）

#### Scenario: 签名过期提示
- **WHEN** 顾客在超过 30 分钟后打开订单详情页（或页面已停留超过 30 分钟）
- **THEN** 下载按钮禁用，展示"下载链接已过期，请刷新页面以重新获取"提示，并提供"刷新页面"按钮

#### Scenario: 刷新页面重新获取可用链接
- **WHEN** 顾客点击"刷新页面"（或手动刷新浏览器）
- **THEN** 页面重新加载订单详情，后端重新生成 `download_available_until` 时间戳（若当日次数未超限），下载按钮恢复可用

#### Scenario: 今日次数耗尽
- **WHEN** 顾客当日下载次数已达 3 次，查看订单详情
- **THEN** 下载按钮展示"今日已达下载上限"并禁用，不展示刷新提示

---

### Requirement: 下载安全限制
系统生成的 S3 预签名 URL SHALL 设定 30 分钟有效期，S3 桶 SHALL 配置为禁止公开 GetObject，仅允许通过 presigned URL 访问；下载接口 SHALL 仅通过本平台 API 服务暴露，不在任何 storefront API 响应中直接返回 S3 永久地址或 presigned URL 字符串（下载通过 302 重定向实现）。

#### Scenario: 直接访问 S3 桶 URL 被拒绝
- **WHEN** 任何用户尝试直接访问 S3 桶的永久对象 URL（无签名参数）
- **THEN** S3 返回 HTTP 403（AccessDenied），文件不可被直接访问

#### Scenario: Presigned URL 过期后访问被拒绝
- **WHEN** 用户在 30 分钟有效期后尝试使用相同的 presigned URL
- **THEN** S3 返回 HTTP 403，下载失败

#### Scenario: 订单详情 API 不返回 presigned URL 字符串
- **WHEN** storefront 请求订单详情 API
- **THEN** 响应中不包含任何 S3 地址或 presigned URL，只包含 `download_available_until` 时间戳和 `remaining_downloads` 计数

