import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260326120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table if not exists "homepage_content" ("id" text not null, "handle" text not null, "status" text not null default 'published', "content" jsonb not null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "homepage_content_pkey" primary key ("id"));`
    )
    this.addSql(
      `create unique index if not exists "homepage_content_handle_unique" on "homepage_content" ("handle") where deleted_at is null;`
    )
    this.addSql(
      `create index if not exists "IDX_homepage_content_deleted_at" on "homepage_content" ("deleted_at") where deleted_at is null;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "homepage_content" cascade;`)
  }
}