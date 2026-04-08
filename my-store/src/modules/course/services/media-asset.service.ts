import { randomUUID } from "node:crypto"
import { basename, extname } from "node:path"
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import type {
  CourseMediaField,
  CourseMediaUploadTarget,
  SignedMediaAsset,
  StoredS3MediaAsset,
} from "../types"

const TWO_GB_IN_BYTES = 2 * 1024 * 1024 * 1024
const DEFAULT_SIGNED_URL_TTL_SECONDS = 2 * 60 * 60

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
])

const VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
])

export type CourseMediaConfig = {
  bucket: string | null
  region: string
  accessKeyId: string | null
  secretAccessKey: string | null
  maxFileSizeBytes: number
  signedUrlTtlSeconds: number
}

type UploadBody = Buffer | NodeJS.ReadableStream

type UploadMediaInput = CourseMediaUploadTarget & {
  file_name: string
  mime_type: string
  size_bytes: number
  body: UploadBody
}

type CourseMediaServiceDeps = {
  s3Client?: S3Client
  putObject?: (input: {
    bucket: string
    key: string
    body: UploadBody
    mimeType: string
    fileName: string
  }) => Promise<void>
  deleteObject?: (input: { bucket: string; key: string }) => Promise<void>
  signObject?: (input: { bucket: string; key: string; expiresInSeconds: number }) => Promise<string>
}

export function loadCourseMediaConfig(): CourseMediaConfig {
  const maxFileSizeBytes = Number(
    process.env.COURSE_MEDIA_S3_MAX_FILE_SIZE_BYTES || TWO_GB_IN_BYTES
  )
  const signedUrlTtlSeconds = Number(
    process.env.COURSE_MEDIA_SIGNED_URL_TTL_SECONDS || DEFAULT_SIGNED_URL_TTL_SECONDS
  )

  return {
    bucket: process.env.COURSE_MEDIA_S3_BUCKET || null,
    region: process.env.COURSE_MEDIA_S3_REGION || process.env.AWS_REGION || "ap-southeast-1",
    accessKeyId: process.env.COURSE_MEDIA_S3_ACCESS_KEY_ID || null,
    secretAccessKey: process.env.COURSE_MEDIA_S3_SECRET_ACCESS_KEY || null,
    maxFileSizeBytes:
      Number.isFinite(maxFileSizeBytes) && maxFileSizeBytes > 0
        ? maxFileSizeBytes
        : TWO_GB_IN_BYTES,
    signedUrlTtlSeconds:
      Number.isFinite(signedUrlTtlSeconds) && signedUrlTtlSeconds > 0
        ? signedUrlTtlSeconds
        : DEFAULT_SIGNED_URL_TTL_SECONDS,
  }
}

function sanitizeFileName(fileName: string): string {
  return basename(fileName)
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .replace(/-+/g, "-")
    .toLowerCase()
}

function getFileExtension(fileName: string): string | null {
  const extension = extname(fileName).replace(/^\./, "").trim().toLowerCase()
  return extension || null
}

function getAllowedMimeTypes(field: CourseMediaField): Set<string> {
  return field === "lesson_video" ? VIDEO_MIME_TYPES : IMAGE_MIME_TYPES
}

export class CourseMediaService {
  private readonly s3Client: S3Client | null

  constructor(
    private readonly config: CourseMediaConfig = loadCourseMediaConfig(),
    private readonly deps: CourseMediaServiceDeps = {}
  ) {
    this.s3Client =
      deps.s3Client ??
      (this.isConfigured()
        ? new S3Client({
            region: this.config.region,
            credentials: {
              accessKeyId: this.config.accessKeyId!,
              secretAccessKey: this.config.secretAccessKey!,
            },
          })
        : null)
  }

  isConfigured(): boolean {
    return Boolean(
      this.config.bucket &&
        this.config.region &&
        this.config.accessKeyId &&
        this.config.secretAccessKey
    )
  }

  getRuntimeConfig() {
    return {
      bucket: this.config.bucket,
      region: this.config.region,
      maxFileSizeBytes: this.config.maxFileSizeBytes,
      signedUrlTtlSeconds: this.config.signedUrlTtlSeconds,
    }
  }

