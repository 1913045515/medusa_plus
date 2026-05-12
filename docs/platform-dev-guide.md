# AI Cross Stand Platform Guide

> A practical overview of what the platform does, how the admin and storefront work together, and how to develop and deploy the system with confidence.

## Overview

AI Cross Stand is a headless commerce platform built for selling digital-first products, including source code packages, learning resources, and structured video courses. It combines a Medusa-based admin system with a Next.js storefront, giving operators a flexible back office while keeping the customer-facing experience fast, modern, and SEO-friendly.

At a high level, the platform is split into two major applications:

- The admin app handles content operations, product setup, course management, file delivery, store settings, and internal workflows.
- The storefront handles discovery, product presentation, checkout, gated digital delivery, customer accounts, and post-purchase access.

Instead of acting like a generic template storefront, the platform is designed for businesses that need to sell both physical goods and digital products in the same system, while also publishing educational and marketing content around those products.

---

## 1. Feature Breakdown

### 1.1 Commerce and Product Management

The core commerce layer supports standard catalog operations such as product creation, pricing, variants, media, collections, and category organization. On top of that baseline, the platform adds a digital-product model that is especially useful for software businesses, education brands, and creator-led commerce.

Key capabilities include:

- Full product management from the admin side, including pricing, images, variants, and publishing state.
- Support for both physical and virtual products in the same catalog.
- Dedicated virtual-product settings that allow a product to be treated as either a downloadable resource or a course-linked product.
- Product detail pages with rich content blocks, custom media ordering, and tailored messaging depending on product type.
- Category-based browsing and storefront sorting, making product discovery feel more complete and easier to navigate.

For virtual products, the storefront experience is intentionally different. Instead of showing physical-shipping language, the product page can present instant digital delivery messaging, access expectations, and post-purchase guidance that better matches how U.S. customers evaluate software and learning products.

### 1.2 Course Sales and Video Learning

The platform includes a built-in course model that turns products into structured learning experiences. This is useful when a product is more than a file download and needs ongoing instructional value.

Core course features include:

- Course creation and management from the admin panel.
- Episode-based lesson organization with titles, sequence numbers, durations, and media references.
- Free-preview support for selected lessons before purchase.
- Purchase-based access control that unlocks protected course content after checkout.
- Course-aware product linking, so a storefront product can serve as the commercial entry point for a learning experience.

This setup works well for source code products that also include guided education, implementation walkthroughs, or premium onboarding material.

### 1.3 Blog and Content Publishing

The platform is not limited to transactions. It also includes a structured content system so teams can publish educational, promotional, and SEO-focused content without relying on a separate CMS.

Blog and content features include:

- Rich-text blog editing for long-form publishing.
- Category and tag management for content organization.
- Access control support for audience-based visibility.
- Shared media handling for blog images and embedded assets.
- Blog listing, article detail, category pages, and tag pages on the storefront.

This matters because the storefront can support the full funnel, not just the purchase step. Visitors can discover a product through blog content, learn from supporting articles, and then move naturally into a purchase flow.

### 1.4 Custom Pages and Homepage Content

The admin side also supports general content management beyond the blog. Teams can create static or rich-text pages for standard site sections such as About, Contact, Privacy, Terms, and campaign landing pages.

Homepage content is configurable as well, which makes it possible to update banners, featured sections, or promotional messaging without shipping code changes for every small content revision.

### 1.5 Secure File Delivery and Asset Management

Digital fulfillment depends on reliable file handling. The platform includes a dedicated file-asset system so teams can manage downloadable content from the admin interface instead of pushing files around manually.

Notable capabilities include:

- Centralized asset management for uploaded files.
- File metadata visibility, including format and size.
- Search and pagination for larger asset libraries.
- Secure download workflows for digital products.
- Signed or time-limited delivery patterns for protected assets.

This makes the platform especially useful for distributing source code bundles, documentation packs, templates, or premium downloads.

### 1.6 Customer Accounts and Access Control

The storefront includes the account features customers expect from a modern commerce site, but with extra attention to digital ownership and gated access.

Customer-facing account features include:

- Email-based sign-up and sign-in.
- Password reset flows.
- Order history and account management.
- Region-aware storefront routing.
- Auth-aware access control for protected resources such as tickets, course content, or post-purchase downloads.

Because the platform mixes commerce with content and education, authentication is not just about checkout. It also governs what customers can read, watch, and download after purchase.

### 1.7 Cart, Checkout, and Payments

On the commerce side, the platform supports the expected storefront purchasing journey from browsing through payment confirmation.

Checkout-related capabilities include:

