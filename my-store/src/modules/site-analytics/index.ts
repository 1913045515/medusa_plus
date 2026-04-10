import { Module } from "@medusajs/framework/utils"
import { SiteAnalyticsOrmRepository } from "./repositories/site-analytics.orm.repository"
import { SiteAnalyticsService } from "./services/site-analytics.service"
import SiteAnalyticsModuleService from "./service"

export * from "./types"

export const SITE_ANALYTICS_MODULE = "siteAnalytics"

export default Module(SITE_ANALYTICS_MODULE, {
  service: SiteAnalyticsModuleService,
})

let _scope: any = null

export const setSiteAnalyticsModuleScope = (scope: any) => {
  _scope = scope
}

const analyticsRepo = new SiteAnalyticsOrmRepository({
  resolve: (key: any) => _scope.resolve(key),
})

export const siteAnalyticsService = new SiteAnalyticsService(analyticsRepo)