  validateUpload(input: {
    field: CourseMediaField
    fileName: string
    mimeType: string
    sizeBytes: number
  }) {
    const allowedMimeTypes = getAllowedMimeTypes(input.field)

    if (!input.fileName.trim()) {
      throw new Error("Uploaded file name is required")
    }

    if (!input.mimeType.trim()) {
      throw new Error("Uploaded file type is required")
    }

    if (input.sizeBytes <= 0) {
      throw new Error("Uploaded file is empty")
    }

    if (input.sizeBytes > this.config.maxFileSizeBytes) {
      throw new Error(`Uploaded file exceeds ${this.config.maxFileSizeBytes} bytes limit`)
    }

    if (!allowedMimeTypes.has(input.mimeType)) {
      throw new Error(`Unsupported file type: ${input.mimeType}`)
    }
  }

  buildObjectKey(target: CourseMediaUploadTarget, fileName: string): string {
    const sanitized = sanitizeFileName(fileName)
    const uniquePart = `${Date.now()}-${randomUUID()}`
    const baseFolder = target.entity_type === "course" ? "courses" : "lessons"

    switch (target.field) {
      case "course_thumbnail":
      case "lesson_thumbnail":
        return `${baseFolder}/${target.entity_id}/thumbnail/${uniquePart}-${sanitized}`
      case "lesson_video":
        return `${baseFolder}/${target.entity_id}/video/${uniquePart}-${sanitized}`
      default:
        return `${baseFolder}/${target.entity_id}/asset/${uniquePart}-${sanitized}`
    }
  }

  async upload(input: UploadMediaInput): Promise<StoredS3MediaAsset> {
    this.assertConfigured()
    this.validateUpload({
      field: input.field,
      fileName: input.file_name,
      mimeType: input.mime_type,
      sizeBytes: input.size_bytes,
    })

    const bucket = this.config.bucket!
    const key = this.buildObjectKey(input, input.file_name)
    const uploadedAt = new Date().toISOString()

    await this.putObject({
      bucket,
      key,
      body: input.body,
      mimeType: input.mime_type,
      fileName: input.file_name,
    })

    return {
      provider: "s3",
      bucket,
      key,
      permanent_url: this.buildPermanentUrl(bucket, key),
      original_name: basename(input.file_name),
      extension: getFileExtension(input.file_name),
      mime_type: input.mime_type,
      size_bytes: input.size_bytes,
      uploaded_at: uploadedAt,
    }
  }

  async delete(asset: StoredS3MediaAsset | null | undefined): Promise<void> {
    if (!asset) {
      return
    }

    this.assertConfigured()

    await this.deleteObject({
      bucket: asset.bucket,
      key: asset.key,
    })
  }

  async sign(asset: StoredS3MediaAsset, expiresInSeconds?: number): Promise<SignedMediaAsset> {
    this.assertConfigured()

    const ttl = Math.min(
      Math.max(expiresInSeconds ?? this.config.signedUrlTtlSeconds, 1),
      7 * 24 * 60 * 60
    )

    const url = await this.signObject({
      bucket: asset.bucket,
      key: asset.key,
      expiresInSeconds: ttl,
    })

    return {
      url,
      expires_at: new Date(Date.now() + ttl * 1000).toISOString(),
      expires_in_seconds: ttl,
    }
  }

  private assertConfigured() {
    if (!this.isConfigured()) {
      throw new Error(
        "Course media S3 is not fully configured. Set COURSE_MEDIA_S3_BUCKET, COURSE_MEDIA_S3_REGION, COURSE_MEDIA_S3_ACCESS_KEY_ID, and COURSE_MEDIA_S3_SECRET_ACCESS_KEY."
      )
    }
  }

  private buildPermanentUrl(bucket: string, key: string): string {
    return `https://${bucket}.s3.${this.config.region}.amazonaws.com/${key}`
  }

  private async putObject(input: {
    bucket: string
    key: string
    body: UploadBody
    mimeType: string
    fileName: string
  }) {
    if (this.deps.putObject) {
      await this.deps.putObject(input)
      return
    }

    await this.s3Client!.send(
      new PutObjectCommand({
        Bucket: input.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.mimeType,
        ContentDisposition: `inline; filename="${sanitizeFileName(input.fileName)}"`,
      })
    )
  }

  private async deleteObject(input: { bucket: string; key: string }) {
    if (this.deps.deleteObject) {
      await this.deps.deleteObject(input)
      return
    }

    await this.s3Client!.send(
      new DeleteObjectCommand({
        Bucket: input.bucket,
        Key: input.key,
      })
    )
  }

  private async signObject(input: {
    bucket: string
    key: string
    expiresInSeconds: number
  }): Promise<string> {
    if (this.deps.signObject) {
      return await this.deps.signObject(input)
    }

    return await getSignedUrl(
      this.s3Client!,
      new GetObjectCommand({
        Bucket: input.bucket,
        Key: input.key,
      }),
      { expiresIn: input.expiresInSeconds }
    )
  }
}