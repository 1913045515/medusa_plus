import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260423000001 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "file_asset" add column if not exists "is_public" boolean not null default false;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "file_asset" drop column if exists "is_public";`)
  }
}
