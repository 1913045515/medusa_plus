## ADDED Requirements

### Requirement: Frontend renders checkout fields based on dynamic config
前端结算组件 SHALL 接收字段配置 props，按配置动态控制每个字段的 visible 和 required 属性，取代硬编码状态。

#### Scenario: Field config applied to shipping address
- **WHEN** ShippingAddress 组件接收到字段配置
- **THEN** 每个字段 SHALL 按配置的 visible/required 渲染，不可见字段从 DOM 移除

#### Scenario: Billing address uses same config structure
- **WHEN** BillingAddress 组件接收到字段配置
- **THEN** billing 字段 SHALL 同样按配置渲染
