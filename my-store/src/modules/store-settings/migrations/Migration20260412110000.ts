import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260412110000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table if not exists "store_settings" ("id" text not null, "cart_enabled" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "store_settings_pkey" primary key ("id"));`
    )
    this.addSql(
      `create index if not exists "IDX_store_settings_deleted_at" on "store_settings" ("deleted_at") where deleted_at is null;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "store_settings" cascade;`)
  }
}
