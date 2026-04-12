## ADDED Requirements

### Requirement: 全局商店设置存储

系统 SHALL 在数据库中维护一张 `store_settings` 表，存储全局商店配置，初始包含 `cart_enabled`（布尔型，默认 `true`）。每次只有一条记录（单例）。

#### Scenario: 首次读取配置（记录不存在）

- **WHEN** 配置记录不存在于数据库
- **THEN** 系统 SHALL 自动创建默认记录并返回 `{ cart_enabled: true }`

#### Scenario: 读取已有配置

- **WHEN** 配置记录已存在
- **THEN** 系统 SHALL 返回当前 `cart_enabled` 值

### Requirement: Admin API 读写商店设置

系统 SHALL 提供 `GET /admin/store-settings` 和 `PUT /admin/store-settings` 接口，仅限鉴权管理员访问。

#### Scenario: 管理员获取设置

- **WHEN** 已登录管理员发起 `GET /admin/store-settings`
- **THEN** 响应 200，body 为 `{ store_settings: { cart_enabled: boolean } }`

#### Scenario: 管理员更新设置

- **WHEN** 已登录管理员发起 `PUT /admin/store-settings` 并携带 `{ cart_enabled: false }`
- **THEN** 响应 200，body 包含更新后的设置

#### Scenario: 未鉴权请求被拒绝

- **WHEN** 未登录用户访问 Admin API
- **THEN** 响应 401

### Requirement: Store API 只读商店设置

系统 SHALL 提供 `GET /store/store-settings`，无需鉴权，供 Storefront 读取。

#### Scenario: Storefront 获取设置

- **WHEN** 任意客户端发起 `GET /store/store-settings`
- **THEN** 响应 200，body 为 `{ store_settings: { cart_enabled: boolean } }`
