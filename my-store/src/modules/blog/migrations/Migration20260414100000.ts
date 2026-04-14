import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260414100000 extends Migration {

  override async up(): Promise<void> {
    // Add created_by / updated_by to blog_category
    this.addSql(`ALTER TABLE "blog_category" ADD COLUMN IF NOT EXISTS "created_by" text NULL;`)
    this.addSql(`ALTER TABLE "blog_category" ADD COLUMN IF NOT EXISTS "updated_by" text NULL;`)

    // Add created_by / updated_by to blog_tag
    this.addSql(`ALTER TABLE "blog_tag" ADD COLUMN IF NOT EXISTS "created_by" text NULL;`)
    this.addSql(`ALTER TABLE "blog_tag" ADD COLUMN IF NOT EXISTS "updated_by" text NULL;`)

    // Add created_by / updated_by to blog_user_group
    this.addSql(`ALTER TABLE "blog_user_group" ADD COLUMN IF NOT EXISTS "created_by" text NULL;`)
    this.addSql(`ALTER TABLE "blog_user_group" ADD COLUMN IF NOT EXISTS "updated_by" text NULL;`)
  }

  override async down(): Promise<void> {
    this.addSql(`ALTER TABLE "blog_category" DROP COLUMN IF EXISTS "created_by";`)
    this.addSql(`ALTER TABLE "blog_category" DROP COLUMN IF EXISTS "updated_by";`)
    this.addSql(`ALTER TABLE "blog_tag" DROP COLUMN IF EXISTS "created_by";`)
    this.addSql(`ALTER TABLE "blog_tag" DROP COLUMN IF EXISTS "updated_by";`)
    this.addSql(`ALTER TABLE "blog_user_group" DROP COLUMN IF EXISTS "created_by";`)
    this.addSql(`ALTER TABLE "blog_user_group" DROP COLUMN IF EXISTS "updated_by";`)
  }

}
