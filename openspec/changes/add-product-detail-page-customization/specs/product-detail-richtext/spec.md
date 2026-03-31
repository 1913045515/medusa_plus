## ADDED Requirements

### Requirement: Backend persists product rich-text detail

The system SHALL store a per-product rich-text HTML string (`detail_html`) in a dedicated `product_detail` table linked by `product_id`. The field MUST be nullable and default to `NULL`.

#### Scenario: Save rich-text for a product the first time
- **WHEN** admin sends `PUT /admin/products/{id}/detail` with `{ "detail_html": "<h2>About</h2><p>High quality.</p>" }`
- **THEN** the system creates a `product_detail` row for that product and returns `200` with the saved record

#### Scenario: Update existing rich-text
- **WHEN** admin sends `PUT /admin/products/{id}/detail` with updated `detail_html`
- **THEN** the existing row is updated in place and returns `200`

#### Scenario: Clear rich-text
- **WHEN** admin sends `PUT /admin/products/{id}/detail` with `{ "detail_html": null }`
- **THEN** the `detail_html` field is set to `NULL` and returns `200`

### Requirement: XSS sanitization on save

The system SHALL apply a tag/attribute white-list filter before persisting `detail_html`. Only safe HTML tags (headings, paragraphs, lists, tables, images, links, inline formatting, blockquote, code) and safe attributes (href, src, alt, class, style with limited properties, colspan, rowspan) MUST be retained. All script/event-handler content MUST be stripped.

#### Scenario: Script tag removal
- **WHEN** admin saves `detail_html` containing `<script>alert(1)</script>`
- **THEN** the persisted value does not contain any `<script>` elements

#### Scenario: Event handler removal
- **WHEN** admin saves `detail_html` containing `<img onerror="alert(1)" src="x">`
- **THEN** the persisted value retains `<img src="x">` but NOT the `onerror` attribute

### Requirement: Store API returns product detail_html

The Store API SHALL expose the product's `detail_html` alongside standard product data so the storefront can render it.

#### Scenario: Product with rich-text
- **WHEN** storefront requests `GET /store/products/{id}/detail`
- **THEN** the response contains `{ "detail_html": "<h2>...</h2>..." }` with status `200`

#### Scenario: Product without rich-text
- **WHEN** storefront requests `GET /store/products/{id}/detail` for a product with no saved detail
- **THEN** the response contains `{ "detail_html": null }` with status `200`

### Requirement: Admin rich-text editor with dual mode

The Admin product edit page SHALL include a TipTap-based rich-text editor widget (injected via `defineWidgetConfig`) supporting:
- Visual editing mode with toolbar (bold, italic, underline, headings H1-H6, bullet list, ordered list, blockquote, code block, table, image, link, text align, text color)
- HTML source-code editing mode
- One-click toggle between visual and source modes

#### Scenario: Toggle to source mode and back
- **WHEN** admin clicks the "HTML" toggle button
- **THEN** the editor switches to a code textarea showing raw HTML, and toggling back restores the visual editor with the same content

#### Scenario: Insert image in editor
- **WHEN** admin clicks the image toolbar button and provides an image URL
- **THEN** an `<img>` tag with that URL is inserted at the cursor position in the rich-text content

### Requirement: Admin i18n for rich-text editor labels

All user-facing labels in the rich-text editor widget (toolbar tooltips, mode toggle label, save button, section heading) MUST use `useTranslation` with keys under `productDetail.*`, and translations MUST be provided for `en` and `zh-CN`.

#### Scenario: Admin language set to zh-CN
- **WHEN** admin interface language is Chinese
- **THEN** all editor labels display in Chinese (e.g. "产品详情（富文本）", "保存", "HTML 源码")

#### Scenario: Admin language set to en
- **WHEN** admin interface language is English
- **THEN** all editor labels display in English (e.g. "Product Detail (Rich Text)", "Save", "HTML Source")

### Requirement: Storefront rich-text rendering with XSS protection

The Storefront MUST render `detail_html` through a client-side sanitizer (DOMPurify) before injecting via `dangerouslySetInnerHTML`. A default stylesheet MUST provide typography for headings, paragraphs, lists, tables, images, blockquotes, and code blocks.

#### Scenario: Rich-text renders correctly
- **WHEN** storefront displays a product with `detail_html` containing headings, a table, and an image
- **THEN** all elements render with appropriate styles (heading sizes, table borders, image responsive sizing)

#### Scenario: Malicious content is stripped client-side
- **WHEN** `detail_html` somehow contains `<script>` tags (e.g. database was manipulated directly)
- **THEN** the client-side sanitizer removes them before rendering

### Requirement: Storefront i18n for product detail section

UI chrome labels around the rich-text section (e.g. section heading "Product Details") MUST be translatable via `getCoursesDictionary`-style storefront i18n, with `en` and `zh-CN` translations.

#### Scenario: Storefront locale is zh-CN
- **WHEN** locale cookie is `zh-CN`
- **THEN** the section heading displays "产品详情"

#### Scenario: Storefront locale is en
- **WHEN** locale cookie is `en`
- **THEN** the section heading displays "Product Details"
