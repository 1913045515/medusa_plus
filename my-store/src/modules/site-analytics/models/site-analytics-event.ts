import { model } from "@medusajs/framework/utils"

const SiteAnalyticsEvent = model.define("site_analytics_event", {
  id: model.id().primaryKey(),
  event_type: model.text(),
  visitor_id: model.text(),
  session_id: model.text().nullable(),
  path: model.text(),
  full_path: model.text().nullable(),
  country_code: model.text().nullable(),
  duration_seconds: model.number().nullable(),
  referrer: model.text().nullable(),
  user_agent: model.text().nullable(),
  ip_address: model.text().nullable(),
  occurred_at: model.dateTime(),
  metadata: model.json().nullable(),
})

export default SiteAnalyticsEvent