## ADDED Requirements

### Requirement: Storefront SHALL resolve site context from countryCode and locale
The storefront SHALL derive a site context from the current countryCode route segment and the selected locale, where countryCode determines region and site mapping, and locale determines content language.

#### Scenario: Resolve region and site from countryCode
- **WHEN** a user visits a storefront path under `/de/...`
- **THEN** the storefront resolves the active region from `de` and also resolves the corresponding site key used for site-specific content lookup

#### Scenario: Resolve language independently from countryCode
- **WHEN** a user is on site `de` and selects locale `en-US`
- **THEN** the storefront keeps the `de` site context while requesting English content where translations exist

### Requirement: Site switching SHALL update storefront operational context
The storefront site switcher SHALL update the active countryCode route, the cart region, and the site-specific content context in one action.

#### Scenario: Switch site from one countryCode to another
- **WHEN** a user switches from countryCode `us` to `de`
- **THEN** the storefront redirects to the `de` route, updates the cart region to the region mapped from `de`, and refreshes site-scoped content

#### Scenario: Preserve current path during site switch
- **WHEN** a user switches site while viewing `/us/courses/react-basics`
- **THEN** the storefront redirects to `/de/courses/react-basics` and re-resolves content and pricing under the `de` site context

### Requirement: Homepage and course storefront queries SHALL consume site context
Storefront data-fetching functions for homepage and courses SHALL use the active locale and resolved site context when requesting custom content from the backend.

#### Scenario: Homepage request includes site and locale context
- **WHEN** the homepage data layer requests published homepage content
- **THEN** the request includes enough context for the backend to resolve both the active site and active locale

#### Scenario: Course request includes locale context
- **WHEN** the course list or course detail data layer requests course content
- **THEN** the request includes the active locale so localized course fields can be returned with fallback behavior