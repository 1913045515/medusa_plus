import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { setCourseModuleScope, purchaseService, courseService } from "../../../../modules/course"
import {
  buildCourseRelativePath,
  buildVirtualOrderFulfillmentSnapshot,
  mergeOrderLineVirtualMetadata,
  readVirtualProductConfig,
  type VirtualOrderFulfillmentSnapshot,
} from "../../../../modules/virtual-product"

type Body = {
  order_id: string
}

type PurchaseCandidate = {
  course_id: string
  product_id: string | null
}

type SnapshotCandidate = {
  item_id: string
  snapshot: VirtualOrderFulfillmentSnapshot
  product_id: string | null
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)

  const authContext = (req as any).auth_context
  const jwtCustomerId = authContext?.actor_id

  console.log("[course-purchases/from-order] called")
  console.log("[course-purchases/from-order] jwtCustomerId=", jwtCustomerId)

  const body = (req.body ?? {}) as Body
  console.log("[course-purchases/from-order] body=", body)

  if (!body.order_id) {
    return res.status(400).json({ message: "Missing order_id" })
  }

  try {
    const query = req.scope.resolve("query") as any

    // 1. 取订单（含 customer_id + items + product metadata）
    const orderRes = await query.graph({
      entity: "order",
      fields: [
        "id",
        "customer_id",
        "items.id",
        "items.metadata",
        "items.product_id",
        "items.product.id",
        "items.product.handle",
        "items.product.metadata",
      ],
      filters: { id: body.order_id },
    })

    const order = (orderRes?.data ?? [])[0]
    console.log("[course-purchases/from-order] order found=", Boolean(order))
    console.log("[course-purchases/from-order] order.customer_id=", order?.customer_id)

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // 优先 JWT customerId，退而用订单的 customer_id（兼容匿名下单）
    const customerId = jwtCustomerId ?? order.customer_id
    console.log("[course-purchases/from-order] resolved customerId=", customerId)

    if (!customerId) {
      return res.status(401).json({ message: "Cannot determine customer" })
    }

    const items: any[] = order.items ?? []
    console.log("[course-purchases/from-order] items count=", items.length)

    // 2. 从 items 里提取 course_id
    //    映射策略（按优先级）：
    //    a. item.product.metadata.course_id  ← 推荐，由 link-product-course 脚本写入
    //    b. item.metadata.course_id          ← 备用（行级覆盖）
    const toCreate: PurchaseCandidate[] = []
    const snapshotsToPersist: SnapshotCandidate[] = []
    const warnings: Array<{ item_id: string; reason: string }> = []

    for (const item of items) {
      const productMeta = item.product?.metadata ?? {}
      const virtualConfig = readVirtualProductConfig(productMeta)
      // SSOT: course_id comes from product.metadata.virtual_course_id only
      let courseId: string | undefined = virtualConfig.virtual_course_id ?? undefined
      let resolvedCoursePath: string | null = virtualConfig.virtual_course_path

      if (virtualConfig.virtual_product_type === "course") {
        if (!courseId) {
          warnings.push({ item_id: item.id, reason: "missing_virtual_course_id" })
        } else if (!resolvedCoursePath) {
          // virtual_course_path was not saved in metadata yet — resolve from course handle
          const course = await courseService.getCourse(courseId)
          if (!course) {
            warnings.push({ item_id: item.id, reason: "virtual_course_not_found" })
          } else {
            resolvedCoursePath = buildCourseRelativePath(course.handle)
          }
        }
      }

      const snapshot = buildVirtualOrderFulfillmentSnapshot({
        ...virtualConfig,
        virtual_course_id: virtualConfig.virtual_product_type === "course" ? courseId ?? null : null,
        virtual_course_path: virtualConfig.virtual_product_type === "course" ? resolvedCoursePath : null,
      })

      console.log("[course-purchases/from-order] item:", {
        item_id: item.id,
        product_id: item.product_id,
        product_handle: item.product?.handle,
        product_metadata: productMeta,
        resolved_course_id: courseId ?? null,
        virtual_snapshot: snapshot,
      })

      if (snapshot) {
        snapshotsToPersist.push({
          item_id: item.id,
          snapshot,
          product_id: item.product_id ?? null,
        })
      }

      if (courseId) {
        // 去重：同一课程只写一条
        if (!toCreate.find((t) => t.course_id === courseId)) {
          toCreate.push({ course_id: courseId, product_id: item.product_id ?? null })
        }
      }
    }

    console.log("[course-purchases/from-order] toCreate=", toCreate)
    console.log("[course-purchases/from-order] snapshotsToPersist=", snapshotsToPersist)

    if (!toCreate.length && !snapshotsToPersist.length) {
      // 无课程商品或虚拟商品快照，返回当前所有课程供排查
      const allCourses = await courseService.listCourses()
      console.log(
        "[course-purchases/from-order] no course_id in metadata. available courses=",
        allCourses.map((c) => ({ id: c.id, handle: c.handle }))
      )
      return res.json({
        created: 0,
        snapshots_updated: 0,
        reason: "no_course_id_in_product_metadata",
        tip: "请运行 npx medusa exec src/scripts/link-product-course.ts 给商品绑定课程 ID",
        available_courses: allCourses.map((c) => ({ id: c.id, handle: c.handle, title: c.title })),
        warnings,
      })
    }

    const knex = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION ?? "pg_connection") as any
    let snapshotsUpdated = 0

    for (const item of items) {
      const snapshotMatch = snapshotsToPersist.find((entry) => entry.item_id === item.id)
      if (!snapshotMatch) {
        continue
      }

      const nextMetadata = mergeOrderLineVirtualMetadata(item.metadata ?? {}, snapshotMatch.snapshot)
      await knex("order_line_item")
        .where({ id: item.id })
        .update({ metadata: nextMetadata, updated_at: new Date() })

      snapshotsUpdated++
    }

    // 3. 验证课程存在 + 幂等写入
    let created = 0
    const createdRows: any[] = []

    for (const { course_id, product_id } of toCreate) {
      const course = await courseService.getCourse(course_id)
      if (!course) {
        console.log("[course-purchases/from-order] course not found, skip:", course_id)
        continue
      }

      const already = await purchaseService.hasPurchased(customerId, course_id)
      if (already) {
        console.log("[course-purchases/from-order] already purchased, skip:", { customerId, course_id })
        continue
      }

      await purchaseService.createPurchase({
        customer_id: customerId,
        course_id,
        order_id: order.id,
        metadata: product_id ? { product_id } : null,
      })

      created++
      createdRows.push({ course_id, product_id })
    }

    console.log("[course-purchases/from-order] done. created=", created, "snapshotsUpdated=", snapshotsUpdated, "rows=", createdRows)
    return res.json({ created, snapshots_updated: snapshotsUpdated, rows: createdRows, warnings })
  } catch (e: any) {
    console.error("[course-purchases/from-order] failed:", e)
    return res.status(500).json({ message: e?.message ?? "Internal Server Error" })
  }
}
