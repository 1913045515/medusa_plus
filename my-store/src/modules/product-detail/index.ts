import { ProductDetailOrmRepository } from "./repositories/product-detail.orm.repository"
import { ProductImageMetaOrmRepository } from "./repositories/product-image-meta.orm.repository"
import { ProductDetailService } from "./services/product-detail.service"
import { ProductImageMetaService } from "./services/product-image-meta.service"
import { Module } from "@medusajs/framework/utils"
import ProductDetailModuleService from "./service"

export const PRODUCT_DETAIL_MODULE = "productDetail"

export default Module(PRODUCT_DETAIL_MODULE, {
  service: ProductDetailModuleService,
})

// ── ORM-backed singleton services (same pattern as course module) ────────────

let _scope: any = null
export const setProductDetailModuleScope = (scope: any) => {
  _scope = scope
}

const detailRepo = new ProductDetailOrmRepository({ resolve: (k: any) => _scope.resolve(k) })
const imageMetaRepo = new ProductImageMetaOrmRepository({ resolve: (k: any) => _scope.resolve(k) })

export const productDetailService = new ProductDetailService(detailRepo)
export const productImageMetaService = new ProductImageMetaService(imageMetaRepo)
