## ADDED Requirements

### Requirement: Storefront analytics events must be collected asynchronously
The system SHALL collect website analytics from the storefront without blocking page render or route transitions. It MUST emit a page view event when a page becomes active and MUST emit a dwell-time event when the user leaves the page, backgrounds the tab, or navigates away.

#### Scenario: Page view is captured without delaying navigation
- **WHEN** a shopper opens any storefront page
- **THEN** the storefront sends the analytics payload asynchronously using a non-blocking browser delivery mechanism

#### Scenario: Dwell time is recorded when the page session ends
- **WHEN** the shopper leaves the current page or the document becomes hidden
- **THEN** the storefront sends a dwell-time event that includes the visited page and measured duration

### Requirement: Analytics events must be persisted with country and visitor identity
The system SHALL persist analytics events in PostgreSQL with a reviewed DDL definition stored in the repository. Each persisted event MUST include event type, page path, event timestamp, country code, and a first-party visitor identifier so daily PV and UV can be derived.

#### Scenario: Database schema is introduced for analytics persistence
- **WHEN** the analytics feature is implemented
- **THEN** the repository contains the corresponding DDL summary and the Medusa migration applies the schema to the database

#### Scenario: Country-specific metrics can be derived from stored events
- **WHEN** a page view or dwell-time event is saved
- **THEN** the record contains a country code that allows per-country daily PV and UV queries

### Requirement: Analytics queries must support required traffic metrics
The system SHALL support computing page PV, site daily PV, site daily UV, country daily PV, country daily UV, and page average dwell time for a requested date range from persisted analytics data.

#### Scenario: Daily UV counts one visitor once per day
- **WHEN** the same visitor triggers multiple page views on the same day
- **THEN** daily UV metrics count that visitor only once for that day

#### Scenario: Average dwell time is based on recorded dwell events
- **WHEN** dwell-time events exist for a page within the requested date range
- **THEN** the analytics query returns the arithmetic mean duration for that page