import { CourseService } from "../services/course.service"
import type { ICourseRepository } from "../repositories/course.repository"
import type { CourseRecord } from "../types"

// ── helpers ───────────────────────────────────────────────────────────────────

const makeCourse = (overrides: Partial<CourseRecord> = {}): CourseRecord => ({
  id: "course_1",
  handle: "test-course",
  title: "Test Course",
  description: null,
  translations: null,
  thumbnail_url: null,
  thumbnail_asset: null,
  level: "beginner",
  lessons_count: 0,
  status: "published",
  metadata: null,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  ...overrides,
})

const makeRepo = (overrides: Partial<ICourseRepository> = {}): ICourseRepository => ({
  findAll: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
  findByHandle: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockResolvedValue(makeCourse()),
  update: jest.fn().mockResolvedValue(null),
  delete: jest.fn().mockResolvedValue(false),
  ...overrides,
})

// ── tests ─────────────────────────────────────────────────────────────────────

describe("CourseService", () => {
  describe("listCourses", () => {
    it("returns courses from repository", async () => {
      const course = makeCourse()
      const repo = makeRepo({ findAll: jest.fn().mockResolvedValue([course]) })
      const service = new CourseService(repo)

      const result = await service.listCourses()

      expect(repo.findAll).toHaveBeenCalledWith(undefined)
      expect(result).toEqual([{ ...course, locale: null }])
    })

    it("passes filters to repository", async () => {
      const repo = makeRepo()
      const service = new CourseService(repo)

      await service.listCourses({ status: "published" })

      expect(repo.findAll).toHaveBeenCalledWith({ status: "published" })
    })
  })

  describe("getCourse", () => {
    it("returns course when found", async () => {
      const course = makeCourse()
      const repo = makeRepo({ findById: jest.fn().mockResolvedValue(course) })
      const service = new CourseService(repo)

      const result = await service.getCourse("course_1")

      expect(result).toEqual({ ...course, locale: null })
    })

    it("returns null when not found", async () => {
      const service = new CourseService(makeRepo())
      expect(await service.getCourse("nonexistent")).toBeNull()
    })
  })

  describe("getCourseByHandle", () => {
    it("returns course when found", async () => {
      const course = makeCourse()
      const repo = makeRepo({ findByHandle: jest.fn().mockResolvedValue(course) })
      const service = new CourseService(repo)

      const result = await service.getCourseByHandle("test-course")

      expect(result).toEqual({ ...course, locale: null })
    })
  })

  describe("createCourse", () => {
    it("delegates to repository and returns created record", async () => {
      const created = makeCourse({ id: "course_new" })
      const repo = makeRepo({ create: jest.fn().mockResolvedValue(created) })
      const service = new CourseService(repo)

      const input = {
        handle: "new-course",
        title: "New Course",
        description: null,
        translations: null,
        thumbnail_url: null,
        thumbnail_asset: null,
        level: null,
        lessons_count: 0,
        status: "published",
        metadata: null,
      }
      const result = await service.createCourse(input)

      expect(repo.create).toHaveBeenCalledWith(input)
      expect(result).toEqual(created)
    })
  })

  describe("updateCourse", () => {
    it("returns updated record", async () => {
      const updated = makeCourse({ title: "Updated" })
      const repo = makeRepo({
        findById: jest.fn().mockResolvedValue(makeCourse()),
        update: jest.fn().mockResolvedValue(updated),
      })
      const service = new CourseService(repo)

      const result = await service.updateCourse("course_1", { title: "Updated" })

      expect(result).toEqual(updated)
    })

    it("throws when course not found", async () => {
      const service = new CourseService(makeRepo({ update: jest.fn().mockResolvedValue(null) }))
      await expect(service.updateCourse("bad_id", {})).rejects.toThrow("Course bad_id not found")
    })
  })

  describe("deleteCourse", () => {
    it("resolves when deleted successfully", async () => {
      const repo = makeRepo({ delete: jest.fn().mockResolvedValue(true) })
      const service = new CourseService(repo)
      await expect(service.deleteCourse("course_1")).resolves.toBeUndefined()
    })

    it("throws when course not found", async () => {
      const service = new CourseService(makeRepo())
      await expect(service.deleteCourse("bad_id")).rejects.toThrow("Course bad_id not found")
    })
  })
})
