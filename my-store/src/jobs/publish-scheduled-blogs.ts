import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function publishScheduledBlogs(container: MedusaContainer) {
  const knex = container.resolve(ContainerRegistrationKeys.PG_CONNECTION ?? "pg_connection") as any
  const now = new Date()

  await knex("blog_post")
    .where("status", "scheduled")
    .where("scheduled_at", "<=", now)
    .whereNull("deleted_at")
    .update({
      status: "published",
      published_at: now,
      updated_at: now,
    })
}

export const config = {
  name: "publish-scheduled-blogs",
  schedule: "* * * * *", // every minute
}
