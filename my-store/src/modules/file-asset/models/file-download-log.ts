import { model } from "@medusajs/framework/utils"

const FileDownloadLog = model.define("file_download_log", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  file_asset_id: model.text(),
  order_id: model.text(),
  downloaded_at: model.dateTime(),
})

export default FileDownloadLog
