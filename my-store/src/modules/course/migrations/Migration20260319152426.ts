import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260319152426 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "course" ("id" text not null, "product_id" text null, "handle" text not null, "title" text not null, "description" text null, "thumbnail_url" text null, "level" text null, "lessons_count" integer not null default 0, "status" text not null default 'published', "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "course_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_course_deleted_at" ON "course" ("deleted_at") WHERE deleted_at IS NULL;`);

    // 兼容已存在但缺少 product_id 列的旧数据库
    this.addSql(`alter table if exists "course" add column if not exists "product_id" text null;`);

    this.addSql(`create table if not exists "course_purchase" ("id" text not null, "customer_id" text not null, "course_id" text not null, "order_id" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "course_purchase_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_course_purchase_deleted_at" ON "course_purchase" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "lesson" ("id" text not null, "course_id" text not null, "title" text not null, "description" text null, "episode_number" integer not null, "duration" integer not null default 0, "is_free" boolean not null default false, "thumbnail_url" text null, "video_url" text null, "status" text not null default 'published', "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "lesson_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_lesson_deleted_at" ON "lesson" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "course" cascade;`);
    this.addSql(`drop table if exists "course_purchase" cascade;`);
    this.addSql(`drop table if exists "lesson" cascade;`);
  }

}
