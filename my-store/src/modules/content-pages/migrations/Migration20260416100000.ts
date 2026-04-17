import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260416100000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "content_page" (
        "id" text not null,
        "title" text not null,
        "slug" text not null,
        "body" text null,
        "status" text not null default 'draft',
        "show_in_footer" boolean not null default false,
        "footer_label" text null,
        "sort_order" integer not null default 0,
        "seo_title" text null,
        "seo_description" text null,
        "published_at" timestamptz null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        constraint "content_page_pkey" primary key ("id"),
        constraint "content_page_slug_unique" unique ("slug")
      );
    `)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_content_page_status" ON "content_page" ("status");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_content_page_show_in_footer" ON "content_page" ("show_in_footer");`)
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "content_page";`)
  }
}
