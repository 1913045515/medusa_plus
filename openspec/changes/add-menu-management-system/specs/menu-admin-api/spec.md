## ADDED Requirements

### Requirement: List all menu items
Admin SHALL be able to retrieve all menu items via `GET /admin/menu-items`.

#### Scenario: Returns flat list with tree structure
- **WHEN** admin calls `GET /admin/menu-items`
- **THEN** server returns `{ menu_items: [...] }` with all items including parent-child relationships

### Requirement: Create menu item
Admin SHALL create a new menu item via `POST /admin/menu-items`.

#### Scenario: Create root item
- **WHEN** admin POSTs `{ menu_type, title, href, sort_order, is_visible }`
- **THEN** server returns the created item with HTTP 201

#### Scenario: Create child item
- **WHEN** admin POSTs with a valid `parent_id`
- **THEN** server creates the item as a child of the specified parent

### Requirement: Update menu item
Admin SHALL update a menu item via `PUT /admin/menu-items/:id`.

#### Scenario: Update title and href
- **WHEN** admin PUTs with `{ title, href }`
- **THEN** the item's title and href are updated and returned

### Requirement: Batch reorder menu items
Admin SHALL batch-update sort_order and parent_id via `POST /admin/menu-items/reorder`.

#### Scenario: Reorder items
- **WHEN** admin POSTs `{ items: [{id, parent_id, sort_order}] }`
- **THEN** all listed items are updated atomically and HTTP 200 is returned

### Requirement: Delete menu item
Admin SHALL delete a menu item via `DELETE /admin/menu-items/:id`. Deleting a parent SHALL also delete its children.

#### Scenario: Delete root item cascades
- **WHEN** admin deletes a root item that has children
- **THEN** all child items are also deleted
