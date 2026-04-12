import { Migration } from "@medusajs/framework/mikro-orm/migrations"

/**
 * 移除 course.product_id 列。
 *
 * 背景：原设计在 course 表和 product.metadata 均存储关联关系（双写），
 * 导致双向同步 bug。现在只保留 product.metadata.virtual_course_id 作为
 * 唯一数据源（SSOT）。Course 不再持有产品引用。
 */
export class Migration20260412100000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table if exists "course" drop column if exists "product_id";`)
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "course" add column if not exists "product_id" text null;`)
  }
}
