# 课程购买记录写入流程

> 文档日期：2026-03-22  
> 适用项目：`my-store`（后端）+ `my-store-storefront`（前端）

---

## 一、整体流程概览

```
用户点击"Place order"
       ↓
前端 placeOrder() 调用 Medusa cart.complete API
       ↓
Medusa 后端完成订单，返回 type="order"
       ↓
前端立即调用自定义接口 POST /store/course-purchases/from-order
       ↓
后端解析订单 → 提取商品 → 读取 product.metadata.course_id
       ↓
幂等查询 course_purchase 表，若未购买则插入新记录
       ↓
返回 { created: N, rows: [...] }
       ↓
用户访问付费课时时，play 接口查询 course_purchase 表，有记录则放行
```

---

## 二、数据库表结构

```sql
CREATE TABLE public.course_purchase (
    id          text        NOT NULL,
    customer_id text        NOT NULL,   -- Medusa customer id（cus_xxx）
    course_id   text        NOT NULL,   -- 自定义课程 id（course_demo_1）
    order_id    text        NULL,       -- Medusa order id，可溯源
    metadata    jsonb       NULL,       -- 扩展字段，当前存 { product_id }
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    deleted_at  timestamptz NULL,
    CONSTRAINT course_purchase_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS "IDX_course_purchase_deleted_at"
    ON course_purchase (deleted_at) WHERE deleted_at IS NULL;
```

---

## 三、商品与课程的绑定关系

课程购买的核心映射规则：**通过 `product.metadata.course_id` 找到对应课程**。

### 3.1 绑定脚本

文件：`my-store/src/scripts/link-product-course.ts`

```typescript
// 映射表：product_handle → course_id
const PRODUCT_COURSE_MAP: Record<string, string> = {
  "t-shirt":    "course_demo_1",   // Medusa T-Shirt → React 从零到一
  "sweatshirt": "course_demo_2",   // Medusa Sweatshirt → Next.js 全栈开发
}
```

**执行方式：**
```bash
cd my-store
npx medusa exec src/scripts/link-product-course.ts
```

执行后，Medusa `product` 表对应商品的 `metadata` 字段会被写入：
```json
{ "course_id": "course_demo_1" }
```

> ⚠️ 每新增一门课程+对应商品，都需要在此映射表添加记录并重新执行脚本。

---

## 四、后端核心接口

### 4.1 接口定义

- **路径：** `POST /store/course-purchases/from-order`
- **文件：** `my-store/src/api/store/course-purchases/from-order/route.ts`
- **鉴权：** 需要 `x-publishable-api-key` 头；`customer_id` 优先从 JWT 取，退而从订单字段取

### 4.2 完整执行步骤

```
Step 1  解析 JWT auth_context 获取 jwtCustomerId
Step 2  校验 body.order_id 存在
Step 3  用 query.graph 查询订单（含 customer_id + items + product.metadata）
Step 4  解析 customerId = jwtCustomerId ?? order.customer_id
Step 5  遍历订单 items，提取 product.metadata.course_id（或 item.metadata.course_id）
Step 6  去重：同一课程只处理一次
Step 7  验证课程存在（courseService.getCourse）
Step 8  幂等检查（purchaseService.hasPurchased）
Step 9  插入 course_purchase 记录
Step 10 返回 { created, rows }
```

### 4.3 关键代码

```typescript
// Step 3：查询订单含商品 metadata
const orderRes = await query.graph({
  entity: "order",
  fields: [
    "id", "customer_id",
    "items.id", "items.product_id",
    "items.product.handle", "items.product.metadata",
  ],
  filters: { id: body.order_id },
})

// Step 5：提取 course_id（优先 product 级，备用 item 级）
const courseId = item.product?.metadata?.course_id
              ?? item.metadata?.course_id

// Step 8：幂等检查
const already = await purchaseService.hasPurchased(customerId, course_id)
if (already) continue   // 已购买则跳过，不重复插入

// Step 9：插入购买记录
await purchaseService.createPurchase({
  customer_id: customerId,
  course_id,
  order_id: order.id,
  metadata: { product_id },
})
```

---

## 五、Service 层

文件：`my-store/src/modules/course/services/purchase.service.ts`

```typescript
export class PurchaseService {
  async hasPurchased(customerId: string, courseId: string): Promise<boolean> {
    return this.purchaseRepo.hasPurchased(customerId, courseId)
  }

  async createPurchase(input: CreateCoursePurchaseInput): Promise<CoursePurchaseRecord> {
    return this.purchaseRepo.create(input)
  }
}
```

---

## 六、Repository 层（实际数据库操作）

文件：`my-store/src/modules/course/repositories/purchase.orm.repository.ts`

