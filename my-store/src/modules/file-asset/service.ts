import { randomUUID } from "node:crypto"
import { MedusaService } from "@medusajs/framework/utils"
import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { Upload } from "@aws-sdk/lib-storage"
import type { Readable } from "node:stream"
import FileAsset from "./models/file-asset"
import FileDownloadLog from "./models/file-download-log"

const MAX_FILE_BYTES = 500 * 1024 * 1024 // 500 MB
const DOWNLOAD_LIMIT_PER_DAY = 3
const PRESIGNED_URL_EXPIRES_SECONDS = 30 * 60 // 30 minutes

function loadS3Config() {
  return {
    bucket:
      process.env.FILE_ASSET_S3_BUCKET ||
      process.env.COURSE_MEDIA_S3_BUCKET ||
      null,
    region:
      process.env.FILE_ASSET_S3_REGION ||
      process.env.COURSE_MEDIA_S3_REGION ||
      process.env.AWS_REGION ||
      "ap-southeast-1",
    accessKeyId:
      process.env.FILE_ASSET_S3_ACCESS_KEY_ID ||
      process.env.COURSE_MEDIA_S3_ACCESS_KEY_ID ||
      null,
    secretAccessKey:
      process.env.FILE_ASSET_S3_SECRET_ACCESS_KEY ||
      process.env.COURSE_MEDIA_S3_SECRET_ACCESS_KEY ||
      null,
  }
}

function buildS3Client(): S3Client | null {
  const { bucket, region, accessKeyId, secretAccessKey } = loadS3Config()
  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    return null
  }
  return new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  })
}

function buildObjectKey(originalFilename: string): string {
  const uuid = randomUUID()
  // Sanitize filename: keep only safe characters
  const safe = originalFilename
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase()
  return `file-assets/${uuid}/${safe || "file"}`
}

class FileAssetModuleService extends MedusaService({
  FileAsset,
  FileDownloadLog,
}) {
  private s3Client: S3Client | null
  private s3Config: ReturnType<typeof loadS3Config>

  constructor() {
    super(...arguments)
    this.s3Config = loadS3Config()
    this.s3Client = buildS3Client()
  }

  isS3Configured(): boolean {
    return this.s3Client !== null && this.s3Config.bucket !== null
  }

  async uploadToS3(
    originalFilename: string,
    mimeType: string,
    sizeBytes: number,
    body: Buffer | Readable
  ): Promise<{ s3Key: string; s3Bucket: string }> {
    if (!this.s3Client || !this.s3Config.bucket) {
      throw new Error(
        "S3 is not configured for file assets. Set FILE_ASSET_S3_BUCKET, FILE_ASSET_S3_ACCESS_KEY_ID, FILE_ASSET_S3_SECRET_ACCESS_KEY."
      )
    }
    if (sizeBytes > MAX_FILE_BYTES) {
      throw new Error(`文件大小不能超过 500 MB（当前：${Math.round(sizeBytes / 1024 / 1024)} MB）`)
    }

    const s3Key = buildObjectKey(originalFilename)
    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: this.s3Config.bucket,
        Key: s3Key,
        Body: body,
        ContentType: mimeType,
        ContentDisposition: `attachment; filename="${originalFilename.replace(/"/g, "")}"`,
      },
    })
    await upload.done()

    return { s3Key, s3Bucket: this.s3Config.bucket }
  }

  async deleteFromS3(s3Bucket: string, s3Key: string): Promise<void> {
    if (!this.s3Client) return
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({ Bucket: s3Bucket, Key: s3Key })
      )
    } catch (err: any) {
      // Ignore NoSuchKey — file already gone
      if (err?.Code !== "NoSuchKey" && err?.name !== "NoSuchKey") {
        throw err
      }
    }
  }

  async generatePresignedDownloadUrl(fileAssetId: string): Promise<string> {
    if (!this.s3Client || !this.s3Config.bucket) {
      throw new Error("S3 is not configured.")
    }
    // Resolve the file asset to get bucket + key
    const assets = await this.listFileAssets({ filters: { id: fileAssetId } })
    const asset = assets[0]
    if (!asset) {
      throw new Error(`File asset not found: ${fileAssetId}`)
    }

    const command = new GetObjectCommand({
      Bucket: asset.s3_bucket,
      Key: asset.s3_key,
    })
    return await getSignedUrl(this.s3Client, command, {
      expiresIn: PRESIGNED_URL_EXPIRES_SECONDS,
    })
  }

  async countDownloadsByCustomerAndDate(
    customerId: string,
    fileAssetId: string,
    date: Date
  ): Promise<number> {
    // Count rows where customer_id + file_asset_id match and downloaded_at is within UTC day
    const startOfDay = new Date(date)
    startOfDay.setUTCHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setUTCHours(23, 59, 59, 999)

    const logs = await this.listFileDownloadLogs({
      filters: {
        customer_id: customerId,
        file_asset_id: fileAssetId,
      },
    })
    // Filter in-memory by date range (MedusaService's filterBy for dates is limited)
    const count = logs.filter((log: any) => {
      const ts = new Date(log.downloaded_at).getTime()
      return ts >= startOfDay.getTime() && ts <= endOfDay.getTime()
    }).length
    return count
  }

  async recordDownload(
    customerId: string,
    fileAssetId: string,
    orderId: string
  ): Promise<void> {
    await this.createFileDownloadLogs({
      customer_id: customerId,
      file_asset_id: fileAssetId,
      order_id: orderId,
      downloaded_at: new Date(),
    })
  }

  getDownloadLimitPerDay(): number {
    return DOWNLOAD_LIMIT_PER_DAY
  }

  getPresignedUrlExpiresSeconds(): number {
    return PRESIGNED_URL_EXPIRES_SECONDS
  }
}

export default FileAssetModuleService
