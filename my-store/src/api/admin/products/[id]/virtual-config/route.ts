import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { courseService, setCourseModuleScope } from "../../../../../modules/course"
import {
  buildCourseRelativePath,
  mergeVirtualProductMetadata,
  readVirtualProductConfig,
  validateVirtualProductInput,
  type VirtualProductInput,
} from "../../../../../modules/virtual-product"

const getProductModule = (scope: MedusaRequest["scope"]) => {
  return scope.resolve(Modules.PRODUCT) as any
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const productModule = getProductModule(req.scope)
  const product = await productModule.retrieveProduct(req.params.id, {
    select: ["id", "metadata"],
  })

  res.json({
    config: readVirtualProductConfig(product?.metadata ?? null),
  })
}

/**
 * PUT /admin/products/:id/virtual-config
 *
 * SSOT: product.metadata stores virtual product config.
 * Bidirectional sync: course.metadata.linked_product_id is updated so that
 * the course detail page can display which product is linked (read-only).
 *
 * Full sync rules:
 *   A. Old course → changed/removed:
 *      Clear old course's linked_product_id / linked_product_handle.
 *   B. New course → assigned:
 *      If course was previously linked to a DIFFERENT product, clear that
 *      product's virtual course config first (remove the stale link).
 *      Then write linked_product_id/handle to the new course.
 */
export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  const productModule = getProductModule(req.scope)
  const productId = req.params.id
  const body = (req.body ?? {}) as VirtualProductInput

  try {
    // Always set scope first — courseService needs it throughout this handler
    setCourseModuleScope(req.scope)

    // 1. Fetch current product to determine previous state
    const product = await productModule.retrieveProduct(productId, {
      select: ["id", "handle", "metadata"],
    })
    const currentMetadata = (product?.metadata ?? {}) as Record<string, unknown>
    const productHandle: string = product?.handle ?? ""
    const oldConfig = readVirtualProductConfig(currentMetadata)
    const oldCourseId = oldConfig.virtual_course_id

    // 2. Resolve new course (if type=course)
    let coursePath: string | null = null
    let newCourseId: string | null = null
    if (body.is_virtual === true && body.virtual_product_type === "course") {
      const selectedCourse = await courseService.getCourse(String(body.virtual_course_id || ""))
      if (!selectedCourse) {
        return res.status(400).json({ message: "Selected course not found" })
      }
      coursePath = buildCourseRelativePath(selectedCourse.handle)
      newCourseId = selectedCourse.id
    }

    // 3. Validate and write new config to product metadata
    const config = validateVirtualProductInput(body, { coursePath })
    const metadata = mergeVirtualProductMetadata(currentMetadata, config)
    await productModule.updateProducts(productId, { metadata })

    // ── Bidirectional sync ────────────────────────────────────────────────────

    // Rule A: Clear old course's link when the course changed or was removed
    if (oldCourseId && oldCourseId !== newCourseId) {
      const oldCourse = await courseService.getCourse(oldCourseId)
      if (oldCourse) {
        const oldCourseMeta = { ...(oldCourse.metadata ?? {}) }
        delete oldCourseMeta.linked_product_id
        delete oldCourseMeta.linked_product_handle
        await courseService.updateCourse(oldCourseId, { metadata: oldCourseMeta })
      }
    }

    // Rule B: Assign new course and fix up any stale link on its previous product
    if (newCourseId) {
      const newCourse = await courseService.getCourse(newCourseId)
      if (newCourse) {
        // If this course was previously linked to a DIFFERENT product, clear that
        // product's virtual course fields so it no longer appears as a course product.
        const prevLinkedProductId =
          typeof newCourse.metadata?.linked_product_id === "string" &&
          newCourse.metadata.linked_product_id
            ? newCourse.metadata.linked_product_id
            : null

        if (prevLinkedProductId && prevLinkedProductId !== productId) {
          try {
            const prevProduct = await productModule.retrieveProduct(prevLinkedProductId, {
              select: ["id", "metadata"],
            })
            if (prevProduct) {
              const prevMeta = (prevProduct.metadata ?? {}) as Record<string, unknown>
              const prevConfig = readVirtualProductConfig(prevMeta)
              // Only clear if the stale product still points to this same course
              if (prevConfig.virtual_course_id === newCourseId) {
                const clearedMeta = mergeVirtualProductMetadata(prevMeta, {
                  is_virtual: false,
                  virtual_product_type: null,
                  resource_download_url: null,
                  virtual_course_id: null,
                  virtual_course_path: null,
                })
                await productModule.updateProducts(prevLinkedProductId, { metadata: clearedMeta })
              }
            }
          } catch {
            // Best-effort: don't fail the whole operation if stale-product cleanup fails
          }
        }

        // Write this product's info into the new course's metadata
        const newCourseMeta = {
          ...(newCourse.metadata ?? {}),
          linked_product_id: productId,
          linked_product_handle: productHandle,
        }
        await courseService.updateCourse(newCourseId, { metadata: newCourseMeta })
      }
    }

    res.json({ config })
  } catch (error: any) {
    res.status(400).json({ message: error?.message ?? "Invalid virtual product config" })
  }
}
