import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260412140000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "password_reset_token" (
        "id" text not null,
        "email" text not null,
        "token" text not null,
        "used" boolean not null default false,
        "expires_at" timestamptz not null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "password_reset_token_pkey" primary key ("id")
      );
    `)
    this.addSql(`create unique index if not exists "IDX_password_reset_token_token" on "password_reset_token" ("token") where deleted_at is null;`)
    this.addSql(`create index if not exists "IDX_password_reset_token_email" on "password_reset_token" ("email") where deleted_at is null;`)
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "password_reset_token";`)
  }
}
