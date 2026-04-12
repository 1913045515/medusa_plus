## ADDED Requirements

### Requirement: Admin 商店设置页面

Admin SHALL 提供路由 `/store-settings`，显示"商店设置"页面，包含购物车显示/隐藏的开关控件（Toggle）。

#### Scenario: 进入页面加载当前配置

- **WHEN** 管理员访问商店设置页面
- **THEN** 页面 SHALL 调用 `GET /admin/store-settings` 并将开关设置为当前 `cart_enabled` 值

#### Scenario: 管理员切换开关并保存

- **WHEN** 管理员点击开关并点击保存按钮
- **THEN** 页面 SHALL 调用 `PUT /admin/store-settings` 并显示成功提示

#### Scenario: API 调用失败时显示错误

- **WHEN** 保存请求失败
- **THEN** 页面 SHALL 显示错误提示，开关恢复原值
