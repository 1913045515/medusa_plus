import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260326143000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table if exists "homepage_content" add column if not exists "title" text null;`)
    this.addSql(`alter table if exists "homepage_content" add column if not exists "is_active" boolean not null default false;`)
    this.addSql(`alter table if exists "homepage_content" add column if not exists "published_at" timestamptz null;`)
    this.addSql(`update "homepage_content" set "title" = coalesce(nullif("title", ''), initcap(replace("handle", '-', ' '))) where "title" is null or "title" = '';`)
    this.addSql(`update "homepage_content" set "is_active" = true, "published_at" = coalesce("published_at", now()) where "status" = 'published';`)
    this.addSql(`alter table if exists "homepage_content" alter column "title" set not null;`)
    this.addSql(`alter table if exists "homepage_content" alter column "status" set default 'draft';`)
    this.addSql(`create unique index if not exists "homepage_content_single_active_published" on "homepage_content" ("is_active") where deleted_at is null and is_active = true;`)
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "homepage_content_single_active_published";`)
    this.addSql(`alter table if exists "homepage_content" drop column if exists "published_at";`)
    this.addSql(`alter table if exists "homepage_content" drop column if exists "is_active";`)
    this.addSql(`alter table if exists "homepage_content" drop column if exists "title";`)
    this.addSql(`alter table if exists "homepage_content" alter column "status" set default 'published';`)
  }
}