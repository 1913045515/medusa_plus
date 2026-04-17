## ADDED Requirements

### Requirement: Menu management page in Admin
Admin SHALL have a route at `/a/menu-items` showing the menu management interface.

#### Scenario: Page loads with menu list
- **WHEN** admin navigates to the menu management page
- **THEN** two tabs are shown: "前台菜单" and "Admin菜单", each listing items with drag handles

### Requirement: Drag-to-reorder same level
Admin SHALL reorder items of the same level by dragging.

#### Scenario: Same-level drag
- **WHEN** admin drags item A above item B within the same parent
- **THEN** A's sort_order becomes lower than B's, and the UI updates immediately

### Requirement: Drag to change hierarchy level
Admin SHALL drag a root item onto another root item to make it a child.

#### Scenario: Promote to child
- **WHEN** admin drags a root item and drops it inside another root item's children area
- **THEN** the dragged item becomes a child of the target, with updated `parent_id` and `sort_order`

#### Scenario: Demote child to root
- **WHEN** admin drags a child item to the root-level drop zone
- **THEN** the item's `parent_id` is set to null and it becomes a root item

### Requirement: Auto-save on drop
After any drag-and-drop completes, the system SHALL automatically call `POST /admin/menu-items/reorder` with the new order.

#### Scenario: Auto-save after drag
- **WHEN** admin releases the dragged item
- **THEN** the reorder API is called within 100ms and a success toast is shown

### Requirement: Add, edit, delete from UI
Admin SHALL be able to add new items, edit title/href/visibility, and delete items from the same page.

#### Scenario: Add new item
- **WHEN** admin clicks "+ 新增菜单项" and fills the form
- **THEN** a new item appears in the list at the bottom

#### Scenario: Delete with child cascade warning
- **WHEN** admin deletes a root item with children
- **THEN** a confirmation dialog warns that children will also be deleted
