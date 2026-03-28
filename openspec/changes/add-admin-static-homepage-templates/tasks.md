## 1. Backend template model and APIs

- [x] 1.1 Extend homepage content types, defaults, and sanitization logic in my-store/src/modules/course/types.ts and my-store/src/modules/course/services/homepage-content.service.ts for static HTML template mode.
- [x] 1.2 Update homepage persistence and admin/store API handlers in my-store/src/modules/course/repositories and my-store/src/api/**/homepage-content to read and write template mode records.
- [x] 1.3 Update homepage OpenAPI schemas in my-store/openapi/components/schemas/homepage-content.yaml and related admin/store specs for template fields.

## 2. Admin static template editor

- [x] 2.1 Replace the structured homepage editor in my-store/src/admin/routes/homepage/page.tsx with a static HTML template management UI that supports metadata, HTML/CSS editing, and record selection.
- [x] 2.2 Add inline preview and validation feedback in my-store/src/admin/routes/homepage/page.tsx for static template source before save and publish.

## 3. Storefront template rendering

- [x] 3.1 Update homepage data types and fetch logic in my-store-storefront/src/types/homepage.ts and my-store-storefront/src/lib/data/homepage.ts to support template mode records.
- [x] 3.2 Add a storefront template renderer and switch my-store-storefront/src/app/[countryCode]/(main)/page.tsx to render published static templates with default homepage fallback.

## 4. Verification

- [x] 4.1 Validate affected backend and storefront files for type or lint errors.
- [x] 4.2 Mark the change artifacts complete and confirm the static HTML homepage template workflow is implementation-ready.