## ADDED Requirements

### Requirement: SideMenu reads from database
The frontend `SideMenu` SHALL read menu items from `/store/menu-items?type=front` instead of using hardcoded values.

#### Scenario: Dynamic menu rendered
- **WHEN** user visits the storefront
- **THEN** SideMenu renders all `is_visible=true` front menu items from the database, in `sort_order` order, with children nested under parents

#### Scenario: Fallback when API unavailable
- **WHEN** the API call fails
- **THEN** SideMenu renders an empty menu list (graceful degradation, no error thrown)
