import { createReadStream } from "node:fs"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  courseMediaService,
  lessonService,
  setCourseModuleScope,
} from "../../../../../../modules/course"
import { parseAdminUploadRequest } from "../../../../_utils/media-upload"
import { toAdminMediaSummary } from "../../../../_utils/media-response"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)

  const existingLesson = await lessonService.getLesson(req.params.id)
  if (!existingLesson) {
    return res.status(404).json({ message: "Lesson not found" })
  }

  const upload = await parseAdminUploadRequest(
    req,
    courseMediaService.getRuntimeConfig().maxFileSizeBytes
  )

  try {
    const asset = await courseMediaService.upload({
      entity_type: "lesson",
      entity_id: req.params.id,
      field: "lesson_video",
      file_name: upload.file_name,
      mime_type: upload.mime_type,
      size_bytes: upload.size_bytes,
      body: createReadStream(upload.temp_file_path),
    })

    const lesson = await lessonService.updateLesson(req.params.id, {
      video_url: asset.permanent_url,
      video_asset: asset,
    })

    if (existingLesson.video_asset) {
      await courseMediaService.delete(existingLesson.video_asset).catch(() => undefined)
    }

    return res.status(200).json({
      lesson,
      media: toAdminMediaSummary(asset),
    })
  } finally {
    await upload.cleanup()
  }
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)

  const existingLesson = await lessonService.getLesson(req.params.id)
  if (!existingLesson) {
    return res.status(404).json({ message: "Lesson not found" })
  }

  if (existingLesson.video_asset) {
    await courseMediaService.delete(existingLesson.video_asset).catch(() => undefined)
  }

  const lesson = await lessonService.updateLesson(req.params.id, {
    video_url: null,
    video_asset: null,
  })

  return res.status(200).json({
    lesson,
    media: null,
    deleted: true,
  })
}