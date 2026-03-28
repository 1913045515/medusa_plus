import { model } from "@medusajs/framework/utils"

// 购买记录（customer -> course）
// 用于播放鉴权：付费课时必须存在购买记录才可播放。
const CoursePurchase = model.define("course_purchase", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  course_id: model.text(),
  order_id: model.text().nullable(),
  metadata: model.json().nullable(),
})

export default CoursePurchase
