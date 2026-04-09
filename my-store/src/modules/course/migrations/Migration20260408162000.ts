import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260408162000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table if exists "course" add column if not exists "thumbnail_asset" jsonb null;`)
    this.addSql(`alter table if exists "lesson" add column if not exists "thumbnail_asset" jsonb null;`)
    this.addSql(`alter table if exists "lesson" add column if not exists "video_asset" jsonb null;`)
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "lesson" drop column if exists "video_asset";`)
    this.addSql(`alter table if exists "lesson" drop column if exists "thumbnail_asset";`)
    this.addSql(`alter table if exists "course" drop column if exists "thumbnail_asset";`)
  }
}