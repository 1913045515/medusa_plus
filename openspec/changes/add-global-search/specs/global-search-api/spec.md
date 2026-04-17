## ADDED Requirements

### Requirement: Search endpoint accepts keyword query
The backend SHALL expose `GET /store/search?q=<keyword>&limit=<n>` as a public store route. Query param `q` is required. `limit` defaults to 5 per type.

#### Scenario: Valid keyword returns results
- **WHEN** client sends `GET /store/search?q=python`
- **THEN** server returns HTTP 200 with `{ blogs, products, courses, total }` where each array contains at most `limit` items matching the keyword

#### Scenario: Empty keyword returns empty results
- **WHEN** client sends `GET /store/search?q=`
- **THEN** server returns HTTP 200 with all arrays empty and `total: 0`

### Requirement: Search queries blog_post, product, course in parallel
The handler SHALL query all three tables concurrently using `Promise.all`.

#### Scenario: Parallel execution
- **WHEN** a search request is received
- **THEN** all three database queries start simultaneously and the response is returned after all complete

### Requirement: Blog search matches title and excerpt
The blog query SHALL use `ILIKE '%keyword%'` against `title` and `excerpt` columns of `blog_post`. Only `status = 'published'` records are returned.

#### Scenario: Keyword matches blog title
- **WHEN** keyword appears in a published blog post title
- **THEN** that blog post is included in `blogs` array with fields `{ id, title, slug, excerpt, cover_image }`

#### Scenario: Draft blogs excluded
- **WHEN** keyword matches a blog post with `status = 'draft'`
- **THEN** that blog post is NOT included in results

### Requirement: Product search matches title and description
The product query SHALL use `ILIKE '%keyword%'` against `product.title` and `product.description`. Only `status = 'published'` products are returned.

#### Scenario: Keyword matches product title
- **WHEN** keyword appears in a published product title
- **THEN** that product is included in `products` array with fields `{ id, title, handle, thumbnail, description }`

### Requirement: Course search matches title and description
The course query SHALL use `ILIKE '%keyword%'` against `title` and `description` of `course`. Only `status = 'published'` courses are returned.

#### Scenario: Keyword matches course title
- **WHEN** keyword appears in a published course title
- **THEN** that course is included in `courses` array with fields `{ id, title, handle, description, thumbnail_url }`

### Requirement: Total count reflects combined results
The `total` field SHALL equal `blogs.length + products.length + courses.length`.

#### Scenario: Total calculation
- **WHEN** search returns 2 blogs, 3 products, 1 course
- **THEN** `total` equals 6
