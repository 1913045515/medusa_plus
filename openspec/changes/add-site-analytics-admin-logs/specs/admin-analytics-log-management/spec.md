## ADDED Requirements

### Requirement: Admin users must be able to search analytics logs
The system SHALL provide an admin-facing website log module that lists analytics records and supports filtering by time range and country. The list MUST support sortable fields and paginated results.

#### Scenario: Admin filters logs by date range and country
- **WHEN** an admin selects a start time, end time, and optional country filter
- **THEN** the module returns only matching analytics rows and associated summary metrics for that filter scope

#### Scenario: Admin sorts and paginates analytics rows
- **WHEN** an admin changes the sort field, sort direction, or page
- **THEN** the module returns the requested slice of analytics rows in the requested order

### Requirement: Admin users must be able to delete analytics logs
The system SHALL support deleting a single analytics row and deleting multiple selected analytics rows from the admin website log module.

#### Scenario: Admin deletes one analytics row
- **WHEN** an admin confirms deletion for a single row
- **THEN** that analytics record is removed from the database and no longer appears in subsequent queries

#### Scenario: Admin bulk deletes selected analytics rows
- **WHEN** an admin selects multiple rows and confirms bulk deletion
- **THEN** all selected analytics records are removed in one operation and the list refreshes to reflect the retained dataset

### Requirement: Admin API behavior must stay consistent with queryable analytics data
The system SHALL expose admin APIs that centralize filtering, sorting, pagination, summary calculation, single delete, and bulk delete behavior so the admin UI remains a thin client over backend-owned query logic.

#### Scenario: Admin UI requests paginated analytics data
- **WHEN** the admin module issues a query request with filters, sorting, and pagination parameters
- **THEN** the backend response includes rows, total count, current page information, and aggregate metric values for the same filter scope