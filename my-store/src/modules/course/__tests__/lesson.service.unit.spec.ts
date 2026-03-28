import { LessonService } from "../services/lesson.service"
import type { ILessonRepository } from "../repositories/lesson.repository"
import type { LessonRecord } from "../types"

// ── helpers ───────────────────────────────────────────────────────────────────

const makeLesson = (overrides: Partial<LessonRecord> = {}): LessonRecord => ({
  id: "lesson_1",
  course_id: "course_1",
  title: "第1集：测试",
  description: null,
  episode_number: 1,
  duration: 600,
  is_free: true,
  thumbnail_url: null,
  video_url: "https://example.com/video.mp4",
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

// ── tests ─────────────────────────────────────────────────────────────────────

describe("LessonService", () => {
  describe("getLessonsByCourse", () => {
    it("returns lessons sorted by episode_number", async () => {
      const lessons = [makeLesson({ episode_number: 2 }), makeLesson({ episode_number: 1 })]
      const repo = makeRepo({ findByCourseId: jest.fn().mockResolvedValue(lessons) })
      const service = new LessonService(repo)

      const result = await service.getLessonsByCourse("course_1")

      expect(repo.findByCourseId).toHaveBeenCalledWith("course_1")
      expect(result).toEqual(lessons)
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

    it("returns 403 when lesson not found", async () => {
      const service = new LessonService(makeRepo())

      const result = await service.resolvePlayUrl("bad_id", "customer_1", alwaysPurchased)

      expect(result).toEqual({ ok: false, code: 403, message: "Lesson not found" })
    })
  })
})
