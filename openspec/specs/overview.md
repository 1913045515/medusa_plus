# AI Cross-Stand Platform — Product Spec

## Overview
An e-commerce + online course platform built on Medusa v2 + Next.js 15.

## Using this spec in VS Code Copilot Chat
- In Copilot Chat, prefer using `@workspace` to reference files under `openspec/specs/`.
- Example prompts:
  - `@workspace Read openspec/specs/overview.md and generate a task breakdown for backend + storefront.`
  - `@workspace Propose Medusa v2 modules and API endpoints based on this spec.`

## Tech Stack
- **Backend**: Medusa v2 (Node.js), PostgreSQL
- **Frontend**: Next.js 15, Tailwind CSS, TypeScript
- **Admin**: Medusa Admin (React)

## Core Domains
1. **Courses** — course catalog, lessons, video playback
2. **Store** — products, cart, checkout, orders
3. **Account** — customer auth, profile, order history

## Key Features
- Video course player (iQIYI-style layout: player left, episode list right)
- Static JSON-driven course/lesson data (dev mode)
- VIP / Free lesson access control
- Medusa standard e-commerce flows

---

## MVP Iteration 1 — Purchase-gated playback (DB-backed)

### Goals
- Replace static JSON repositories with PostgreSQL-backed repositories for `course` and `lesson`.
- Add a `course_purchase` table that records which customer purchased which course.
- Keep Store API contracts stable:
  - `GET /store/courses` lists published courses.
  - `GET /store/courses/:id/lessons` lists lessons **without** `video_url`.
  - `GET /store/lessons/:id/play` returns `video_url` only when allowed.

### Data model (PostgreSQL DDL summary)

> Note: actual migrations are generated/managed by Medusa. This DDL summary is for review and correctness.

#### Table: course_purchase
Tracks entitlement (customer -> course). Used by Store playback auth.

```sql
CREATE TABLE IF NOT EXISTS course_purchase (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  order_id TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT course_purchase_customer_course_uniq UNIQUE (customer_id, course_id)
);

CREATE INDEX IF NOT EXISTS course_purchase_customer_id_idx ON course_purchase(customer_id);
CREATE INDEX IF NOT EXISTS course_purchase_course_id_idx ON course_purchase(course_id);
```

### Store APIs (request/response)

#### GET /store/lessons/:id/play
- If lesson is free (`is_free=true`) => return `video_url`
- If lesson is paid:
  - when unauthenticated => `401`
  - when authenticated but not purchased => `403`
  - when purchased => `200` with `video_url`

Response examples:

```json
// 200
{ "video_url": "https://..." }
```

```json
// 401
{ "message": "请先登录" }
```

```json
// 403
{ "message": "请先购买课程" }
