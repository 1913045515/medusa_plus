## ADDED Requirements

### Requirement: Storefront account routes remain accessible with parallel slots
The storefront SHALL resolve account child routes without returning 404 when a user navigates directly to a nested account URL or refreshes the page.

#### Scenario: Direct access to addresses page
- **WHEN** a signed-in user opens `/us/account/addresses` directly
- **THEN** the storefront MUST render the account addresses experience instead of a 404 page

#### Scenario: Unmatched account slot falls back safely
- **WHEN** one parallel route slot under the account layout does not match the current URL
- **THEN** the storefront MUST use an explicit default slot component instead of failing the route

### Requirement: Admin core navigation remains available with local extensions
The Admin dashboard SHALL keep core routes such as products and settings accessible after local custom admin routes are added or updated.

#### Scenario: Product list remains reachable
- **WHEN** the Admin frontend is built with local route extensions present
- **THEN** navigating to `/app/products` MUST load the core products page instead of a 404 page

#### Scenario: Settings pages remain reachable
- **WHEN** the Admin frontend is built with local route extensions present
- **THEN** navigating to `/app/settings` and child settings pages MUST load the core settings experience instead of a 404 page