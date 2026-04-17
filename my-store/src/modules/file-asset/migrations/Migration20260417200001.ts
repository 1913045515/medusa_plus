import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260417200001 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table if not exists "file_download_log" (
        "id" text not null,
        "customer_id" text not null,
        "file_asset_id" text not null,
        "order_id" text not null,
        "downloaded_at" timestamptz not null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "file_download_log_pkey" primary key ("id")
      );`
    )
    this.addSql(
      `create index if not exists "IDX_file_download_log_customer_file" on "file_download_log" ("customer_id", "file_asset_id");`
    )
    this.addSql(
      `create index if not exists "IDX_file_download_log_downloaded_at" on "file_download_log" ("downloaded_at");`
    )
    this.addSql(
      `create index if not exists "IDX_file_download_log_deleted_at" on "file_download_log" ("deleted_at") where deleted_at is null;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "file_download_log" cascade;`)
  }
}
