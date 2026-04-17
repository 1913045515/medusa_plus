import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260417100000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "menu_item" (
        "id" text not null,
        "menu_type" text not null default 'front',
        "title" text not null,
        "href" text not null,
        "icon" text null,
        "parent_id" text null,
        "sort_order" integer not null default 0,
        "is_visible" boolean not null default true,
        "target" text not null default '_self',
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "menu_item_pkey" primary key ("id")
      );
    `)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_menu_item_menu_type" ON "menu_item" ("menu_type");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_menu_item_parent_id" ON "menu_item" ("parent_id");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_menu_item_sort_order" ON "menu_item" ("menu_type", "parent_id", "sort_order");`)
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "menu_item";`)
  }
}
