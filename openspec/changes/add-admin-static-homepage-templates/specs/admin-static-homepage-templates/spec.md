## ADDED Requirements

### Requirement: Admin can manage static homepage templates
The system SHALL allow administrators to create multiple homepage template records, edit their base metadata, save draft template content, and publish one record as the active storefront homepage.

#### Scenario: Create a draft template
- **WHEN** an administrator submits a new homepage template with title and handle
- **THEN** the system creates a draft record with static template mode and default empty template content

#### Scenario: Save template source
- **WHEN** an administrator saves HTML and CSS for an existing homepage template
- **THEN** the system persists the source on that record without changing the currently active published template unless a publish action is requested

#### Scenario: Publish a template
- **WHEN** an administrator publishes a homepage template record
- **THEN** the system marks that record as the active published homepage and clears the active flag from any previously active record

### Requirement: Static homepage templates are stored and served as controlled content
The system SHALL store homepage templates in a dedicated static template mode and MUST reject or sanitize executable content that would run arbitrary JavaScript in the storefront.

#### Scenario: Reject executable template content
- **WHEN** an administrator saves template source containing script tags, inline event handlers, or javascript URLs
- **THEN** the system removes or rejects the executable content before it becomes publishable storefront output

#### Scenario: Return published template content to storefront
- **WHEN** the storefront requests homepage content and an active published static template exists
- **THEN** the system returns the published template mode and sanitized template content needed for rendering

### Requirement: Storefront renders published templates with fallback behavior
The storefront SHALL render the active published static homepage template when valid template content is available and MUST fall back to the default homepage experience when published template content is unavailable or unusable.

#### Scenario: Render published static template
- **WHEN** the storefront receives a published homepage record in static template mode with valid template content
- **THEN** the homepage renders the template output instead of the legacy structured homepage sections

#### Scenario: Fall back on missing template content
- **WHEN** the storefront cannot load homepage content or the published static template content is empty after validation
- **THEN** the storefront renders the built-in default homepage content instead of a blank page