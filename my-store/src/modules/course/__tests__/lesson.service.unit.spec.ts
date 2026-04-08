import { LessonService } from "../services/lesson.service"
import type { ILessonRepository } from "../repositories/lesson.repository"
import type { LessonRecord, StoredS3MediaAsset } from "../types"

// ── helpers ───────────────────────────────────────────────────────────────────

const makeLesson = (overrides: Partial<LessonRecord> = {}): LessonRecord => ({
  id: "lesson_1",
  course_id: "course_1",
  title: "第1集：测试",
  description: null,
  translations: null,
  episode_number: 1,
  duration: 600,
  is_free: true,
  thumbnail_url: null,
  thumbnail_asset: null,
  video_url: "https://example.com/video.mp4",
  video_asset: null,
  status: "published",
  metadata: null,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  ...overrides,
})

const makeRepo = (overrides: Partial<ILessonRepository> = {}): ILessonRepository => ({
  findAll: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
  findByCourseId: jest.fn().mockResolvedValue([]),
  create: jest.fn().mockResolvedValue(makeLesson()),
  update: jest.fn().mockResolvedValue(null),
  delete: jest.fn().mockResolvedValue(false),
  ...overrides,
})

const makeAsset = (overrides: Partial<StoredS3MediaAsset> = {}): StoredS3MediaAsset => ({
  provider: "s3",
  bucket: "amzn-s3-lzq-bucket",
  key: "lessons/lesson_1/video/test.mp4",
  permanent_url: "https://amzn-s3-lzq-bucket.s3.ap-southeast-1.amazonaws.com/lessons/lesson_1/video/test.mp4",
  original_name: "test.mp4",
  extension: "mp4",
  mime_type: "video/mp4",
  size_bytes: 1024,
  uploaded_at: "2026-04-08T00:00:00.000Z",
  ...overrides,
})

// ── tests ─────────────────────────────────────────────────────────────────────

