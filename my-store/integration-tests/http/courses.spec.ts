import { medusaIntegrationTestRunner } from "@medusajs/test-utils"

jest.setTimeout(60 * 1000)

medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api }) => {
    // ── GET /store/courses ─────────────────────────────────────────────────
    describe("GET /store/courses", () => {
      it("returns 200 with courses array", async () => {
        const response = await api.get("/store/courses")

        expect(response.status).toEqual(200)
        expect(response.data).toHaveProperty("courses")
        expect(Array.isArray(response.data.courses)).toBe(true)
        expect(response.data).toHaveProperty("count")
      })

      it("each course has required fields", async () => {
        const response = await api.get("/store/courses")
        const course = response.data.courses[0]

        expect(course).toHaveProperty("id")
        expect(course).toHaveProperty("handle")
        expect(course).toHaveProperty("title")
        expect(course).toHaveProperty("status")
      })

      it("only returns published courses", async () => {
        const response = await api.get("/store/courses")

        response.data.courses.forEach((c: { status: string }) => {
          expect(c.status).toEqual("published")
        })
      })
    })

    // ── GET /store/courses/:id/lessons ─────────────────────────────────────
    describe("GET /store/courses/:id/lessons", () => {
      it("returns 200 with lessons for a valid course", async () => {
        const response = await api.get("/store/courses/course_demo_1/lessons")

        expect(response.status).toEqual(200)
        expect(response.data).toHaveProperty("lessons")
        expect(Array.isArray(response.data.lessons)).toBe(true)
        expect(response.data.count).toBeGreaterThan(0)
      })

      it("lessons are sorted by episode_number ascending", async () => {
        const response = await api.get("/store/courses/course_demo_1/lessons")
        const lessons: Array<{ episode_number: number }> = response.data.lessons

        for (let i = 1; i < lessons.length; i++) {
          expect(lessons[i].episode_number).toBeGreaterThan(lessons[i - 1].episode_number)
        }
      })

      it("lessons do NOT expose video_url", async () => {
        const response = await api.get("/store/courses/course_demo_1/lessons")

        response.data.lessons.forEach((l: Record<string, unknown>) => {
          expect(l).not.toHaveProperty("video_url")
        })
      })

      it("each lesson has required public fields", async () => {
        const response = await api.get("/store/courses/course_demo_1/lessons")
        const lesson = response.data.lessons[0]

        expect(lesson).toHaveProperty("id")
        expect(lesson).toHaveProperty("course_id")
        expect(lesson).toHaveProperty("title")
        expect(lesson).toHaveProperty("episode_number")
        expect(lesson).toHaveProperty("duration")
        expect(lesson).toHaveProperty("is_free")
      })

      it("returns empty lessons array for unknown course", async () => {
        const response = await api.get("/store/courses/nonexistent_course/lessons")

        expect(response.status).toEqual(200)
        expect(response.data.lessons).toEqual([])
        expect(response.data.count).toEqual(0)
      })
    })

    // ── GET /store/lessons/:id/play ────────────────────────────────────────
    describe("GET /store/lessons/:id/play", () => {
      it("returns 200 with video_url for a free lesson", async () => {
        const response = await api.get("/store/lessons/lesson_c1_1/play")

        expect(response.status).toEqual(200)
        expect(response.data).toHaveProperty("video_url")
        expect(typeof response.data.video_url).toBe("string")
      })

      it("returns 401 for paid lesson when not authenticated", async () => {
        const response = await api
          .get("/store/lessons/lesson_c1_3/play")
          .catch((e: { response: { status: number } }) => e.response)

        expect(response.status).toEqual(401)
      })

      it("returns 403 for paid lesson when authenticated but not purchased", async () => {
        // 这里不走真实登录流程，直接模拟 auth_context。
        // medusaIntegrationTestRunner 的 api 客户端支持在 headers 注入 actor id。
        const response = await api
          .get("/store/lessons/lesson_c1_3/play", {
            headers: {
              "x-medusa-test-actor-id": "cust_test_1",
            },
          })
          .catch((e: { response: { status: number } }) => e.response)

        expect(response.status).toEqual(403)
      })
    })
  },
})
