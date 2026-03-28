## 1. Backend homepage content foundation

- [x] 1.1 Add homepage content types, defaults, and persistence support in `my-store/src/modules/course` or a dedicated content module.
- [x] 1.2 Add admin read/write routes for homepage content in `my-store/src/api/admin`.
- [x] 1.3 Add store read-only homepage content route in `my-store/src/api/store` and document payload shape.

## 2. Admin homepage editor

- [x] 2.1 Create a Medusa admin route for homepage content management in `my-store/src/admin/routes`.
- [x] 2.2 Implement structured form sections for hero, highlight cards, and featured course cards with required-field validation.
- [x] 2.3 Wire the admin editor to the new admin API and show save success or error feedback.

## 3. Storefront homepage rendering

- [x] 3.1 Add storefront data access for homepage content in `my-store-storefront/src/lib/data`.
- [x] 3.2 Replace static homepage hero content with API-driven homepage sections in `my-store-storefront/src/app/[countryCode]/(main)/page.tsx` and related home components.
- [x] 3.3 Add safe fallback rendering when homepage content is unavailable or incomplete.

## 4. Verification and docs

- [x] 4.1 Update OpenAPI or relevant docs for homepage content admin/store endpoints.
- [x] 4.2 Validate the changed files for type or lint errors and confirm tasks are complete.

## 5. Multi-config draft/publish upgrade

- [x] 5.1 Extend homepage content persistence to support multiple records and active published version selection.
- [x] 5.2 Update admin homepage management UI for config list, draft save, and publish actions.
- [x] 5.3 Update API docs and change artifacts to reflect multi-config and draft/publish behavior.