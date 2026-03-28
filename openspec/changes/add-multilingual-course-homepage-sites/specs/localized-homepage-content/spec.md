## ADDED Requirements

### Requirement: Homepage content SHALL support localized variants
The system SHALL allow homepage content to store localized structured content and localized static template content by locale.

#### Scenario: Read localized structured homepage content
- **WHEN** the storefront requests structured homepage content for locale `zh-CN`
- **THEN** hero text, highlight text, and featured course text are returned from the `zh-CN` variant when available

#### Scenario: Fallback to default homepage content
- **WHEN** the storefront requests locale `de-DE` and no `de-DE` homepage variant exists
- **THEN** the system returns the default homepage content for the selected site

### Requirement: Homepage publication SHALL be site-specific
The system SHALL allow homepage records to be published per site so that each site resolves its own active homepage independently.

#### Scenario: Publish homepage for one site
- **WHEN** an operator publishes homepage A for site `us`
- **THEN** homepage A becomes the active published homepage only for site `us`

#### Scenario: Keep another site active homepage unchanged
- **WHEN** homepage A is published for site `us` and site `de` already has homepage B active
- **THEN** site `de` continues returning homepage B until a different homepage is published for site `de`

### Requirement: Admin homepage management SHALL edit localized content by selected locale and site
The admin homepage editor SHALL let operators choose both a site and a content locale while editing and saving homepage content.

#### Scenario: Save localized homepage copy for one locale
- **WHEN** an operator edits homepage content for site `us` in locale `en-US`
- **THEN** the saved changes update only the `us` site's `en-US` content variant

#### Scenario: Save static template per locale
- **WHEN** an operator edits static homepage HTML for locale `zh-CN`
- **THEN** the localized HTML is stored separately from the default template and retrieved only for `zh-CN`