## ADDED Requirements

### Requirement: Search icon in navigation bar
The Nav component SHALL render a search icon button on the right side of the navigation bar.

#### Scenario: Icon is visible
- **WHEN** user visits any page
- **THEN** a search (magnifying glass) icon is visible in the navigation bar right section

### Requirement: Click icon opens search modal
Clicking the search icon SHALL open a full-screen search overlay (modal).

#### Scenario: Modal opens on click
- **WHEN** user clicks the search icon
- **THEN** a search modal overlays the page with a focused text input

#### Scenario: Modal closes on Esc
- **WHEN** the search modal is open and user presses Escape key
- **THEN** the modal closes and the page content is restored

#### Scenario: Modal closes on backdrop click
- **WHEN** user clicks outside the search input area
- **THEN** the modal closes

### Requirement: Input triggers search with debounce
The search input SHALL send a request to `/store/search` after 300ms of inactivity. Queries shorter than 2 characters SHALL NOT trigger a request.

#### Scenario: Short query suppressed
- **WHEN** user types a single character
- **THEN** no API request is made

#### Scenario: Debounced request
- **WHEN** user types "python" and pauses for 300ms
- **THEN** exactly one request is sent to `/store/search?q=python&limit=5`

### Requirement: Results displayed in grouped sections
The results SHALL be displayed in three labeled sections: 博客、商品、课程.

#### Scenario: Results shown by group
- **WHEN** search returns blogs, products, and courses
- **THEN** each group is rendered with its label and items listed below

#### Scenario: Empty group hidden
- **WHEN** search returns 0 products but has blogs and courses
- **THEN** the 商品 section is not rendered

#### Scenario: Click result navigates to detail page
- **WHEN** user clicks a blog result
- **THEN** user is navigated to `/blog/<slug>`
- **WHEN** user clicks a product result
- **THEN** user is navigated to `/products/<handle>`
- **WHEN** user clicks a course result
- **THEN** user is navigated to `/courses/<handle>`

### Requirement: Loading and empty states
The search UI SHALL show a loading indicator while fetching and an empty-state message when no results are found.

#### Scenario: Loading state
- **WHEN** request is in-flight
- **THEN** a loading spinner or skeleton is shown

#### Scenario: No results
- **WHEN** search returns empty arrays
- **THEN** message "未找到相关内容" is displayed
