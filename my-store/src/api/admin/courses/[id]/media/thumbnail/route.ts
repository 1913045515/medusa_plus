import { createReadStream } from "node:fs"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  courseMediaService,
  courseService,
  setCourseModuleScope,
} from "../../../../../../modules/course"
import { parseAdminUploadRequest } from "../../../../_utils/media-upload"
import { toAdminMediaSummary } from "../../../../_utils/media-response"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)

  const existingCourse = await courseService.getCourse(req.params.id)
  if (!existingCourse) {
    return res.status(404).json({ message: "Course not found" })
  }

  const upload = await parseAdminUploadRequest(
    req,
    courseMediaService.getRuntimeConfig().maxFileSizeBytes
  )

  try {
    const asset = await courseMediaService.upload({
      entity_type: "course",
      entity_id: req.params.id,
      field: "course_thumbnail",
      file_name: upload.file_name,
      mime_type: upload.mime_type,
      size_bytes: upload.size_bytes,
      body: createReadStream(upload.temp_file_path),
    })

    const course = await courseService.updateCourse(req.params.id, {
      thumbnail_url: asset.permanent_url,
      thumbnail_asset: asset,
    })

    if (existingCourse.thumbnail_asset) {
      await courseMediaService.delete(existingCourse.thumbnail_asset).catch(() => undefined)
    }

    return res.status(200).json({
      course,
      media: toAdminMediaSummary(asset),
    })
  } finally {
    await upload.cleanup()
  }
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)

  const existingCourse = await courseService.getCourse(req.params.id)
  if (!existingCourse) {
    return res.status(404).json({ message: "Course not found" })
  }

  if (existingCourse.thumbnail_asset) {
    await courseMediaService.delete(existingCourse.thumbnail_asset).catch(() => undefined)
  }

  const course = await courseService.updateCourse(req.params.id, {
    thumbnail_url: null,
    thumbnail_asset: null,
  })

  return res.status(200).json({
    course,
    media: null,
    deleted: true,
  })
}