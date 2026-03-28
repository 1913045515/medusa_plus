/**
 * 前端 data 层单元测试规范
 * 测试命令: jest src/lib/data/__tests__/
 */
import { getCourseLessons, getLessonPlayUrl } from "../lessons"
import type { Lesson } from "types/lesson"

// ── helpers ───────────────────────────────────────────────────────────────────

const makeLesson = (overrides: Partial<Lesson> = {}): Lesson => ({
  id: "lesson_1",
  course_id: "course_1",
  title: "第1集：测试",
  description: null,
  episode_number: 1,
  duration: 600,
  is_free: true,
  thumbnail_url: null,
  video_url: null,
  status: "published",
  metadata: {},
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  ...overrides,
})

// ── mock fetch ────────────────────────────────────────────────────────────────

const mockFetch = (status: number, body: unknown) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  })
}

afterEach(() => jest.restoreAllMocks())

// ── getCourseLessons ──────────────────────────────────────────────────────────

describe("getCourseLessons", () => {
  it("returns lessons array on 200", async () => {
    const lessons = [makeLesson()]
    mockFetch(200, { lessons, count: 1 })

    const result = await getCourseLessons("course_1")

    expect(result).toEqual(lessons)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/store/courses/course_1/lessons"),
      expect.any(Object)
    )
  })

  it("returns empty array on non-200 response", async () => {
    mockFetch(500, { message: "Internal Server Error" })

    const result = await getCourseLessons("course_1")

    expect(result).toEqual([])
  })

  it("returns empty array when lessons field is missing", async () => {
    mockFetch(200, {})

    const result = await getCourseLessons("course_1")

    expect(result).toEqual([])
  })
})

// ── getLessonPlayUrl ──────────────────────────────────────────────────────────

describe("getLessonPlayUrl", () => {
  it("returns video_url on 200", async () => {
    mockFetch(200, { video_url: "https://cdn.example.com/video.mp4" })

    const result = await getLessonPlayUrl("lesson_1")

    expect(result).toEqual({ video_url: "https://cdn.example.com/video.mp4" })
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/store/lessons/lesson_1/play"),
      expect.any(Object)
    )
  })

  it("returns error with code 401 when not authenticated", async () => {
    mockFetch(401, { message: "请先登录" })

    const result = await getLessonPlayUrl("lesson_2")

    expect(result).toEqual({ error: "请先登录", code: 401 })
  })

  it("returns error with code 403 when not purchased", async () => {
    mockFetch(403, { message: "请先购买课程" })

    const result = await getLessonPlayUrl("lesson_3")

    expect(result).toEqual({ error: "请先购买课程", code: 403 })
  })

  it("uses fallback error message when message field missing", async () => {
    mockFetch(403, {})

    const result = await getLessonPlayUrl("lesson_4")

    expect(result).toEqual({ error: "Failed to fetch video", code: 403 })
  })
})