- Standard cart management.
- Medusa-based checkout workflows.
- Payment integration support, including PayPal.
- Configurable checkout fields from the admin side.
- Order views for both administrators and customers.
- Virtual-order handling for digital fulfillment scenarios.

That flexibility is important when the business model includes both traditional product sales and instant digital access.

### 1.8 Support Tickets and Customer Service Workflows

The system includes a customer support ticket flow that lets authenticated users submit requests from the storefront while giving internal teams a structured way to review and respond in the admin area.

This is especially useful for software and course businesses, where pre-sales questions, access issues, and implementation support often continue after checkout.

### 1.9 Navigation, Store Settings, and Analytics

The admin application also includes tools that support day-to-day operation of the site itself:

- Navigation menu management.
- Store-wide settings management.
- Analytics event collection for site activity.
- Email-proxy and SMTP management for outbound communications.

Together, these features reduce the number of external systems required to operate the site.

### 1.10 Admin Localization Support

The admin interface supports localization for custom pages and UI extensions. That makes it easier for internal teams to work in their preferred language while keeping the storefront experience aligned with the brand’s target market.

---

## 2. Tech Stack

### 2.1 Backend Application

The backend lives in the Medusa application and acts as the operational core of the platform.

Main technologies:

| Layer | Technology |
|------|------------|
| Commerce backend | Medusa v2 |
| Language | TypeScript |
| Runtime | Node.js |
| Database | PostgreSQL |
| Cache and queue support | Redis |
| API documentation | OpenAPI with Redocly |
| Testing | Jest |
| File and media integration | S3-compatible workflows and file services |

The backend architecture is intentionally modular. Custom business logic is implemented in isolated modules, while API extensions are organized by route. This makes the codebase easier to maintain as the platform grows.

Important backend patterns include:

- File-based API routing for admin and store endpoints.
- Custom modules for blog, course, tickets, file assets, product detail extensions, analytics, and virtual-product behavior.
- Workflow orchestration for multi-step operations.
- Event subscribers for asynchronous business actions.
- Admin UI extensions that live inside the same backend repository.

### 2.2 Storefront Application

The storefront is built with Next.js and is optimized for server-rendered commerce, localized routing, and modular UI composition.

Main technologies:

| Layer | Technology |
|------|------------|
| Frontend framework | Next.js 15 |
| UI library | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Component system | Medusa UI |
| API client | Medusa JS SDK |
| End-to-end testing | Playwright |

Architecturally, the storefront leans on:

- App Router with server components where appropriate.
- Region-based routing.
- A dedicated data layer for server-side fetching and shared business logic.
- Modular page construction for products, store listing pages, account flows, blog pages, and checkout.

### 2.3 Admin Experience

The admin layer is not a separate product stitched on later. It is part of the operational model of the platform.

Primary technologies include:

| Area | Technology |
|------|------------|
| Admin extension framework | Medusa Admin SDK |
| UI components | Medusa UI |
| Localization | react-i18next |
| Rich-text editing | TipTap |
| Interactive ordering | dnd-kit |

This allows the team to build business-specific interfaces for content operations, store settings, course management, and digital-product workflows without leaving the admin environment.

---

## 3. Development Workflow

### 3.1 Local Development Setup

The local setup is designed to keep infrastructure simple. The recommended workflow is to run the supporting services in containers and run the applications directly in development mode.

Typical local prerequisites:

- Node.js
- Docker and Docker Compose
- PostgreSQL and Redis access through the local container setup
- A working package manager environment for both apps

The usual development flow looks like this:

1. Start local infrastructure services.
2. Install backend dependencies and run database migrations.
3. Start the Medusa backend in development mode.
4. Install storefront dependencies and start the Next.js app.
5. Sign in to the admin area and configure content, products, or settings as needed.

### 3.2 Suggested Local Startup Sequence

Use the infrastructure compose file to start PostgreSQL and Redis locally:

```bash
docker compose -f docker-compose.dev.yml up -d
```

Start the backend:

```bash
cd my-store
npm install
npx medusa db:migrate
npm run dev
```

If the project needs initial data, seed it after migrations:

```bash
npm run seed
```

Start the storefront in a separate terminal:

```bash
cd my-store-storefront
npm install
npm run dev
```

The admin UI is served from the backend application, so it becomes available when the backend is running.

### 3.3 Admin and Storefront Development Practices

The codebase supports a clean separation of concerns:

- Admin routes and widgets are used for internal tooling and editorial workflows.
- Store APIs are used for customer-facing data delivery.
- Storefront modules keep presentation logic grouped by feature.
- Custom backend modules isolate business rules that would otherwise leak across the codebase.

