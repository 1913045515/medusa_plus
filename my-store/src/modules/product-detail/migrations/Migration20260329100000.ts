import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260329100000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table if not exists "product_detail" (
      "id" text not null,
      "product_id" text not null,
      "long_desc_html" text null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      "deleted_at" timestamptz null,
      constraint "product_detail_pkey" primary key ("id")
    );`)
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_product_detail_product_id" ON "product_detail" ("product_id") WHERE deleted_at IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_detail_deleted_at" ON "product_detail" ("deleted_at") WHERE deleted_at IS NULL;`)

    this.addSql(`create table if not exists "product_image_meta" (
      "id" text not null,
      "product_id" text not null,
      "image_id" text not null,
      "is_main" boolean not null default false,
      "sort_order" integer not null default 0,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      "deleted_at" timestamptz null,
      constraint "product_image_meta_pkey" primary key ("id")
    );`)
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_product_image_meta_product_image" ON "product_image_meta" ("product_id", "image_id") WHERE deleted_at IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_image_meta_deleted_at" ON "product_image_meta" ("deleted_at") WHERE deleted_at IS NULL;`)
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product_image_meta" cascade;`)
    this.addSql(`drop table if exists "product_detail" cascade;`)
  }
}
