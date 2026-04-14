import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260413100000 extends Migration {

  override async up(): Promise<void> {
    // blog_category
    this.addSql(`
      create table if not exists "blog_category" (
        "id" text not null,
        "name" text not null,
        "slug" text not null,
        "description" text null,
        "cover_image" text null,
        "parent_id" text null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        constraint "blog_category_pkey" primary key ("id"),
        constraint "blog_category_slug_unique" unique ("slug")
      );
    `)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blog_category_parent_id" ON "blog_category" ("parent_id");`)

    // blog_tag
    this.addSql(`
      create table if not exists "blog_tag" (
        "id" text not null,
        "name" text not null,
        "slug" text not null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        constraint "blog_tag_pkey" primary key ("id"),
        constraint "blog_tag_slug_unique" unique ("slug")
      );
    `)

    // blog_user_group
    this.addSql(`
      create table if not exists "blog_user_group" (
        "id" text not null,
        "name" text not null,
        "description" text null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        constraint "blog_user_group_pkey" primary key ("id")
      );
    `)

    // blog_user_group_member
    this.addSql(`
      create table if not exists "blog_user_group_member" (
        "id" text not null,
        "group_id" text not null,
        "customer_id" text not null,
        "created_at" timestamptz not null default now(),
        constraint "blog_user_group_member_pkey" primary key ("id"),
        constraint "blog_user_group_member_unique" unique ("group_id", "customer_id")
      );
    `)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blog_user_group_member_group_id" ON "blog_user_group_member" ("group_id");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blog_user_group_member_customer_id" ON "blog_user_group_member" ("customer_id");`)

    // blog_post
    this.addSql(`
      create table if not exists "blog_post" (
        "id" text not null,
        "title" text not null,
        "slug" text not null,
        "excerpt" text null,
        "content" text null,
        "cover_image" text null,
        "category_id" text null,
        "status" text not null default 'draft',
        "is_pinned" boolean not null default false,
        "password" text null,
        "visibility" text not null default 'all',
        "visibility_user_ids" jsonb null,
        "visibility_group_ids" jsonb null,
        "scheduled_at" timestamptz null,
        "published_at" timestamptz null,
        "allow_comments" boolean not null default true,
        "read_count" integer not null default 0,
        "word_count" integer not null default 0,
        "seo_title" text null,
        "seo_description" text null,
        "author_id" text null,
        "updated_by" text null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "blog_post_pkey" primary key ("id"),
        constraint "blog_post_slug_unique" unique ("slug")
      );
    `)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blog_post_deleted_at" ON "blog_post" ("deleted_at") WHERE deleted_at IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blog_post_status" ON "blog_post" ("status");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blog_post_category_id" ON "blog_post" ("category_id");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blog_post_is_pinned" ON "blog_post" ("is_pinned");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blog_post_published_at" ON "blog_post" ("published_at");`)
    // GIN indexes for visibility jsonb arrays
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blog_post_visibility_user_ids" ON "blog_post" USING GIN ("visibility_user_ids");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blog_post_visibility_group_ids" ON "blog_post" USING GIN ("visibility_group_ids");`)
    // tsvector GIN index for full-text search
    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_blog_post_fts"
      ON "blog_post"
      USING GIN (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(excerpt,'') || ' ' || coalesce(content,'')));
    `)

    // blog_post_tag (many-to-many)
    this.addSql(`
      create table if not exists "blog_post_tag" (
        "id" text not null,
        "post_id" text not null,
        "tag_id" text not null,
        "created_at" timestamptz not null default now(),
        constraint "blog_post_tag_pkey" primary key ("id"),
        constraint "blog_post_tag_unique" unique ("post_id", "tag_id")
      );
    `)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blog_post_tag_post_id" ON "blog_post_tag" ("post_id");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blog_post_tag_tag_id" ON "blog_post_tag" ("tag_id");`)

    // blog_comment
    this.addSql(`
      create table if not exists "blog_comment" (
        "id" text not null,
        "post_id" text not null,
        "customer_id" text not null,
        "content" text not null,
        "status" text not null default 'pending',
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        constraint "blog_comment_pkey" primary key ("id")
      );
    `)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blog_comment_post_id" ON "blog_comment" ("post_id");`)

    // blog_post_version
    this.addSql(`
      create table if not exists "blog_post_version" (
        "id" text not null,
        "post_id" text not null,
        "title" text not null,
        "content" text null,
        "created_by" text null,
        "created_at" timestamptz not null default now(),
        constraint "blog_post_version_pkey" primary key ("id")
      );
    `)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blog_post_version_post_id" ON "blog_post_version" ("post_id");`)

    // blog_post_read (for dedup read counting)
    this.addSql(`
      create table if not exists "blog_post_read" (
        "id" text not null,
        "post_id" text not null,
        "ip" text null,
        "customer_id" text null,
        "created_at" timestamptz not null default now(),
        constraint "blog_post_read_pkey" primary key ("id")
      );
    `)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blog_post_read_post_ip" ON "blog_post_read" ("post_id", "ip");`)
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "blog_post_read" cascade;`)
    this.addSql(`drop table if exists "blog_post_version" cascade;`)
    this.addSql(`drop table if exists "blog_comment" cascade;`)
    this.addSql(`drop table if exists "blog_post_tag" cascade;`)
    this.addSql(`drop table if exists "blog_post" cascade;`)
    this.addSql(`drop table if exists "blog_user_group_member" cascade;`)
    this.addSql(`drop table if exists "blog_user_group" cascade;`)
    this.addSql(`drop table if exists "blog_tag" cascade;`)
    this.addSql(`drop table if exists "blog_category" cascade;`)
  }

}
