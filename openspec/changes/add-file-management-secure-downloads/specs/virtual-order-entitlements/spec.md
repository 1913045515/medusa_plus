## MODIFIED Requirements

### Requirement: Orders capture virtual fulfillment snapshots
The system SHALL persist a fulfillment snapshot for each purchased virtual order line so that order details do not depend on the current product configuration.

For `resource` type virtual products, the snapshot SHALL store `resource_file_asset_id` (referencing `file_asset` table) instead of `resource_download_url`. If a product still has only `resource_download_url` and no `resource_file_asset_id`, the snapshot SHALL store `resource_download_url` as a legacy fallback.

#### Scenario: Resource product order is created with file asset binding
- **WHEN** a customer successfully places an order containing a `resource` virtual product configured with `resource_file_asset_id`
- **THEN** the order line MUST store `is_virtual=true`
- **THEN** the order line MUST store `virtual_product_type=resource`
- **THEN** the order line MUST store the `resource_file_asset_id` referencing the `file_asset` record

#### Scenario: Resource product order is created with legacy URL (fallback)
- **WHEN** a customer places an order containing a `resource` virtual product that only has `resource_download_url` (not yet migrated)
- **THEN** the order line stores `resource_download_url` as a legacy fallback field for backward compatibility

#### Scenario: Course product order is created
- **WHEN** a customer successfully places an order containing a `course` virtual product
- **THEN** the order line MUST store `is_virtual=true`
- **THEN** the order line MUST store `virtual_product_type=course`
- **THEN** the order line MUST store the resolved course relative path

### Requirement: Purchased resource products expose secure download entry
The system SHALL show a secure, rate-limited download entry for purchased resource virtual products in order details, replacing the previous direct URL display.

#### Scenario: Purchased resource appears in order details with file asset
- **WHEN** a customer opens an order that contains a purchased `resource` virtual product with `resource_file_asset_id`
- **THEN** the order details UI MUST show the localized virtual type name
- **THEN** the UI MUST render a "Download File" button that triggers `GET /store/file-assets/{id}/download`
- **THEN** the UI MUST show `download_available_until` and `remaining_downloads` from the backend response

#### Scenario: Purchased resource with legacy URL shows migration notice
- **WHEN** a customer opens an order that contains a purchased `resource` virtual product with only `resource_download_url`
- **THEN** the order details UI shows "下载配置待管理员更新，请联系客服" with no download button

#### Scenario: Product data changes after purchase
- **WHEN** an admin later changes the resource file asset binding on the product
- **THEN** existing orders MUST continue to show the snapshot `resource_file_asset_id` stored at purchase time
