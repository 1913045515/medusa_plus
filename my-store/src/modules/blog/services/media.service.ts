import { randomUUID } from "node:crypto"
import { basename, extname } from "node:path"
import { S3Client, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { Upload } from "@aws-sdk/lib-storage"
import type { Readable } from "node:stream"

export type BlogMediaTarget =
  | { entity: "post"; entity_id: string; field: "cover_image" }
  | { entity: "category"; entity_id: string; field: "cover_image" }
  | { entity: "tag"; entity_id: string; field: "cover_image" }
  | { entity: "content_image"; entity_id: string; field: "inline" }
  | { entity: "product_content"; entity_id: string; field: "inline" }

export type StoredBlogImage = {
  provider: "s3"
  bucket: string
  key: string
  permanent_url: string
  original_name: string
  mime_type: string
  size_bytes: number
  uploaded_at: string
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10 MB
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
])

function sanitizeFileName(name: string): string {
  return basename(name)
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .replace(/-+/g, "-")
    .toLowerCase()
}

function getExtension(name: string): string | null {
  const ext = extname(name).replace(/^\./, "").trim().toLowerCase()
  return ext || null
}

export function loadBlogMediaConfig() {
  return {
    bucket: process.env.BLOG_MEDIA_S3_BUCKET || process.env.COURSE_MEDIA_S3_BUCKET || null,
    region: process.env.BLOG_MEDIA_S3_REGION || process.env.COURSE_MEDIA_S3_REGION || process.env.AWS_REGION || "ap-southeast-1",
    accessKeyId: process.env.BLOG_MEDIA_S3_ACCESS_KEY_ID || process.env.COURSE_MEDIA_S3_ACCESS_KEY_ID || null,
    secretAccessKey: process.env.BLOG_MEDIA_S3_SECRET_ACCESS_KEY || process.env.COURSE_MEDIA_S3_SECRET_ACCESS_KEY || null,
  }
}

export class BlogMediaService {
  private readonly s3Client: S3Client | null
  private readonly config: ReturnType<typeof loadBlogMediaConfig>

  constructor() {
    this.config = loadBlogMediaConfig()
    const { bucket, region, accessKeyId, secretAccessKey } = this.config
    this.s3Client =
      bucket && region && accessKeyId && secretAccessKey
        ? new S3Client({
            region,
            credentials: { accessKeyId, secretAccessKey },
          })
        : null
  }

  isConfigured(): boolean {
    return this.s3Client !== null
  }

  getMaxFileSizeBytes(): number {
    return MAX_IMAGE_BYTES
  }

  buildObjectKey(target: BlogMediaTarget, fileName: string): string {
    const sanitized = sanitizeFileName(fileName)
    const unique = `${Date.now()}-${randomUUID()}`
    return `blog/${target.entity}/${target.entity_id}/${target.field}/${unique}-${sanitized}`
  }

  buildPermanentUrl(key: string): string {
    const { bucket, region } = this.config
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`
  }

  async upload(
    target: BlogMediaTarget,
    file_name: string,
    mime_type: string,
    size_bytes: number,
    body: Buffer | Readable
  ): Promise<StoredBlogImage> {
    if (!this.s3Client || !this.config.bucket) {
      throw new Error("Blog media S3 is not configured. Set BLOG_MEDIA_S3_BUCKET, BLOG_MEDIA_S3_ACCESS_KEY_ID, BLOG_MEDIA_S3_SECRET_ACCESS_KEY env vars.")
    }
    if (!ALLOWED_IMAGE_TYPES.has(mime_type)) {
      throw new Error(`Unsupported file type: ${mime_type}. Allowed: ${[...ALLOWED_IMAGE_TYPES].join(", ")}`)
    }
    if (size_bytes > MAX_IMAGE_BYTES) {
      throw new Error(`File too large (${size_bytes} bytes). Maximum ${MAX_IMAGE_BYTES} bytes.`)
    }

    const key = this.buildObjectKey(target, file_name)
    const permanentUrl = this.buildPermanentUrl(key)

    const up = new Upload({
      client: this.s3Client,
      params: {
        Bucket: this.config.bucket,
        Key: key,
        Body: body,
        ContentType: mime_type,
        ContentDisposition: `inline; filename="${sanitizeFileName(file_name)}"`,
      },
    })
    await up.done()

    return {
      provider: "s3",
      bucket: this.config.bucket,
      key,
      permanent_url: permanentUrl,
      original_name: file_name,
      mime_type,
      size_bytes,
      uploaded_at: new Date().toISOString(),
    }
  }

  async delete(asset: { bucket: string; key: string }): Promise<void> {
    if (!this.s3Client) return
    try {
      await this.s3Client.send(new DeleteObjectCommand({ Bucket: asset.bucket, Key: asset.key }))
    } catch {
      // Best-effort delete — do not throw
    }
  }

  /**
   * Generate a pre-signed URL from a permanent S3 URL.
   * Returns null if not configured or URL doesn't match the bucket.
   */
  async signUrl(permanentUrl: string, expiresInSeconds = 3600): Promise<string | null> {
    if (!this.s3Client || !this.config.bucket) return null
    try {
      const prefix = `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/`
      if (!permanentUrl || !permanentUrl.startsWith(prefix)) return null
      const key = permanentUrl.slice(prefix.length)
      const command = new GetObjectCommand({ Bucket: this.config.bucket!, Key: key })
      return await getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds })
    } catch {
      return null
    }
  }
}

export const blogMediaService = new BlogMediaService()
