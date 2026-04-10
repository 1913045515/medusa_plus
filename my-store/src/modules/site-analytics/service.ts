import { MedusaService } from "@medusajs/framework/utils"
import SiteAnalyticsEvent from "./models/site-analytics-event"

class SiteAnalyticsModuleService extends MedusaService({
  SiteAnalyticsEvent,
}) {}

export default SiteAnalyticsModuleService