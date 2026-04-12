import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260412130000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "store_settings" add column if not exists "email_templates_config" text null;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "store_settings" drop column if exists "email_templates_config";`)
  }
}
