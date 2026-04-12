## ADDED Requirements

### Requirement: Admin can configure checkout field visibility and required status
管理员 SHALL 能够在 Admin 后台的商店设置中，对结算页面的每个字段分别配置 `visible`（是否显示）和 `required`（是否必填）。

可配置字段列表：
- Shipping: first_name, last_name, address_1, company, postal_code, city, country（仅 required 可配置，visible 锁定为 true）, province, phone
- Billing（独立账单地址时）: first_name, last_name, address_1, company, postal_code, city, country（同上）, province, phone
- Email: 系统锁定，visible=true，required=true，不可配置

#### Scenario: Admin saves field configuration
- **WHEN** 管理员在结算字段配置页面修改某字段的 visible 或 required 状态并保存
- **THEN** 系统 SHALL 持久化配置至 store-settings 模块，并返回 200 响应

#### Scenario: Country field cannot be hidden
- **WHEN** 管理员尝试将 country 字段的 visible 设为 false
- **THEN** 系统 SHALL 拒绝该配置，返回 422 错误，提示"Country 字段不可隐藏"

#### Scenario: Email field is not shown in config UI
- **WHEN** 管理员访问结算字段配置页面
- **THEN** Email 字段 SHALL NOT 出现在可配置列表中（系统锁定）

### Requirement: Checkout field config API
系统 SHALL 提供以下 Admin 端点：

- `GET /admin/store-settings/checkout-fields` — 返回当前字段配置（JSON）
- `PUT /admin/store-settings/checkout-fields` — 更新字段配置

#### Scenario: Get default config when not set
- **WHEN** 配置尚未被管理员保存过时，GET 端点被调用
- **THEN** 系统 SHALL 返回所有字段的默认配置（visible=true，required 与当前硬编码一致）

#### Scenario: Successful config update
- **WHEN** Admin 发送合法的 PUT 请求
- **THEN** 系统 SHALL 存储配置并返回更新后的完整配置对象

### Requirement: Frontend renders checkout fields dynamically
前端结算页面 SHALL 根据从后端获取的字段配置动态渲染每个字段的显示状态和 required 属性。

#### Scenario: Hidden field not rendered
- **WHEN** 某字段配置 visible=false
- **THEN** 该字段 SHALL NOT 渲染到 DOM 中，且表单提交时 SHALL NOT 包含该字段值

#### Scenario: Optional field rendered without required marker
- **WHEN** 某字段配置 visible=true, required=false
- **THEN** 该字段 SHALL 渲染且不带 required 验证约束

#### Scenario: Config fetch fails - graceful degradation
- **WHEN** 配置 API 调用失败（网络错误、超时）
- **THEN** 前端 SHALL 回退到默认配置（所有字段显示，required 与当前一致），不阻断结算流程

### Requirement: Virtual cart simplified checkout mode
当购物车内所有商品均为虚拟产品时，前端 SHALL 自动切换到简化结算模式。

虚拟产品判断：商品的 `product.metadata.is_virtual === true`。

简化模式仅展示 Email 字段（及账单地址同收货地址 checkbox），隐藏所有地址相关字段。

#### Scenario: All virtual items triggers simplified mode
- **WHEN** 购物车内所有 `item.product.metadata.is_virtual` 均为 true
- **THEN** 结算地址步骤 SHALL 仅显示 Email 字段

#### Scenario: Mixed cart uses normal mode
- **WHEN** 购物车内存在至少一个非虚拟产品
- **THEN** 结算地址步骤 SHALL 使用管理员配置的字段显示规则（非简化模式）

#### Scenario: Email always required in simplified mode
- **WHEN** 简化模式下用户尝试提交空 Email
- **THEN** 系统 SHALL 阻止提交并提示 Email 必填
