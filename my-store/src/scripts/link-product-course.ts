import { ExecArgs } from "@medusajs/framework/types"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * 脚本：给商品绑定课程 ID（写入 product.metadata.course_id）
 * 运行：npx medusa exec src/scripts/link-product-course.ts
 *
 * 映射表：product_handle → course_id
 * 按需修改下方 PRODUCT_COURSE_MAP
 */
const PRODUCT_COURSE_MAP: Record<string, string> = {
  "t-shirt": "course_demo_1",
  "sweatshirt": "course_demo_2",
}

export default async function linkProductCourse({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule = container.resolve(Modules.PRODUCT) as any

  logger.info("开始绑定商品与课程...")

  for (const [handle, courseId] of Object.entries(PRODUCT_COURSE_MAP)) {
    // 查询商品
    const [product] = await productModule.listProducts(
      { handle },
      { select: ["id", "handle", "metadata"] }
    )

    if (!product) {
      logger.warn(`商品不存在，跳过：handle=${handle}`)
      continue
    }

    const existingMeta = product.metadata ?? {}

    if (existingMeta.course_id === courseId) {
      logger.info(`已绑定，跳过：${handle} → ${courseId}`)
      continue
    }

    // 更新 metadata
    await productModule.updateProducts(product.id, {
      metadata: {
        ...existingMeta,
        course_id: courseId,
      },
    })

    logger.info(`绑定成功：${handle} (${product.id}) → course_id=${courseId}`)
  }

  logger.info("绑定完成！")
}
