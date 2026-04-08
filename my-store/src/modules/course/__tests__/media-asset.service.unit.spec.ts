import {
  CourseMediaService,
  type CourseMediaConfig,
} from "../services/media-asset.service"

const makeConfig = (
  overrides: Partial<CourseMediaConfig> = {}
): CourseMediaConfig => ({
  bucket: "amzn-s3-lzq-bucket",
  region: "ap-southeast-1",
  accessKeyId: "test-access-key",
  secretAccessKey: "test-secret-key",
  maxFileSizeBytes: 2 * 1024 * 1024 * 1024,
  signedUrlTtlSeconds: 7200,
  ...overrides,
})

describe("CourseMediaService", () => {
  it("returns structured media metadata after upload", async () => {
    const putObject = jest.fn().mockResolvedValue(undefined)
    const service = new CourseMediaService(makeConfig(), { putObject })

    const result = await service.upload({
      entity_type: "lesson",
      entity_id: "lesson_123",
      field: "lesson_video",
      file_name: "Lesson Intro.MP4",
      mime_type: "video/mp4",
      size_bytes: 1024,
      body: Buffer.from("video"),
    })

    expect(putObject).toHaveBeenCalledTimes(1)
    expect(result.provider).toBe("s3")
    expect(result.bucket).toBe("amzn-s3-lzq-bucket")
    expect(result.key).toContain("lessons/lesson_123/video/")
    expect(result.permanent_url).toContain("https://amzn-s3-lzq-bucket.s3.ap-southeast-1.amazonaws.com/")
    expect(result.original_name).toBe("Lesson Intro.MP4")
    expect(result.extension).toBe("mp4")
    expect(result.mime_type).toBe("video/mp4")
    expect(result.size_bytes).toBe(1024)
    expect(result.uploaded_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it("rejects uploads larger than the configured limit", async () => {
    const service = new CourseMediaService(makeConfig({ maxFileSizeBytes: 10 }))

    await expect(
      service.upload({
        entity_type: "course",
        entity_id: "course_123",
        field: "course_thumbnail",
        file_name: "cover.png",
        mime_type: "image/png",
        size_bytes: 11,
        body: Buffer.from("too-big"),
      })
    ).rejects.toThrow("Uploaded file exceeds 10 bytes limit")
  })

  it("creates signed URLs with expiry metadata", async () => {
    const signObject = jest.fn().mockResolvedValue("https://signed.example.com/video.mp4")
    const service = new CourseMediaService(makeConfig(), { signObject })

    const result = await service.sign({
      provider: "s3",
      bucket: "amzn-s3-lzq-bucket",
      key: "lessons/lesson_123/video/test.mp4",
      permanent_url: "https://amzn-s3-lzq-bucket.s3.ap-southeast-1.amazonaws.com/lessons/lesson_123/video/test.mp4",
      original_name: "test.mp4",
      extension: "mp4",
      mime_type: "video/mp4",
      size_bytes: 2048,
      uploaded_at: "2026-04-08T00:00:00.000Z",
    })

    expect(signObject).toHaveBeenCalledWith({
      bucket: "amzn-s3-lzq-bucket",
      key: "lessons/lesson_123/video/test.mp4",
      expiresInSeconds: 7200,
    })
    expect(result.url).toBe("https://signed.example.com/video.mp4")
    expect(result.expires_in_seconds).toBe(7200)
    expect(result.expires_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})