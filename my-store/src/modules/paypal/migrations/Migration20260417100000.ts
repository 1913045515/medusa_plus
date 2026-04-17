import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260417100000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table if not exists "paypal_config" (
        "id" text not null,
        "client_id" text not null,
        "client_secret_encrypted" text not null,
        "mode" text not null default 'sandbox',
        "card_fields_enabled" boolean not null default false,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "paypal_config_pkey" primary key ("id")
      );`
    )
    this.addSql(
      `create index if not exists "IDX_paypal_config_deleted_at" on "paypal_config" ("deleted_at") where deleted_at is null;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "paypal_config" cascade;`)
  }
}
