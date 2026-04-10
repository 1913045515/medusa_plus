import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260409120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table if not exists "site_analytics_event" ("id" text not null, "event_type" text not null, "visitor_id" text not null, "session_id" text null, "path" text not null, "full_path" text null, "country_code" text null, "duration_seconds" integer null, "referrer" text null, "user_agent" text null, "ip_address" text null, "occurred_at" timestamptz not null default now(), "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "site_analytics_event_pkey" primary key ("id"));`
    )
    this.addSql(
      `create index if not exists "IDX_site_analytics_event_deleted_at" on "site_analytics_event" ("deleted_at") where deleted_at is null;`
    )
    this.addSql(
      `create index if not exists "IDX_site_analytics_event_occurred_at" on "site_analytics_event" ("occurred_at") where deleted_at is null;`
    )
    this.addSql(
      `create index if not exists "IDX_site_analytics_event_country_code" on "site_analytics_event" ("country_code") where deleted_at is null;`
    )
    this.addSql(
      `create index if not exists "IDX_site_analytics_event_path" on "site_analytics_event" ("path") where deleted_at is null;`
    )
    this.addSql(
      `create index if not exists "IDX_site_analytics_event_visitor_occurred" on "site_analytics_event" ("visitor_id", "occurred_at") where deleted_at is null;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "site_analytics_event" cascade;`)
  }
}