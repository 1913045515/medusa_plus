import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260328100000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table if exists "course" add column if not exists "translations" jsonb null;`)
    this.addSql(`alter table if exists "lesson" add column if not exists "translations" jsonb null;`)
    this.addSql(`alter table if exists "homepage_content" add column if not exists "site_key" text not null default 'default';`)
    this.addSql(`alter table if exists "homepage_content" add column if not exists "translations" jsonb null;`)
    this.addSql(`drop index if exists "homepage_content_single_active_published";`)
    this.addSql(`create unique index if not exists "homepage_content_site_active_published" on "homepage_content" ("site_key") where deleted_at is null and is_active = true;`)
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "homepage_content_site_active_published";`)
    this.addSql(`create unique index if not exists "homepage_content_single_active_published" on "homepage_content" ("is_active") where deleted_at is null and is_active = true;`)
    this.addSql(`alter table if exists "homepage_content" drop column if exists "translations";`)
    this.addSql(`alter table if exists "homepage_content" drop column if exists "site_key";`)
    this.addSql(`alter table if exists "lesson" drop column if exists "translations";`)
    this.addSql(`alter table if exists "course" drop column if exists "translations";`)
  }
}