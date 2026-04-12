import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { POST } from "../route"

const setCourseModuleScope = jest.fn()
const hasPurchased = jest.fn()
const createPurchase = jest.fn()
const getCourse = jest.fn()
const listCourses = jest.fn()

jest.mock("../../../../../modules/course", () => ({
  setCourseModuleScope: (...args: unknown[]) => setCourseModuleScope(...args),
  purchaseService: {
    hasPurchased: (...args: unknown[]) => hasPurchased(...args),
    createPurchase: (...args: unknown[]) => createPurchase(...args),
  },
  courseService: {
    getCourse: (...args: unknown[]) => getCourse(...args),
    listCourses: (...args: unknown[]) => listCourses(...args),
  },
}))

const makeRes = (): MedusaResponse => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  }

  return res as unknown as MedusaResponse
}

describe("POST /store/course-purchases/from-order", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("persists virtual fulfillment snapshots and course purchases", async () => {
    const query = {
      graph: jest.fn().mockResolvedValue({
        data: [
          {
            id: "order_1",
            customer_id: "cust_1",
            items: [
              {
                id: "item_resource",
                metadata: null,
                product_id: "prod_resource",
                product: {
                  id: "prod_resource",
                  handle: "resource-pack",
                  metadata: {
                    is_virtual: true,
                    virtual_product_type: "resource",
                    resource_download_url: "https://example.com/resource.zip",
                  },
                },
              },
              {
                id: "item_course",
                metadata: null,
                product_id: "prod_course",
                product: {
                  id: "prod_course",
                  handle: "course-product",
                  metadata: {
                    is_virtual: true,
                    virtual_product_type: "course",
                    virtual_course_id: "course_demo_1",
                  },
                },
              },
            ],
          },
        ],
      }),
    }

    const update = jest.fn().mockResolvedValue(1)
    const where = jest.fn().mockReturnValue({ update })
    const knex = jest.fn().mockReturnValue({ where })

    hasPurchased.mockResolvedValue(false)
    createPurchase.mockResolvedValue({ id: "cp_1" })
    getCourse.mockResolvedValue({ id: "course_demo_1", handle: "demo-course-1" })

    const req = {
      body: { order_id: "order_1" },
      params: {},
      scope: {
        resolve: jest.fn((key: unknown) => {
          if (key === "query") return query
          if (String(key).toLowerCase().includes("pg_connection")) return knex
          return knex
        }),
      },
      auth_context: { actor_id: "cust_1" },
    } as unknown as MedusaRequest
    const res = makeRes()

    await POST(req, res)

    expect(setCourseModuleScope).toHaveBeenCalledWith(req.scope)
    expect(query.graph).toHaveBeenCalled()
    expect((res.status as jest.Mock).mock.calls).toEqual([])
    expect(update).toHaveBeenCalledTimes(2)
    expect(createPurchase).toHaveBeenCalledWith({
      customer_id: "cust_1",
      course_id: "course_demo_1",
      order_id: "order_1",
      metadata: { product_id: "prod_course" },
    })
    expect((res.json as jest.Mock).mock.calls[0][0]).toMatchObject({
      created: 1,
      snapshots_updated: 2,
      warnings: [],
    })
  })
})