## Why

The platform currently lacks first-party traffic analytics for page views, daily visitors, country breakdowns, and average dwell time, which prevents the team from measuring traffic quality or operating content by region. This change is needed now because homepage and course content are already being managed in Medusa Admin, so analytics must be queryable in the same backend and admin surface.

## What Changes

- Add asynchronous storefront analytics collection for page visits and dwell-time events without blocking page rendering.
- Persist analytics events in PostgreSQL with reviewed DDL captured in repo scripts and applied through Medusa database changes.
- Add Medusa admin APIs for filtering analytics logs by time and country, sorting by supported fields, and paginating results.
- Add a Medusa Admin website log module for viewing analytics records and manually deleting single or multiple rows.
- Add aggregate metrics support for page PV, site daily PV, site UV, country daily PV/UV, and page average dwell time.

## Non-goals

- Introducing third-party analytics providers or client-side SDK dependencies.
- Building real-time dashboards or chart-heavy BI views beyond the required searchable admin log module.
- Reworking unrelated storefront routing, homepage editing, or checkout flows.

## Capabilities

### New Capabilities
- `site-analytics-tracking`: Collect and persist website visit and dwell-time analytics with country attribution and daily aggregation support.
- `admin-analytics-log-management`: Query, sort, paginate, and delete analytics logs from Medusa Admin.

### Modified Capabilities

- None.

## Impact

- Backend: `my-store/src/api`, `my-store/src/modules`, database migrations, and SQL DDL artifacts.
- Storefront: `my-store-storefront/src/app`, shared client utilities, and asynchronous analytics dispatch.
- Admin: `my-store/src/admin/routes` and related data hooks/components.
- Data/API: new analytics table(s), new admin endpoints, and derived metrics/query behavior.