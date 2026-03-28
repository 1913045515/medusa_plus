## ADDED Requirements

### Requirement: Course content SHALL support locale-aware fields
The system SHALL allow each course and lesson to store localized title and description content by locale while preserving an existing default-language representation for backward compatibility.

#### Scenario: Read localized course content
- **WHEN** a storefront or admin request asks for a course using locale `zh-CN` and localized course content exists for `zh-CN`
- **THEN** the system returns the localized title and description for `zh-CN`

#### Scenario: Fallback to default course content
- **WHEN** a request asks for locale `fr-FR` and no localized course content exists for `fr-FR`
- **THEN** the system returns the default title and description stored on the course

### Requirement: Lesson content SHALL support locale-aware fields
The system SHALL allow each lesson to store localized title and description content by locale and SHALL apply the same fallback rules as courses.

#### Scenario: Read localized lesson content
- **WHEN** the storefront requests a lesson list for locale `en-US` and the lessons have `en-US` translations
- **THEN** the lesson list returns localized lesson title and description values

#### Scenario: Preserve non-translatable lesson fields
- **WHEN** localized lesson content is returned
- **THEN** episode number, duration, free/paid status, thumbnail, video URL visibility rules, and publish status remain unchanged by locale selection

### Requirement: Admin course management SHALL edit localized content by selected locale
The admin course and lesson editors SHALL let operators choose a content locale and save localized title and description values for that locale without overwriting other locale variants.

#### Scenario: Save one locale without overwriting another
- **WHEN** an operator edits a course in locale `zh-CN` and saves new text
- **THEN** previously saved `en-US` content for the same course remains unchanged

#### Scenario: Create content with default locale only
- **WHEN** an operator creates a course or lesson without providing additional locale variants
- **THEN** the system stores the default-language fields and serves them as the fallback content for all locales without translations