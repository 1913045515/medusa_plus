## Context

The storefront already derives a country code from the URL and middleware, while Medusa Admin already hosts custom management screens and backend routes. The new analytics feature crosses storefront, backend, admin, and database layers, and it introduces a new persisted dataset that must follow the repo constitution: minimal surface-area changes, reviewed DDL stored in repo, and database changes applied through Medusa migrations.

## Goals / Non-Goals

**Goals:**
- Capture page view and dwell-time analytics asynchronously from the storefront without blocking rendering.
- Persist analytics data in PostgreSQL with enough detail to query PV, UV, country PV/UV, and page average dwell time by date range.
- Expose Medusa admin APIs and a Medusa Admin route for filtering, sorting, paginating, and deleting analytics logs.
- Keep implementation localized to a new Medusa module plus a small storefront tracking hook/component.

**Non-Goals:**
- Real-time streaming analytics, dashboards, or charting.
- Third-party analytics vendors, tag managers, or external queues.
- Backfilling historical analytics for traffic that happened before deployment.

## Decisions

### 1. Use a dedicated Medusa module with one analytics event table
We will add a new `site-analytics` module with a single event model storing `event_type`, `visitor_id`, `session_id`, `path`, `country_code`, `duration_seconds`, `occurred_at`, and request metadata. This keeps the change isolated from course/homepage modules and allows Medusa migrations to own schema updates. Aggregated metrics are computed in SQL/query logic instead of storing pre-aggregated tables, which reduces write-path complexity and keeps deletion behavior simple.

Alternative considered: storing page views and dwell events in separate tables. Rejected because it increases schema and service surface area without improving the required admin search/delete workflow.

### 2. Use first-party visitor/session identifiers and asynchronous browser delivery
The storefront will create a stable visitor ID in browser storage and a session ID per tab/session, then send `page_view` and `page_leave` events via `navigator.sendBeacon` with `fetch(..., { keepalive: true })` fallback. Country code will be sourced from the current route segment or existing region context so the client does not need an extra lookup.

Alternative considered: server-side logging only. Rejected because page dwell time cannot be measured accurately without browser lifecycle signals.

### 3. Expose admin-focused REST endpoints backed by module service queries
Admin APIs will support time-range filtering, country filtering, sortable fields, pagination, single delete, and bulk delete. Query responses will include both raw log rows and aggregate summaries needed by the admin module so the UI stays thin and the SQL stays centralized.

Alternative considered: fetching raw rows only and aggregating in the admin page. Rejected because it would shift heavy computation into the browser and complicate sorting/pagination correctness.

## Risks / Trade-offs

- [Beacon events can be dropped on abrupt browser termination] → Use `sendBeacon` first and `keepalive` fetch fallback; accept small analytics loss as a trade-off for non-blocking UX.
- [UV counting can drift if storage is cleared or users switch browsers] → Define UV explicitly as unique `visitor_id` per day and document the browser-scoped limitation.
- [Large analytics tables may slow queries] → Add indexes for occurred date, country, path, and visitor/day access patterns; constrain admin queries to paginated windows.
- [Manual deletes can affect aggregate reports] → Compute summaries from the current retained dataset and state that deletions are intentional data cleanup.

## Migration Plan

1. Add the new module model and generate a Medusa migration.
2. Store the reviewed PostgreSQL DDL summary in repo SQL/docs artifacts.
3. Apply the migration to the database environment before enabling admin/storefront code paths.
4. Deploy backend first, then storefront tracking, then verify admin queries and deletion flows.
5. Roll back by disabling storefront dispatch and reverting the module migration if needed.

## Open Questions

- Whether admin needs an aggregated summary card section in the first iteration or only filterable log tables plus summary totals returned by API.
- Whether internal/admin traffic should be excluded by IP or user agent in a later iteration.