## ADDED Requirements

### Requirement: Storefront media responses use signed S3 URLs
The system SHALL resolve course thumbnails, lesson thumbnails, and lesson video playback URLs to temporary signed S3 URLs before returning them to storefront clients, and it MUST NOT expose permanent S3 URLs through public store APIs.

#### Scenario: Render a course thumbnail from store data
- **WHEN** the storefront requests a course list or course detail that includes a course thumbnail stored in S3
- **THEN** the store API returns a temporary signed thumbnail URL that the storefront can render without learning the permanent S3 address

#### Scenario: Render a lesson thumbnail from store data
- **WHEN** the storefront requests the lessons for a course and a lesson has a thumbnail stored in S3
- **THEN** the store API returns a temporary signed lesson thumbnail URL instead of the permanent storage URL

### Requirement: Lesson play responses include two-hour authorization data
The system SHALL return lesson video playback authorization using a temporary signed URL whose default validity is 2 hours, and the play response MUST include expiry information that the storefront can use to detect stale authorizations.

#### Scenario: Successful video play authorization
- **WHEN** an entitled customer requests `GET /store/lessons/:id/play` for a lesson with an S3-hosted video
- **THEN** the response includes a signed video URL and expiry metadata representing a 2-hour authorization window

#### Scenario: Non-entitled customers remain blocked
- **WHEN** a customer without access requests `GET /store/lessons/:id/play`
- **THEN** the system preserves the existing 401 or 403 authorization behavior and does not issue a signed video URL

### Requirement: Storefront can recover from expired video authorization
The storefront SHALL detect expired or rejected signed lesson video URLs and MUST provide a visible refresh action that requests a new authorization from the backend.

#### Scenario: Video authorization expires during a long visit
- **WHEN** a customer remains on the lesson page beyond the signed URL validity window and playback fails because the authorization expired
- **THEN** the lesson player shows a permission-expired state and offers a refresh action that fetches a new signed video URL

#### Scenario: Refreshing video authorization succeeds
- **WHEN** the customer activates the refresh action after a signed URL expires
- **THEN** the storefront requests a new play authorization and resumes playback using the newly issued signed URL

### Requirement: Storefront minimizes direct video URL exposure
The storefront MUST avoid exposing permanent video addresses, MUST NOT render an explicit copy-link action for lesson videos, and MUST disable download-oriented player affordances where the browser allows.

#### Scenario: Lesson player renders a protected video
- **WHEN** the storefront renders a lesson video player for an authorized user
- **THEN** the player consumes only the temporary signed URL in runtime state and does not show the permanent S3 address anywhere in the page UI

#### Scenario: Browser UI is hardened for direct downloads
- **WHEN** a lesson video is presented in the storefront player
- **THEN** the player configuration disables native download controls and suppresses application-level copy-link interactions for that lesson video