import type { StoredS3MediaAsset } from "../../../modules/course"

export function toAdminMediaSummary(asset: StoredS3MediaAsset | null) {
  if (!asset) {
    return null
  }

  return {
    file_name: asset.original_name,
    extension: asset.extension,
    mime_type: asset.mime_type,
    size_bytes: asset.size_bytes,
    uploaded_at: asset.uploaded_at,
  }
}