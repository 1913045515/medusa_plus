## ADDED Requirements

### Requirement: Orders capture virtual fulfillment snapshots
The system SHALL persist a fulfillment snapshot for each purchased virtual order line so that order details do not depend on the current product configuration.

#### Scenario: Resource product order is created
- **WHEN** a customer successfully places an order containing a `resource` virtual product
- **THEN** the order line MUST store `is_virtual=true`
- **THEN** the order line MUST store `virtual_product_type=resource`
- **THEN** the order line MUST store the configured download address used for fulfillment

#### Scenario: Course product order is created
- **WHEN** a customer successfully places an order containing a `course` virtual product
- **THEN** the order line MUST store `is_virtual=true`
- **THEN** the order line MUST store `virtual_product_type=course`
- **THEN** the order line MUST store the resolved course relative path used for customer navigation

### Requirement: Purchased course products expose both entitlement and navigation
The system SHALL grant course access for purchased course virtual products and expose a course entry point in order details.

#### Scenario: Purchased course appears in order details
- **WHEN** a customer opens an order that contains a purchased `course` virtual product
- **THEN** the order details UI MUST show the localized virtual type name
- **THEN** the UI MUST render a clickable course link based on the stored relative path

#### Scenario: Course entitlement remains purchase-gated
- **WHEN** a customer has not purchased the course product
- **THEN** the existing course access flow MUST continue to deny lesson playback and prompt the customer to purchase

### Requirement: Purchased resource products expose downloadable delivery data
The system SHALL show downloadable delivery information for purchased resource virtual products in order details.

#### Scenario: Purchased resource appears in order details
- **WHEN** a customer opens an order that contains a purchased `resource` virtual product
- **THEN** the order details UI MUST show the localized virtual type name
- **THEN** the UI MUST render a download action that uses the stored download address

#### Scenario: Product data changes after purchase
- **WHEN** an admin later changes the resource download address or course binding on the product
- **THEN** existing orders MUST continue to show the snapshot values stored at purchase time