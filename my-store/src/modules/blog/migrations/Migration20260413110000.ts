import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260413110000 extends Migration {

  override async up(): Promise<void> {
    // Add sort field to blog_post (higher sort value = higher position)
    this.addSql(`
      ALTER TABLE "blog_post"
      ADD COLUMN IF NOT EXISTS "sort" integer NOT NULL DEFAULT 0;
    `)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blog_post_sort" ON "blog_post" ("sort");`)

    // Add cover_image field to blog_tag
    this.addSql(`
      ALTER TABLE "blog_tag"
      ADD COLUMN IF NOT EXISTS "cover_image" text NULL;
    `)
  }

  override async down(): Promise<void> {
    this.addSql(`ALTER TABLE "blog_post" DROP COLUMN IF EXISTS "sort";`)
    this.addSql(`ALTER TABLE "blog_tag" DROP COLUMN IF EXISTS "cover_image";`)
  }

}
