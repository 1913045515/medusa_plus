## ADDED Requirements

### Requirement: Admin can manage multiple homepage configurations
The system SHALL provide an admin-managed homepage content collection that stores multiple homepage configurations, including draft and published versions with hero content, highlight cards, and featured course cards.

#### Scenario: Admin fetches homepage configuration list
- **WHEN** an authenticated admin requests the homepage content resource
- **THEN** the system returns the homepage configuration list and identifies the current active configuration

#### Scenario: Admin creates a new homepage draft
- **WHEN** an authenticated admin creates a homepage configuration with title and handle
- **THEN** the system SHALL create a new draft homepage record and return the saved content

#### Scenario: Admin updates homepage content
- **WHEN** an authenticated admin saves homepage content for an existing record
- **THEN** the system SHALL update that homepage content record and return the latest saved content

#### Scenario: Admin publishes a homepage configuration
- **WHEN** an authenticated admin publishes a homepage configuration
- **THEN** the system SHALL mark that record as published and active, and mark any previously active homepage configuration as inactive

### Requirement: Admin editor validates homepage content inputs
The admin homepage editor MUST validate the required homepage fields before submitting changes.

#### Scenario: Missing required hero title
- **WHEN** an admin attempts to save homepage content without a hero title
- **THEN** the admin editor SHALL block submission and show a validation error

#### Scenario: Missing required primary CTA link
- **WHEN** an admin attempts to save homepage content without a primary call-to-action link
- **THEN** the admin editor SHALL block submission and show a validation error

### Requirement: Storefront renders homepage from published content
The storefront homepage SHALL fetch the published homepage content from the store API and render the hero, highlight cards, and featured course cards from that payload.

#### Scenario: Published homepage content exists
- **WHEN** the storefront homepage loads and the store API returns homepage content
- **THEN** the page SHALL render the returned hero, highlight cards, and featured course cards

#### Scenario: Published homepage content is unavailable
- **WHEN** the storefront homepage loads and the store API fails or returns no homepage content
- **THEN** the page SHALL render a safe default homepage configuration instead of failing

### Requirement: Storefront homepage content endpoint is read-only for public clients
The public homepage content endpoint MUST expose only published homepage display data needed by the storefront and MUST NOT allow anonymous writes.

#### Scenario: Store client requests homepage content
- **WHEN** a public storefront client requests homepage content
- **THEN** the system SHALL return only the published homepage display payload

#### Scenario: Anonymous client attempts to write homepage content
- **WHEN** an unauthenticated public client attempts to create or update homepage content through a store route
- **THEN** the system SHALL reject the request