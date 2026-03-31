## ADDED Requirements

### Requirement: Backend persists product image metadata

The system SHALL store per-image metadata in a `product_image_meta` table with columns: `id`, `product_id`, `image_id` (Medusa product image ID), `is_main` (boolean, default false), `sort_order` (integer, default 0), `created_at`, `updated_at`. Only one image per product MUST have `is_main = true` at any time.

#### Scenario: Set main image
- **WHEN** admin sends `PUT /admin/products/{id}/images/meta` with `{ "images": [{ "image_id": "img_1", "is_main": true, "sort_order": 0 }, { "image_id": "img_2", "is_main": false, "sort_order": 1 }] }`
- **THEN** the system upserts meta rows and ensures exactly one `is_main = true` per product, returning `200`

#### Scenario: Reorder images
- **WHEN** admin sends the same endpoint with updated `sort_order` values
- **THEN** the meta rows reflect the new ordering, and the Store API returns images in the new order

### Requirement: Admin image management widget with drag-sort and main-image toggle

The Admin product edit page SHALL include a widget (injected via `defineWidgetConfig`) displaying all product images as a drag-sortable grid. Each image card SHALL have a "Set as main" button/toggle. Drag-and-drop reordering MUST update `sort_order`, and setting main image MUST update `is_main`.

#### Scenario: Drag image to reorder
- **WHEN** admin drags the third image to the first position
- **THEN** the display updates immediately, and persisting saves the new `sort_order` to the backend

#### Scenario: Set main image
- **WHEN** admin clicks "Set as main" on a non-main image
- **THEN** that image gets a visual "Main" badge, the previous main image loses it, and persisting saves `is_main` changes

### Requirement: Admin i18n for image management widget labels

All labels in the image management widget (section heading, "Set as main", "Main image" badge, "Save order" button) MUST use `useTranslation` with keys under `productImages.*` and provide `en` + `zh-CN` translations.

#### Scenario: Admin language set to zh-CN
- **WHEN** admin interface language is Chinese
- **THEN** labels display "产品图片管理", "设为主图", "主图", "保存排序"

#### Scenario: Admin language set to en
- **WHEN** admin interface language is English
- **THEN** labels display "Product Image Management", "Set as Main", "Main", "Save Order"

### Requirement: Store API returns sorted images with main-image indicator

The Store API for product detail MUST return the product's images sorted by `sort_order` ascending, with a `is_main` flag per image. If no custom metadata exists, images MUST fall back to Medusa's default order with the first image treated as main.

#### Scenario: Images with custom order
- **WHEN** storefront requests product data and the product has custom image metadata
- **THEN** images are returned sorted by `sort_order`, and exactly one image has `is_main: true`

#### Scenario: Images without custom metadata (fallback)
- **WHEN** storefront requests product data and the product has no image metadata rows
- **THEN** images are returned in Medusa's default order, with the first image marked as `is_main: true`

### Requirement: Storefront image carousel with thumbnail navigation and zoom

The Storefront product detail page left column SHALL render a Swiper-based carousel with:
- Main image display area with click-to-zoom (react-medium-image-zoom)
- Thumbnail navigation strip below the main image
- Left/right arrow navigation
- Main image (`is_main: true`) displayed first on initial load

#### Scenario: View product with multiple images
- **WHEN** user opens a product detail page with 5 images
- **THEN** the carousel shows the main image first, thumbnail strip shows all 5, and arrows allow navigation

#### Scenario: Click to zoom
- **WHEN** user clicks the main carousel image
- **THEN** a zoomed/full-screen preview of the image appears

#### Scenario: Mobile responsive
- **WHEN** user views the product detail page on a mobile device (< 768px)
- **THEN** the carousel stacks above the product info in a single column layout, and swipe gestures work for navigation

### Requirement: Storefront i18n for image gallery labels

Accessibility labels and any visible UI text in the image gallery (e.g. "Previous", "Next", alt text patterns) MUST be translatable via storefront i18n with `en` and `zh-CN`.

#### Scenario: Storefront locale is zh-CN
- **WHEN** locale is `zh-CN`
- **THEN** arrow buttons have aria-labels "上一张" / "下一张"

#### Scenario: Storefront locale is en
- **WHEN** locale is `en`
- **THEN** arrow buttons have aria-labels "Previous" / "Next"
