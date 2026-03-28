## ADDED Requirements

### Requirement: Admin can duplicate homepage templates
The system SHALL allow administrators to duplicate an existing homepage template record into a new draft record without affecting the currently active homepage.

#### Scenario: Duplicate an existing template
- **WHEN** an administrator triggers copy on an existing homepage template record
- **THEN** the system creates a new draft homepage template with copied template content and a unique derived title and handle

#### Scenario: Copy does not replace active template
- **WHEN** an administrator copies the currently active homepage template
- **THEN** the system keeps the original template as the active published homepage and creates the duplicate as an inactive draft

### Requirement: Admin can delete non-active homepage templates
The system SHALL allow administrators to delete homepage template records that are not currently active and MUST reject deletion of the active homepage template.

#### Scenario: Delete a draft template
- **WHEN** an administrator deletes a non-active homepage template record
- **THEN** the record is removed from the admin list and is no longer available for future homepage operations

#### Scenario: Reject deleting the active template
- **WHEN** an administrator attempts to delete the current active homepage template
- **THEN** the system rejects the request and returns an error explaining that the active template must be unpublished or replaced before deletion

### Requirement: Admin UI exposes copy and delete actions with clear feedback
The admin homepage template management UI SHALL provide copy and delete actions for template records and MUST show success or failure feedback for each action.

#### Scenario: Copy feedback in admin
- **WHEN** an administrator successfully copies a homepage template
- **THEN** the UI shows a success message and selects or refreshes to the new copied record

#### Scenario: Delete confirmation in admin
- **WHEN** an administrator triggers delete for a homepage template
- **THEN** the UI asks for confirmation before submitting the delete request