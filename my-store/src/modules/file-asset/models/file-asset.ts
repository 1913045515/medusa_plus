import { model } from "@medusajs/framework/utils"

const FileAsset = model.define("file_asset", {
  id: model.id().primaryKey(),
  name: model.text(),
  original_filename: model.text(),
  s3_key: model.text(),
  s3_bucket: model.text(),
  mime_type: model.text(),
  size_bytes: model.number(),
  description: model.text().nullable(),
})

export default FileAsset