```typescript
// 查询是否已购买（软删除感知）
async hasPurchased(customerId: string, courseId: string): Promise<boolean> {
  const row = await this.knex("course_purchase")
    .where({ customer_id: customerId, course_id: courseId })
    .whereNull("deleted_at")
    .first()
  return !!row
}

// 写入购买记录
async create(input: CreateCoursePurchaseInput): Promise<CoursePurchaseRecord> {
  const id = `cp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
  await this.knex("course_purchase").insert({
    id,
    customer_id: input.customer_id,
    course_id:   input.course_id,
    order_id:    input.order_id ?? null,
    metadata:    input.metadata ? JSON.stringify(input.metadata) : null,
    created_at:  new Date(),
    updated_at:  new Date(),
  })
  return await this.knex("course_purchase").where({ id }).first()
}
```

> 底层使用 Medusa 共享的 Knex 实例（`pg_connection`），直接操作 PostgreSQL。

---

## 七、课时播放时的鉴权校验

文件：`my-store/src/api/store/lessons/[id]/play/route.ts`

每次用户请求播放课时时：

```
1. 解析 JWT → 获取 customerId
2. 查询课时信息 → 获取 is_free、course_id
3. 若 is_free=true → 直接返回 video_url（无需购买）
4. 若 is_free=false → 查询 course_purchase 表
   - hasPurchased(customerId, course_id) = true → 返回 video_url
   - hasPurchased(customerId, course_id) = false → 返回 403
```

---

## 八、前端触发时机

文件：`my-store-storefront/src/lib/data/cart.ts`，`placeOrder()` 函数

```typescript
// 下单成功后立即调用
if (cartRes?.type === "order") {
  // 调用后端写入购买记录
  await fetch(`${BACKEND_URL}/store/course-purchases/from-order`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-publishable-api-key": PUBLISHABLE_KEY,   // ← Store 路由必须
      "authorization": authHeaders.authorization,  // ← 用户 JWT
    },
    body: JSON.stringify({ order_id: cartRes.order.id }),
  })

  // 跳转到订单确认页
  redirect(`/${countryCode}/order/${cartRes.order.id}/confirmed`)
}
```

> 该调用在 try/catch 中，失败不会阻断跳转到订单确认页。

### 虚拟产品扩展

当订单中的商品在 `product.metadata` 中被标记为虚拟商品时，`/store/course-purchases/from-order` 还会补做两件事：

1. 将虚拟交付快照写入 `order_line_item.metadata.virtual_fulfillment`
2. 如果类型为 `course`，同时写入课程购买记录，课程路径会保存为类似 `/courses/<handle>` 的相对路径

当前支持的虚拟类型 code：

| code | 含义 | 必填数据 |
|------|------|----------|
| `resource` | 数据资料 | `resource_download_url` |
| `course` | 虚拟课程 | `virtual_course_id` |

订单详情页展示时仅读取订单项快照，不再回读商品实时配置，因此商品后续修改不会影响历史订单的下载地址或课程入口。

---

## 九、调试排查指引

| 现象 | 原因 | 解决方式 |
|------|------|----------|
| `created=0, reason=no_course_id_in_product_metadata` | 商品未绑定课程 | 执行 `link-product-course.ts` 脚本 |
| `from-order` 返回 400 | 缺少 `x-publishable-api-key` | 检查前端环境变量 `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` |
| `from-order` 返回 401 | customerId 为空 | 确保用户已登录或订单有 customer_id |
| `from-order` 返回 500 `service.list is not a function` | 错误使用 `query.graph("course")` | 改用 `courseService.getCourse()` |
| 订单详情没有显示课程入口/下载按钮 | 订单项缺少 `metadata.virtual_fulfillment` | 检查商品虚拟配置是否已保存，并确认下单成功后 `from-order` 返回 `snapshots_updated > 0` |
| 购买后仍显示"购买后观看" | 前台 `purchasedCourseIds` 未刷新 | 进入课程页时预检第一个付费集的 play 接口 |

---

## 十、虚拟产品手工验证

1. 在 Admin 商品详情中打开“虚拟产品配置”，将商品设为 `resource`，填写下载地址并保存。
2. 使用该商品完成一次下单，检查 `POST /store/course-purchases/from-order` 返回结果中的 `snapshots_updated` 大于 0。
3. 打开订单确认页和账户订单详情页，确认出现“下载资料”入口，点击后能打开保存的下载地址。
4. 将商品改为 `course`，选择一个课程并保存，再次下单。
5. 打开订单详情，确认出现“进入课程学习”入口，链接应跳转到 `/<countryCode>/courses/<handle>`。
6. 返回课程详情页验证：已购买用户可以学习，未购买用户仍保持原有“请先购买课程”行为。
