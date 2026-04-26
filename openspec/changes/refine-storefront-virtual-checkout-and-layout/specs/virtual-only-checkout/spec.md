## ADDED Requirements

### Requirement: Virtual-only carts skip shipping steps
The storefront checkout SHALL detect when every purchasable cart item is a virtual product and MUST hide shipping-address and shipping-method sections for that cart.

#### Scenario: Virtual-only cart enters checkout
- **WHEN** a customer opens checkout with a cart whose line items are all virtual products
- **THEN** the checkout page does not render shipping address inputs
- **AND** the checkout page does not render shipping method selection

#### Scenario: Mixed cart keeps shipping flow
- **WHEN** a customer opens checkout with at least one physical product in the cart
- **THEN** the checkout page continues to render shipping address and shipping method sections

### Requirement: Virtual-only carts can pay without shipping configuration
For a virtual-only cart, the checkout flow SHALL allow payment authorization and order placement without requiring a shipping address or a selected shipping method.

#### Scenario: Payment becomes available for virtual-only cart
- **WHEN** a virtual-only cart has satisfied its required customer and billing information
- **THEN** the payment action becomes available without shipping-related validation errors

#### Scenario: No shipping-specific blocking errors
- **WHEN** a customer attempts to pay for a virtual-only cart
- **THEN** the storefront does not block submission because of missing shipping address fields or shipping option selection

### Requirement: Virtual-only purchases present as completed digital orders
After successful payment for a virtual-only cart, the storefront SHALL present the resulting order as a completed digital purchase rather than a shipment-awaiting order.

#### Scenario: Order confirmation reflects digital completion
- **WHEN** a virtual-only order is successfully placed
- **THEN** the confirmation experience uses completed or delivered-style messaging
- **AND** it does not show not-shipped or awaiting-shipment messaging for that order

#### Scenario: Order detail hides shipment-specific framing for virtual-only order
- **WHEN** a customer views an order that contains only virtual products
- **THEN** shipment-specific status copy and shipping detail panels are hidden or replaced with digital-delivery completion copy