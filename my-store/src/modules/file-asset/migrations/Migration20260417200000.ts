import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260417200000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table if not exists "file_asset" (
        "id" text not null,
        "name" text not null,
        "original_filename" text not null,
        "s3_key" text not null,
        "s3_bucket" text not null,
        "mime_type" text not null,
        "size_bytes" integer not null,
        "description" text null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "file_asset_pkey" primary key ("id")
      );`
    )
    this.addSql(
      `create index if not exists "IDX_file_asset_deleted_at" on "file_asset" ("deleted_at") where deleted_at is null;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "file_asset" cascade;`)
  }
}
