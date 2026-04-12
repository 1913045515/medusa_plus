## ADDED Requirements

### Requirement: Storefront 根据配置隐藏购物车图标

当 `cart_enabled` 为 `false` 时，Storefront 导航栏 SHALL 隐藏购物车图标和下拉菜单。

#### Scenario: cart_enabled 为 true

- **WHEN** `cart_enabled` 为 `true`
- **THEN** 导航栏购物车图标 SHALL 正常显示

#### Scenario: cart_enabled 为 false

- **WHEN** `cart_enabled` 为 `false`
- **THEN** 导航栏购物车图标 SHALL 不渲染（不显示）

### Requirement: 产品页面 Buy Now 直接跳转结算

当 `cart_enabled` 为 `false` 时，产品页面 SHALL 将"Add to Cart"按钮替换为"Buy Now"按钮，点击后自动将商品加入购物车并直接跳转到结算页（`/{countryCode}/checkout`），而不显示购物车弹窗。

#### Scenario: 购物车开启时的正常流程

- **WHEN** `cart_enabled` 为 `true`
- **THEN** 产品页显示"Add to Cart"按钮，行为与当前一致

#### Scenario: 购物车关闭时 Buy Now 流程

- **WHEN** `cart_enabled` 为 `false` 且用户点击"Buy Now"
- **THEN** 系统 SHALL 将选中商品加入购物车，然后直接导航到 `/{countryCode}/checkout`

### Requirement: 移动端购物车入口隐藏

当 `cart_enabled` 为 `false` 时，移动端产品页的购物车相关按钮 SHALL 变更为"Buy Now"并直接跳转结算。

#### Scenario: 移动端 Buy Now

- **WHEN** `cart_enabled` 为 `false` 且用户在移动端点击"Buy Now"
- **THEN** 系统 SHALL 加入购物车并导航到结算页