describe("LessonService", () => {
  describe("getLessonsByCourse", () => {
    it("returns lessons sorted by episode_number", async () => {
      const lessons = [makeLesson({ episode_number: 2 }), makeLesson({ episode_number: 1 })]
      const repo = makeRepo({ findByCourseId: jest.fn().mockResolvedValue(lessons) })
      const service = new LessonService(repo)

      const result = await service.getLessonsByCourse("course_1")

      expect(repo.findByCourseId).toHaveBeenCalledWith("course_1")
      expect(result).toEqual(lessons.map((lesson) => ({ ...lesson, locale: null })))
    })
  })

  describe("updateLesson", () => {
    it("returns updated record", async () => {
      const updated = makeLesson({ title: "Updated" })
      const repo = makeRepo({ update: jest.fn().mockResolvedValue(updated) })
      const service = new LessonService(repo)

      const result = await service.updateLesson("lesson_1", { title: "Updated" })

      expect(result).toEqual(updated)
    })

    it("throws when lesson not found", async () => {
      const service = new LessonService(makeRepo())
      await expect(service.updateLesson("bad_id", {})).rejects.toThrow("Lesson bad_id not found")
    })
  })

  describe("deleteLesson", () => {
    it("resolves when deleted successfully", async () => {
      const repo = makeRepo({ delete: jest.fn().mockResolvedValue(true) })
      await expect(new LessonService(repo).deleteLesson("lesson_1")).resolves.toBeUndefined()
    })

    it("throws when lesson not found", async () => {
      await expect(new LessonService(makeRepo()).deleteLesson("bad_id")).rejects.toThrow("Lesson bad_id not found")
    })
  })

  describe("resolvePlayUrl", () => {
    const neverPurchased = jest.fn().mockResolvedValue(false)
    const alwaysPurchased = jest.fn().mockResolvedValue(true)

    it("returns video_url for free lesson without auth", async () => {
      const lesson = makeLesson({ is_free: true, video_url: "https://cdn.example.com/free.mp4" })
      const repo = makeRepo({ findById: jest.fn().mockResolvedValue(lesson) })
      const service = new LessonService(repo)

      const result = await service.resolvePlayUrl("lesson_1", null, neverPurchased)

      expect(result).toEqual({ ok: true, video_url: "https://cdn.example.com/free.mp4" })
      expect(neverPurchased).not.toHaveBeenCalled()
    })

    it("returns 401 for paid lesson when not logged in", async () => {
      const lesson = makeLesson({ is_free: false })
      const repo = makeRepo({ findById: jest.fn().mockResolvedValue(lesson) })
      const service = new LessonService(repo)

      const result = await service.resolvePlayUrl("lesson_1", null, neverPurchased)

      expect(result).toEqual({ ok: false, code: 401, message: "请先登录" })
    })

    it("returns 403 for paid lesson when logged in but not purchased", async () => {
      const lesson = makeLesson({ is_free: false })
      const repo = makeRepo({ findById: jest.fn().mockResolvedValue(lesson) })
      const service = new LessonService(repo)

      const result = await service.resolvePlayUrl("lesson_1", "customer_1", neverPurchased)

      expect(result).toEqual({ ok: false, code: 403, message: "请先购买课程" })
      expect(neverPurchased).toHaveBeenCalledWith("customer_1", "course_1")
    })

    it("returns video_url for paid lesson when purchased", async () => {
      const lesson = makeLesson({ is_free: false, video_url: "https://cdn.example.com/paid.mp4" })
      const repo = makeRepo({ findById: jest.fn().mockResolvedValue(lesson) })
      const service = new LessonService(repo)

      const result = await service.resolvePlayUrl("lesson_1", "customer_1", alwaysPurchased)

      expect(result).toEqual({ ok: true, video_url: "https://cdn.example.com/paid.mp4" })
    })

    it("returns signed video metadata when S3 asset exists", async () => {
      const lesson = makeLesson({ is_free: false, video_asset: makeAsset() })
      const repo = makeRepo({ findById: jest.fn().mockResolvedValue(lesson) })
      const mediaService = {
        isConfigured: jest.fn().mockReturnValue(true),
        sign: jest.fn().mockResolvedValue({
          url: "https://signed.example.com/video.mp4",
          expires_at: "2026-04-08T02:00:00.000Z",
          expires_in_seconds: 7200,
        }),
      }
      const service = new LessonService(repo, mediaService)

      const result = await service.resolvePlayUrl("lesson_1", "customer_1", alwaysPurchased)

      expect(mediaService.sign).toHaveBeenCalledWith(lesson.video_asset)
      expect(result).toEqual({
        ok: true,
        video_url: "https://signed.example.com/video.mp4",
        video_url_expires_at: "2026-04-08T02:00:00.000Z",
        video_url_expires_in_seconds: 7200,
      })
    })

    it("returns 403 when lesson not found", async () => {
      const service = new LessonService(makeRepo())

      const result = await service.resolvePlayUrl("bad_id", "customer_1", alwaysPurchased)

      expect(result).toEqual({ ok: false, code: 403, message: "Lesson not found" })
    })
  })

  describe("serializeStoreLesson", () => {
    it("replaces thumbnail with signed url and hides video url", async () => {
      const lesson = { ...makeLesson(), thumbnail_asset: makeAsset({ key: "lessons/lesson_1/thumbnail/test.png", mime_type: "image/png", extension: "png", original_name: "test.png" }) }
      const repo = makeRepo()
      const mediaService = {
        isConfigured: jest.fn().mockReturnValue(true),
        sign: jest.fn().mockResolvedValue({
          url: "https://signed.example.com/thumbnail.png",
          expires_at: "2026-04-08T02:00:00.000Z",
          expires_in_seconds: 7200,
        }),
      }
      const service = new LessonService(repo, mediaService)

      const result = await service.serializeStoreLesson({ ...lesson, locale: null })

      expect(result.thumbnail_url).toBe("https://signed.example.com/thumbnail.png")
      expect(result.thumbnail_url_expires_at).toBe("2026-04-08T02:00:00.000Z")
      expect(result.video_url).toBeNull()
      expect((result as any).video_asset).toBeUndefined()
    })
  })
})
