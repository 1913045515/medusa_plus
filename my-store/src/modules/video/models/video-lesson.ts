import { model } from "@medusajs/framework/utils"

const VideoLesson = model.define("video_lesson", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  title: model.text(),
  episode_number: model.number(),
  video_url: model.text(),
  duration: model.number().default(0),
  is_free: model.boolean().default(false),
  thumbnail_url: model.text().nullable(),
  description: model.text().nullable(),
})

export default VideoLesson
