## 1. Backend product-detail module and data model

- [x] 1.1 Create `my-store/src/modules/product-detail/` module structure: `index.ts`, `types.ts`, `models/product-detail.ts`, `models/product-image-meta.ts` with Medusa `model.define` for `product_detail` and `product_image_meta` tables.
- [x] 1.2 Create migration files under `my-store/src/modules/product-detail/migrations/` to generate `product_detail` (id, product_id, detail_html text nullable) and `product_image_meta` (id, product_id, image_id, is_main boolean, sort_order integer) tables.
- [x] 1.3 Create `my-store/src/modules/product-detail/repositories/product-detail.repository.ts` (interface + ORM implementation) and `product-image-meta.repository.ts` with CRUD + upsert operations.
- [x] 1.4 Create `my-store/src/modules/product-detail/services/product-detail.service.ts` and `product-image-meta.service.ts` with business logic including XSS sanitization for `detail_html` (using `sanitize-html`).
- [x] 1.5 Wire up DI in `my-store/src/modules/product-detail/index.ts`, create Medusa Module entry with `service.ts`, and register module in `my-store/medusa-config.ts`.
- [x] 1.6 Install `sanitize-html` and `@types/sanitize-html` in `my-store/package.json`.

## 2. Backend Admin and Store API routes

- [x] 2.1 Create `my-store/src/api/admin/products/[id]/detail/route.ts` with `GET` (read detail_html) and `PUT` (save detail_html with XSS filter) handlers.
- [x] 2.2 Create `my-store/src/api/admin/products/[id]/images-meta/route.ts` with `GET` (list image meta) and `PUT` (bulk upsert image meta with is_main/sort_order) handlers.
- [x] 2.3 Create `my-store/src/api/store/products/[id]/detail/route.ts` with `GET` handler returning `detail_html` (read-only, public).
- [x] 2.4 Create `my-store/src/api/store/products/[id]/images-meta/route.ts` with `GET` handler returning sorted image meta with is_main flag (read-only, public).

## 3. OpenAPI documentation

- [x] 3.1 Add `my-store/openapi/components/schemas/product-detail.yaml` with `ProductDetail`, `ProductImageMeta`, and input schemas.
- [x] 3.2 Update `my-store/openapi/admin.yaml` to add paths for `/admin/products/{id}/detail` and `/admin/products/{id}/images-meta`.
- [x] 3.3 Update `my-store/openapi/store.yaml` to add paths for `/store/products/{id}/detail` and `/store/products/{id}/images-meta`.
- [x] 3.4 Run `npm run spec:lint` in `my-store/` and fix any errors until 0 errors.

## 4. Admin rich-text editor widget

- [x] 4.1 Install TipTap dependencies in `my-store/package.json`: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/extension-table`, `@tiptap/extension-table-row`, `@tiptap/extension-table-cell`, `@tiptap/extension-table-header`, `@tiptap/extension-text-align`, `@tiptap/extension-underline`, `@tiptap/extension-color`, `@tiptap/extension-text-style`, `@tiptap/extension-code-block-lowlight`.
- [x] 4.2 Create `my-store/src/admin/components/product-detail-editor/index.tsx` — TipTap rich-text editor component with toolbar (bold/italic/underline/headings/lists/quote/code/table/image/link/align/color) and visual↔HTML source mode toggle.
- [x] 4.3 Create `my-store/src/admin/components/product-detail-editor/toolbar.tsx` — editor toolbar component using Medusa UI buttons/icons.
- [x] 4.4 Create Admin Widget at `my-store/src/admin/components/product-detail-widget.tsx` using `defineWidgetConfig({ zone: "product.details.after" })` that loads the product's `detail_html` from API, renders the editor, and saves on button click.

## 5. Admin image management widget

- [x] 5.1 Install `@hello-pangea/dnd` in `my-store/package.json`.
- [x] 5.2 Create `my-store/src/admin/components/product-images-manager/index.tsx`
- [x] 5.3 Create Admin Widget at `my-store/src/admin/components/product-images-widget.tsx` — drag-sortable image grid with "Set as main" toggle per image, using `@hello-pangea/dnd` for reordering and Medusa UI components for styling.
- [ ] 5.3 Create Admin Widget at `my-store/src/admin/components/product-images-widget.tsx` using `defineWidgetConfig({ zone: "product.details.after" })` that loads product images + meta from API, renders the manager, and saves sort_order/is_main on button click.

## 6. Admin i18n

- [x] 6.1 Add `productDetail.*` and `productImages.*` translation keys to `my-store/src/admin/i18n/json/en.json` and `my-store/src/admin/i18n/json/zh-CN.json` for all widget labels (section headings, toolbar tooltips, save buttons, mode toggles, image badges).

## 7. Storefront product detail page rewrite

- [x] 7.1 Install `swiper`, `react-medium-image-zoom`, and `isomorphic-dompurify` in `my-store-storefront/package.json`.
- [x] 7.2 Create `my-store-storefront/src/lib/data/product-detail.ts` with server actions `getProductDetail(productId)` and `getProductImagesMeta(productId)` to fetch from Store API.
- [x] 7.3 Create `my-store-storefront/src/modules/products/components/image-carousel/index.tsx` — Swiper-based carousel with thumbnail navigation, prev/next arrows, and react-medium-image-zoom on click. Client component with `'use client'`.
- [x] 7.4 Create `my-store-storefront/src/modules/products/components/product-richtext/index.tsx` — client component that sanitizes `detail_html` with DOMPurify and renders via `dangerouslySetInnerHTML`.
- [x] 7.5 Create `my-store-storefront/src/modules/products/components/product-richtext/richtext.css` — default typography stylesheet for rendered rich-text (headings, lists, tables, images, blockquotes, code blocks) inspired by WordPress content styles.
- [x] 7.6 Rewrite `my-store-storefront/src/modules/products/templates/index.tsx` to left-right split layout: left column = ImageCarousel, right column = ProductInfo + ProductPrice + ProductActions + ProductRichtext + ProductTabs. Mobile stacks vertically.
- [x] 7.7 Update `my-store-storefront/src/app/[countryCode]/(main)/products/[handle]/page.tsx` to fetch `detail` and `imagesMeta` data and pass to the rewritten template.

## 8. Storefront i18n

- [x] 8.1 Add product detail page UI labels (`productDetails`, `previousImage`, `nextImage`, etc.) to the storefront i18n dictionary in `my-store-storefront/src/lib/i18n/dictionaries.ts` for both `en` and `zh-CN`.

## 9. Verification

- [x] 9.1 Run `npm run build` in `my-store/` and confirm 0 errors.
- [x] 9.2 Run `npm run lint` in `my-store-storefront/` and confirm 0 errors.
- [x] 9.3 Run `npm run spec:lint` in `my-store/` and confirm 0 errors on OpenAPI specs.
- [x] 9.4 Smoke-test: verify Admin product edit page loads with both widgets visible, and Storefront product detail page renders the new layout without errors.
