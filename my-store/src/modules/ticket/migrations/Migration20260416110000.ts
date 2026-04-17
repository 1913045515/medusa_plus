import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260416110000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table if not exists "ticket" (
        "id" text not null,
        "title" text not null,
        "status" text not null default 'open',
        "customer_email" text null,
        "guest_token" text null,
        "resolved_at" timestamptz null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "ticket_pkey" primary key ("id")
      );`
    )
    this.addSql(
      `create index if not exists "IDX_ticket_deleted_at" on "ticket" ("deleted_at") where deleted_at is null;`
    )
    this.addSql(
      `create index if not exists "IDX_ticket_status" on "ticket" ("status") where deleted_at is null;`
    )
    this.addSql(
      `create index if not exists "IDX_ticket_customer_email" on "ticket" ("customer_email") where deleted_at is null;`
    )
    this.addSql(
      `create index if not exists "IDX_ticket_guest_token" on "ticket" ("guest_token") where deleted_at is null;`
    )
    this.addSql(
      `create table if not exists "ticket_message" (
        "id" text not null,
        "ticket_id" text not null,
        "sender_type" text not null,
        "content" text not null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "ticket_message_pkey" primary key ("id")
      );`
    )
    this.addSql(
      `create index if not exists "IDX_ticket_message_ticket_id" on "ticket_message" ("ticket_id") where deleted_at is null;`
    )
    this.addSql(
      `create index if not exists "IDX_ticket_message_deleted_at" on "ticket_message" ("deleted_at") where deleted_at is null;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "ticket_message" cascade;`)
    this.addSql(`drop table if exists "ticket" cascade;`)
  }
}
