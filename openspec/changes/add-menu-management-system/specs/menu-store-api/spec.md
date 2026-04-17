## ADDED Requirements

### Requirement: Public endpoint returns menu tree
The system SHALL expose `GET /store/menu-items?type=front` as a public (no-auth) endpoint returning the tree-structured menu for the given type.

#### Scenario: Returns front menu tree
- **WHEN** client calls `GET /store/menu-items?type=front`
- **THEN** server returns `{ menu_items: [{ ...root, children: [...] }] }` only for `is_visible=true` items, sorted by `sort_order`

#### Scenario: Only visible items returned
- **WHEN** a menu item has `is_visible=false`
- **THEN** it is excluded from the public response