When adding new functionality, the most reliable approach is usually:

1. Model the business logic in a backend module.
2. Expose the required admin or storefront API endpoints.
3. Extend the admin interface if internal users need new controls.
4. Extend the storefront if customers need a new buying or content experience.
5. Cover the change with unit, integration, or end-to-end tests as appropriate.

### 3.4 Testing and Debugging

The platform supports multiple levels of validation.

Backend testing options include:

```bash
cd my-store
npm run test:unit
npm run test:integration:http
```

Storefront end-to-end testing is handled with Playwright:

```bash
cd my-store-storefront
npm run test:e2e
```

For interactive debugging:

```bash
npm run test:e2e:ui
```

This layered testing approach is useful because many of the platform’s most important behaviors span multiple surfaces, such as checkout, digital delivery, course access, and authenticated storefront flows.

### 3.5 API Documentation During Development

OpenAPI specs are part of the backend workflow, which helps teams review and validate custom endpoints as the system evolves.

Typical commands:

```bash
cd my-store
npm run spec:preview:store
npm run spec:preview:admin
npm run spec:bundle
```

---

## 4. Deployment Workflow

### 4.1 Production Architecture

The platform is designed to be deployed as a multi-service application. In production, the most common setup includes:

- A reverse proxy layer.
- The Medusa backend and admin application.
- The Next.js storefront.
- PostgreSQL for persistent data.
- Redis for caching, queue support, and related backend needs.
- Shared storage or a file-delivery layer for uploaded assets.

This architecture keeps operational responsibilities clear and makes it easier to scale the storefront and backend independently if traffic grows.

### 4.2 Container-Based Deployment

The repository includes Docker-based deployment assets so the system can be packaged and run in a repeatable way across environments.

Typical deployment steps:

1. Build the backend image.
2. Build the storefront image.
3. Prepare environment variables for the target environment.
4. Start the service stack with the production compose file.
5. Run database migrations.
6. Create or restore the required operational data.
7. Verify health checks and application access.

Example build commands:

```bash
docker build -t my-store:latest ./my-store
docker build -t my-store-storefront:latest ./my-store-storefront
```

Example startup pattern:

```bash
cd deploy
docker compose --env-file ../.env -f docker-compose.yml up -d
```

### 4.3 Environment and Secrets Strategy

For security and portability, environment-specific values should be injected at deploy time rather than hard-coded in the repository.

That typically includes:

- Database connection settings.
- Redis connection settings.
- Authentication secrets.
- Cross-origin settings.
- Payment-provider credentials.
- File-storage credentials.
- Revalidation or cache-invalidation secrets.

The important operational principle is to keep development, staging, and production values separated while preserving the same deployment structure across environments.

### 4.4 Database and Application Initialization

After the containers are running, the backend should apply schema updates before the system is opened to traffic.

Typical initialization tasks include:

- Running migrations.
- Seeding baseline data when needed.
- Creating the first admin user.
- Verifying that upload storage and content paths are accessible.

### 4.5 Reverse Proxy and Static Asset Delivery

The deployment setup assumes a reverse proxy in front of the application services. In practice, this layer is responsible for:

- TLS termination.
- Request routing.
- Static asset delivery.
- Compression and network-level optimization.

For file-heavy platforms, serving uploaded assets efficiently is especially important because course media, blog images, and downloadables can create a very different traffic profile from a standard catalog storefront.

### 4.6 Ongoing Updates and Operations

Once the platform is in production, the update process is straightforward:

1. Pull the latest code.
2. Rebuild the affected services.
3. Restart the updated containers.
4. Run migrations if the release includes schema changes.
5. Perform smoke tests on admin, storefront, and checkout.

This workflow supports steady iteration without forcing the team into a complicated release process.

### 4.7 Backup and Recovery

Any production rollout should include a backup plan for both application data and uploaded assets.

At a minimum, the operations model should cover:

- Scheduled database backups.
- Asset-storage backups or durable object storage.
- Recovery verification.
- Health checks for the backend, storefront, and infrastructure services.

For a platform that sells digital goods, backups are not just a compliance concern. They are also part of customer trust, because purchased access and protected content need to remain available even after operational incidents.

---

## Closing Notes

What makes this platform valuable is not just that it can sell products. It brings together commerce, digital delivery, structured learning, content publishing, and internal operations in one cohesive system.

That combination makes it a strong fit for businesses that want to sell software, resources, and education under a single brand while keeping full control over both the buying journey and the post-purchase experience.
