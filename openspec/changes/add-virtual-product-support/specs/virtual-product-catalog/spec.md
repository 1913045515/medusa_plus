## ADDED Requirements

### Requirement: Admin can configure virtual product attributes using stable codes
The system SHALL allow admins to mark a product as virtual and persist virtual product data using stable codes instead of localized labels.

#### Scenario: Admin saves a non-virtual product
- **WHEN** an admin leaves the product as non-virtual
- **THEN** the system MUST persist `is_virtual=false`
- **THEN** the system MUST clear `virtual_product_type`, download address, and course binding fields from the virtual product payload

#### Scenario: Admin saves a resource virtual product
- **WHEN** an admin enables virtual product mode, selects type `resource`, and submits the product
- **THEN** the system MUST require a non-empty download address before saving
- **THEN** the system MUST persist `virtual_product_type=resource` as code data

#### Scenario: Admin saves a course virtual product
- **WHEN** an admin enables virtual product mode, selects type `course`, and submits the product
- **THEN** the system MUST require a selected course before saving
- **THEN** the system MUST persist `virtual_product_type=course` as code data

### Requirement: Virtual product type labels are translated at display time
The system SHALL store virtual product types as codes in product data and translate those codes into localized labels in admin and storefront interfaces.

#### Scenario: Admin views a product in Chinese
- **WHEN** the current locale is Chinese and the product type code is `resource`
- **THEN** the UI MUST render the Chinese label for that code
- **THEN** the stored product data MUST remain `resource`

#### Scenario: Admin views the same product in English
- **WHEN** the current locale is English and the product type code is `course`
- **THEN** the UI MUST render the English label for that code
- **THEN** the stored product data MUST remain `course`

### Requirement: Course binding supports product-led linkage
The system SHALL allow course linkage to be created from the product side while keeping the course-side product selection optional.

#### Scenario: Product binds to a course
- **WHEN** an admin saves a product with virtual type `course` and selects a course
- **THEN** the system MUST save the selected course identifier on the product
- **THEN** the system MUST sync the related course so that it points back to the product

#### Scenario: Course editor leaves product empty
- **WHEN** an admin creates or edits a course without selecting a product
- **THEN** the system MUST allow the save to succeed
- **THEN** the course MUST remain usable for later binding from the product side