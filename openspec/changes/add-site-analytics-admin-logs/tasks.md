## 1. Database and backend foundation

- [x] 1.1 Add a dedicated analytics module model, service, and registration in `my-store/src/modules/site-analytics/**` and `my-store/medusa-config.ts`.
- [x] 1.2 Generate and commit the analytics migration in `my-store/src/modules/site-analytics/migrations/**` and store the reviewed PostgreSQL DDL summary in `sql/` or `docs/` artifacts.
- [x] 1.3 Implement admin/store analytics routes for event ingestion and admin log querying/deletion in `my-store/src/api/**`.

## 2. Storefront event collection

- [x] 2.1 Add a lightweight analytics client utility and tracker component in `my-store-storefront/src/lib/**` and `my-store-storefront/src/app/**`.
- [x] 2.2 Capture page view and dwell-time events asynchronously with visitor/session identifiers and country context from existing routing state.

## 3. Admin log management UI

- [x] 3.1 Add a Medusa Admin website log route in `my-store/src/admin/routes/**` with filter controls, sortable table columns, and pagination.
- [x] 3.2 Add single-delete and bulk-delete actions wired to the analytics admin APIs, including loading and empty states.

## 4. Verification and review

- [x] 4.1 Add or update focused tests for analytics persistence/query behavior and validate the affected app surfaces build or type-check successfully.
- [x] 4.2 Perform a code review pass over the final diff, address findings, and only then mark the change complete.