import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import {
  MedusaError,
  AbstractFileProviderService,
  ModuleProvider,
  Modules,
} from "@medusajs/framework/utils"
import type { Logger } from "@medusajs/framework/types"
import path from "path"
import { PassThrough, Readable } from "stream"
import { ulid } from "ulid"

type InjectedDependencies = {
  logger: Logger
}

type PublicS3FileOptions = {
  file_url: string
  access_key_id?: string
  secret_access_key?: string
  authentication_method?: "access-key" | "default"
  region: string
  bucket: string
  prefix?: string
  endpoint?: string
  cache_control?: string
  download_file_duration?: number
  additional_client_config?: Record<string, unknown>
}

const DEFAULT_UPLOAD_EXPIRATION_DURATION_SECONDS = 60 * 60

class PublicS3FileService extends AbstractFileProviderService {
  static identifier = "public-s3"

  protected logger_: Logger
  protected config_: {
    fileUrl: string
    accessKeyId?: string
    secretAccessKey?: string
    authenticationMethod: "access-key" | "default"
    region: string
    bucket: string
    prefix: string
    endpoint?: string
    cacheControl: string
    downloadFileDuration: number
    additionalClientConfig: Record<string, unknown>
  }
  protected client_: S3Client

  static validateOptions(options: Record<string, any>) {
    if (!options.file_url) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "file_url is required")
    }

    if (!options.region) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "region is required")
    }

    if (!options.bucket) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "bucket is required")
    }
  }

  constructor({ logger }: InjectedDependencies, options: PublicS3FileOptions) {
    super()

    const authenticationMethod = options.authentication_method ?? "access-key"
    if (
      authenticationMethod === "access-key" &&
      (!options.access_key_id || !options.secret_access_key)
    ) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Access key ID and secret access key are required when using access key authentication"
      )
    }

    this.logger_ = logger
    this.config_ = {
      fileUrl: options.file_url.replace(/\/$/, ""),
      accessKeyId: options.access_key_id,
      secretAccessKey: options.secret_access_key,
      authenticationMethod,
      region: options.region,
      bucket: options.bucket,
      prefix: options.prefix ?? "",
      endpoint: options.endpoint,
      cacheControl: options.cache_control ?? "public, max-age=31536000",
      downloadFileDuration:
        options.download_file_duration ?? DEFAULT_UPLOAD_EXPIRATION_DURATION_SECONDS,
      additionalClientConfig: options.additional_client_config ?? {},
    }

    this.client_ = this.getClient()
  }

  protected getClient() {
    const credentials =
      this.config_.authenticationMethod === "access-key"
        ? {
            accessKeyId: this.config_.accessKeyId!,
            secretAccessKey: this.config_.secretAccessKey!,
          }
        : undefined

    return new S3Client({
      credentials,
      region: this.config_.region,
      endpoint: this.config_.endpoint,
      ...this.config_.additionalClientConfig,
    })
  }

  protected buildFileKey(filename: string) {
    const parsedFilename = path.parse(filename)
    return `${this.config_.prefix}${parsedFilename.name}-${ulid()}${parsedFilename.ext}`
  }

  protected decodeContent(content: string) {
    try {
      const decoded = Buffer.from(content, "base64")
      if (decoded.toString("base64") === content) {
        return decoded
      }

      return Buffer.from(content, "utf8")
    } catch {
      return Buffer.from(content, "binary")
    }
  }

  async upload(file: any) {
    if (!file) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "No file provided")
    }

    if (!file.filename) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "No filename provided")
    }

    const fileKey = this.buildFileKey(file.filename)
    const command = new PutObjectCommand({
      Bucket: this.config_.bucket,
      Body: this.decodeContent(file.content),
      Key: fileKey,
      ContentType: file.mimeType,
      CacheControl: this.config_.cacheControl,
      Metadata: {
        "original-filename": encodeURIComponent(file.filename),
      },
    })

    try {
      await this.client_.send(command)
    } catch (error) {
      this.logger_.error(error)
      throw error
    }

    return {
      url: `${this.config_.fileUrl}/${fileKey}`,
      key: fileKey,
    }
  }

  async getUploadStream(fileData: any) {
    if (!fileData.filename) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "No filename provided")
    }

    const fileKey = this.buildFileKey(fileData.filename)
    const pass = new PassThrough()
    const upload = new Upload({
      client: this.client_,
      params: {
        Bucket: this.config_.bucket,
        Key: fileKey,
        Body: pass,
        ContentType: fileData.mimeType,
        CacheControl: this.config_.cacheControl,
        Metadata: {
          "original-filename": encodeURIComponent(fileData.filename),
        },
      },
    })

    const promise = upload.done().then(() => ({
      url: `${this.config_.fileUrl}/${fileKey}`,
      key: fileKey,
    }))

    return {
      writeStream: pass,
      promise,
      url: `${this.config_.fileUrl}/${fileKey}`,
      fileKey,
    }
  }

  async delete(files: any) {
    try {
      if (Array.isArray(files)) {
        await this.client_.send(
          new DeleteObjectsCommand({
            Bucket: this.config_.bucket,
            Delete: {
              Objects: files.map((file) => ({ Key: file.fileKey })),
              Quiet: true,
            },
          })
        )
        return
      }

      await this.client_.send(
        new DeleteObjectCommand({
          Bucket: this.config_.bucket,
          Key: files.fileKey,
        })
      )
    } catch (error) {
      this.logger_.error(error)
    }
  }

  async getPresignedDownloadUrl(fileData: any) {
    const command = new GetObjectCommand({
      Bucket: this.config_.bucket,
      Key: fileData.fileKey,
    })

    return await getSignedUrl(this.client_, command, {
      expiresIn: this.config_.downloadFileDuration,
    })
  }

  async getPresignedUploadUrl(fileData: any) {
    if (!fileData?.filename) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "No filename provided")
    }

    const fileKey = `${this.config_.prefix}${fileData.filename}`

    const command = new PutObjectCommand({
      Bucket: this.config_.bucket,
      Key: fileKey,
      ContentType: fileData.mimeType,
    })

    const url = await getSignedUrl(this.client_, command, {
      expiresIn: fileData.expiresIn ?? DEFAULT_UPLOAD_EXPIRATION_DURATION_SECONDS,
    })

    return {
      url,
      key: fileKey,
    }
  }

  async getDownloadStream(fileData: any) {
    const response = await this.client_.send(
      new GetObjectCommand({
        Bucket: this.config_.bucket,
        Key: fileData.fileKey,
      })
    )

    return response.Body as Readable
  }

  async getAsBuffer(fileData: any) {
    const stream = await this.getDownloadStream(fileData)
    const chunks: Buffer[] = []

    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }

    return Buffer.concat(chunks)
  }
}

const services = [PublicS3FileService]

export default ModuleProvider(Modules.FILE, {
  services,
})