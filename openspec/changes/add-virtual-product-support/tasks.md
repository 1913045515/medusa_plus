## 1. Product virtual configuration

- [x] 1.1 Add backend product virtual field read/write support and validation for code-based fields in `my-store/src/api/admin/products/**`, plus product metadata helpers under `my-store/src/modules` as needed.
- [x] 1.2 Extend the admin product editing experience to manage `is_virtual`, `virtual_product_type`, resource download URL, and course selection in `my-store/src/admin/widgets/*product*.tsx` or new companion components under `my-store/src/admin/components/`.
- [x] 1.3 Add localized admin labels and validation messages for virtual product types in `my-store/src/admin/i18n/json/zh-CN.json` and `my-store/src/admin/i18n/json/en.json`.

## 2. Course linkage synchronization

- [x] 2.1 Update course admin forms to keep `product_id` optional while preserving save/edit flows in `my-store/src/admin/routes/courses/page.tsx` and `my-store/src/admin/routes/courses/[id]/page.tsx`.
- [x] 2.2 Implement product-led course binding sync so saving a course virtual product updates both product metadata and course linkage in `my-store/src/modules/course/services/course.service.ts`, related repositories, and any admin API handlers involved.

## 3. Order fulfillment snapshot

- [x] 3.1 Persist virtual fulfillment snapshots for purchased order items, including type code and delivery target data, in the order success pipeline around `my-store/src/api/store/course-purchases/from-order/route.ts` and adjacent order-processing code paths.
- [x] 3.2 Ensure course virtual products resolve and store a stable relative course path, and resource virtual products store the effective download URL, with shared normalization/validation logic under `my-store/src/modules/course/` or a new virtual-product helper.
- [x] 3.3 Update store/admin API contracts and OpenAPI docs for virtual product and order snapshot fields in `my-store/openapi/admin.yaml` and `my-store/openapi/store.yaml`.

## 4. Order detail experience

- [x] 4.1 Render virtual fulfillment information in storefront order details and confirmation views using order item snapshot data in `my-store-storefront/src/modules/order/components/item/index.tsx`, `my-store-storefront/src/modules/order/components/items/index.tsx`, and related order templates.
- [x] 4.2 Add localized type labels and CTA copy for course navigation and resource download in storefront translation or UI text sources under `my-store-storefront/src/`.
- [x] 4.3 Verify that course links navigate by stored relative path and resource links trigger download behavior from account order detail pages under `my-store-storefront/src/app/[countryCode]/(main)/account/@dashboard/orders/details/[id]/page.tsx` and order confirmation pages.

## 5. Verification and rollout artifacts

- [x] 5.1 Add or update backend tests for virtual product validation, course sync, and order snapshot persistence in `my-store/integration-tests/http/` and relevant unit test folders under `my-store/src/modules/`.
- [x] 5.2 Add or update storefront/admin coverage for virtual order rendering and i18n-sensitive labels in the nearest existing test locations, or document manual verification steps if automated coverage is not yet present.
- [x] 5.3 Update implementation notes for deployment and operational verification in `docs/course-purchase-flow.md` and any related deployment or payment docs affected by the new virtual delivery flow.