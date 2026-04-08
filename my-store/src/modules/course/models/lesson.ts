import { model } from "@medusajs/framework/utils"

const Lesson = model.define("lesson", {
  id: model.id().primaryKey(),
  course_id: model.text(),
  title: model.text(),
  description: model.text().nullable(),
  translations: model.json().nullable(),
  episode_number: model.number(),
  duration: model.number().default(0),   // 单位：秒
  is_free: model.boolean().default(false),
  thumbnail_url: model.text().nullable(),
  thumbnail_asset: model.json().nullable(),
  video_url: model.text().nullable(),    // Store API 不对外暴露，仅 play 接口使用
  video_asset: model.json().nullable(),
  status: model.text().default("published"), // "published" | "draft"
  metadata: model.json().nullable(),
})

export default Lesson
