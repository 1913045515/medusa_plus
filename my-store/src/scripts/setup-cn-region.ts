/**
 * 为现有 Medusa 实例新增「人民币 / 中国大陆」配置。
 *
 * 用法：
 *   cd my-store
 *   npx medusa exec ./src/scripts/setup-cn-region.ts
 *
 * 通过环境变量可定制（不写死任何业务参数）：
 *   CN_REGION_NAME              区域名称，默认 "China"
 *   CN_REGION_CURRENCY          区域币种代码，默认 "cny"
 *   CN_REGION_COUNTRIES         区域包含的国家，逗号分隔，默认 "cn"
 *   CN_SET_AS_DEFAULT_CURRENCY  true → 把人民币设为店铺默认币种（默认 false）
 *   CN_PAYMENT_PROVIDERS        逗号分隔；默认会包含 pp_wechat_wechat（如未启用微信
 *                                则退回到 pp_system_default 以保证可下单）
 *
 * 本脚本「幂等」：重复执行不会重复创建，已存在则跳过。
 */
import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  createRegionsWorkflow,
  createTaxRegionsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"

function parseList(value: string | undefined, fallback: string[]): string[] {
  if (!value) return fallback
  return value
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export default async function setupCnRegion({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const storeService = container.resolve(Modules.STORE) as any
  const regionService = container.resolve(Modules.REGION) as any

  const regionName = process.env.CN_REGION_NAME || "China"
  const currencyCode = (process.env.CN_REGION_CURRENCY || "cny").toLowerCase()
  const countries = parseList(process.env.CN_REGION_COUNTRIES, ["cn"])
  const setAsDefault = process.env.CN_SET_AS_DEFAULT_CURRENCY === "true"

  // 微信支付 provider id 在 Medusa Payment 模块注册后通常变成 `pp_wechat_wechat`
  const requestedProviders = parseList(
    process.env.CN_PAYMENT_PROVIDERS,
    ["pp_wechat_wechat"]
  )

  // ──────────────────────────────────────────────
  // 1) Store currencies：把 CNY 加进去
  // ──────────────────────────────────────────────
  const [store] = await storeService.listStores()
  if (!store) {
    throw new Error("Store 未初始化，请先执行 npm run seed")
  }

  const existingCurrencies: Array<{ currency_code: string; is_default?: boolean }> =
    store.supported_currencies ?? []
  const hasCny = existingCurrencies.some((c) => c.currency_code === currencyCode)

  let updatedCurrencies = existingCurrencies.map((c) => ({
    currency_code: c.currency_code,
    is_default: setAsDefault ? c.currency_code === currencyCode : !!c.is_default,
  }))

  if (!hasCny) {
    updatedCurrencies.push({
      currency_code: currencyCode,
      is_default: setAsDefault,
    })
  }

  // 校验：必须恰好一个默认币种
  if (setAsDefault) {
    updatedCurrencies = updatedCurrencies.map((c) => ({
      ...c,
      is_default: c.currency_code === currencyCode,
    }))
  } else if (!updatedCurrencies.some((c) => c.is_default)) {
    updatedCurrencies[0].is_default = true
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: { supported_currencies: updatedCurrencies },
    },
  })
  logger.info(
    `[setup-cn-region] Store 币种已更新：${updatedCurrencies
      .map((c) => `${c.currency_code}${c.is_default ? "*" : ""}`)
      .join(", ")}（* = 默认）`
  )

  // ──────────────────────────────────────────────
  // 2) 校验 / 过滤支付提供方
  // ──────────────────────────────────────────────
  let payment_providers = requestedProviders
  try {
    const paymentService = container.resolve(Modules.PAYMENT) as any
    const installed = await paymentService.listPaymentProviders({})
    const installedIds = new Set<string>(installed.map((p: any) => p.id))
    const filtered = requestedProviders.filter((id) => installedIds.has(id))
    if (filtered.length === 0) {
      logger.warn(
        `[setup-cn-region] 请求的支付提供方 [${requestedProviders.join(", ")}] 均未安装，` +
          `回退到 pp_system_default 以保证区域可用`
      )
      payment_providers = ["pp_system_default"]
    } else {
      payment_providers = filtered
    }
  } catch (err: any) {
    logger.warn(
      `[setup-cn-region] 无法读取已安装支付提供方，沿用请求值：${err?.message ?? err}`
    )
  }

  // ──────────────────────────────────────────────
  // 3) 创建 / 复用 Region
  // ──────────────────────────────────────────────
  const existingRegions = await regionService.listRegions({ name: regionName })
  if (existingRegions.length > 0) {
    logger.info(
      `[setup-cn-region] Region "${regionName}" 已存在 (id=${existingRegions[0].id})，跳过创建`
    )
  } else {
    await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: regionName,
            currency_code: currencyCode,
            countries,
            payment_providers,
          },
        ],
      },
    })
    logger.info(
      `[setup-cn-region] 已创建 Region "${regionName}" (${currencyCode.toUpperCase()}, ${countries.join(", ")}, providers=${payment_providers.join(", ")})`
    )
  }

  // ──────────────────────────────────────────────
  // 4) Tax Region：每个国家一条
  // ──────────────────────────────────────────────
  try {
    await createTaxRegionsWorkflow(container).run({
      input: countries.map((country_code) => ({
        country_code,
        provider_id: "tp_system",
      })),
    })
    logger.info(`[setup-cn-region] Tax regions 已就绪：${countries.join(", ")}`)
  } catch (err: any) {
    const msg = err?.message ?? ""
    if (msg.includes("already") || msg.includes("duplicate")) {
      logger.warn("[setup-cn-region] Tax regions 已存在，跳过")
    } else {
      throw err
    }
  }

  logger.info(
    `[setup-cn-region] 完成。下一步：在 Admin 后台为产品/运费配置 ${currencyCode.toUpperCase()} 价格，` +
      `并把 storefront 的 NEXT_PUBLIC_DEFAULT_REGION 设为 "cn"（小写）。`
  )
}
