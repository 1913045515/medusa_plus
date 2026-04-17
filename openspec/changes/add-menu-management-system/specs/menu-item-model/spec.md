## ADDED Requirements

### Requirement: MenuItem model with two-level hierarchy
The system SHALL define a `MenuItem` model with fields: id, menu_type, title, href, icon, parent_id, sort_order, is_visible, target.

#### Scenario: Root menu item
- **WHEN** a MenuItem is created with `parent_id = null`
- **THEN** it is treated as a first-level (root) menu item

#### Scenario: Child menu item
- **WHEN** a MenuItem is created with a valid `parent_id` pointing to a root item
- **THEN** it is treated as a second-level menu item

#### Scenario: Invalid nesting rejected
- **WHEN** a MenuItem is created with `parent_id` pointing to an item that already has a parent
- **THEN** the server SHALL return a validation error

### Requirement: Migration creates menu_item table
A Medusa migration SHALL create the `menu_item` table with all required columns.

#### Scenario: Migration runs successfully
- **WHEN** `npx medusa db:migrate` is executed
- **THEN** the `menu_item` table exists with all columns and constraints
