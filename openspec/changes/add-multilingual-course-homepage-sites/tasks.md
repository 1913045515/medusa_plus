## 1. Backend content model and API

- [x] 1.1 Extend `my-store/src/modules/course/models/*`, `types.ts`, and new migrations to store localized course, lesson, and homepage content plus homepage `site_key`.
- [x] 1.2 Update `my-store/src/modules/course/repositories/*.orm.repository.ts` and `services/*.service.ts` to read/write localized fields with locale fallback and site-specific homepage publish/read rules.
- [x] 1.3 Update `my-store/src/api/admin/courses/**`, `my-store/src/api/admin/lessons/**`, `my-store/src/api/admin/homepage-content/**`, `my-store/src/api/store/courses/**`, and `my-store/src/api/store/homepage-content/route.ts` to accept locale/site context and return localized content.
- [x] 1.4 Update `my-store/openapi/admin.yaml`, `my-store/openapi/store.yaml`, and any related schemas to document locale/site-aware request and response fields.

## 2. Admin multilingual editing

- [x] 2.1 Update `my-store/src/admin/routes/courses/page.tsx` and `my-store/src/admin/routes/courses/[id]/page.tsx` to add a content-locale switcher and save localized course/lesson fields without overwriting other locales.
- [x] 2.2 Update `my-store/src/admin/routes/homepage/page.tsx` to add site selection and content-locale switching for localized homepage editing and publishing.
- [x] 2.3 Add or update admin translation resources in `my-store/src/admin/i18n/**` for new UI labels used by locale/site editors.

## 3. Storefront site and locale consumption

- [x] 3.1 Update `my-store-storefront/src/lib/data/homepage.ts`, `src/lib/data/locales.ts`, and related utilities to request homepage data with locale and site context.
- [x] 3.2 Update course data flows in `my-store-storefront/src/lib/data/**`, `src/modules/courses/**`, and route entry files under `src/app/[countryCode]/(main)/courses/**` to request and render localized course content.
- [ ] 3.3 Refine site-context handling in `my-store-storefront/src/middleware.ts`, `src/lib/data/cart.ts`, and layout switcher components so country/site switching updates route, region, cart context, and localized content refresh together.

## 4. Validation and fixtures

- [ ] 4.1 Update seed/demo data in `my-store/src/scripts/seed.ts` and any related fixtures to include representative localized course/homepage content and at least two site contexts.
- [ ] 4.2 Add or update backend integration tests and service/data-layer tests covering locale fallback, site-specific homepage publishing, admin localized saves, and storefront site switching behavior.
- [x] 4.3 Run relevant lint/tests, fix regressions caused by this change, and mark completed tasks in this file.