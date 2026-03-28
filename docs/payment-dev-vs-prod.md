# 支付模式说明：开发免支付 vs 线上真实支付

> 文档日期：2026-03-22  
> 适用项目：`my-store`（后端）+ `my-store-storefront`（前端）

---

## 一、开发模式"免支付下单"的本质

本地开发之所以能点击"Place order"直接成功，**不是代码绕过了支付**，而是使用了 Medusa 内置的 **`pp_system_default`（Manual Payment Provider）**。

这个支付提供者的逻辑很简单：**收到支付请求直接标记为成功，不调用任何外部支付网关**。Medusa 官方专门为本地开发/测试设计了它。

---

## 二、完整的支付流程链路

### 2.1 整体流程

```
后端配置 pp_system_default 支付提供者
       ↓
seed.ts 创建 Region 时注册 pp_system_default
       ↓
前端 Checkout 发起支付 session
       ↓
Medusa 返回 provider_id = "pp_system_default"
       ↓
前端 constants.tsx 的 isManual() 判断为 true
       ↓
渲染 ManualTestPaymentButton（没有卡号输入框）
       ↓
用户点击"Place order"→ 直接调用 placeOrder()
       ↓
placeOrder() 调用 cart.complete() → 订单完成
       ↓
前端调用 /store/course-purchases/from-order 写入购买记录
```

---

## 三、后端配置入口

### 3.1 seed.ts 注册支付提供者

文件：`my-store/src/scripts/seed.ts`

```typescript
await createRegionsWorkflow(container).run({
  input: {
    regions: [
      {
        name: "Europe",
        currency_code: "eur",
        countries: ["gb", "de", "dk", "se", "fr", "es", "it"],
        payment_providers: ["pp_system_default"],  // ← 关键：注册免支付提供者
      },
    ],
  },
})
```

`pp_system_default` 是 Medusa 框架内置的 Manual Payment Provider，**只要在 Region 里注册了它，该 Region 下的所有订单就可以使用免支付结账**。

### 3.2 medusa-config.ts 无需额外配置

`pp_system_default` 是 Medusa 核心内置模块，`medusa-config.ts` 里不需要声明，开箱即用。

---

## 四、前端判断逻辑

### 4.1 支付提供者识别

文件：`my-store-storefront/src/lib/constants.tsx`

```typescript
// 识别是否是免支付模式（provider_id 以 pp_system_default 开头）
export const isManual = (providerId?: string) => {
  return providerId?.startsWith("pp_system_default")
}

// 识别是否是 Stripe 真实支付
export const isStripeLike = (providerId?: string) => {
  return (
    providerId?.startsWith("pp_stripe_") ||
    providerId?.startsWith("pp_medusa-")
  )
}
```

### 4.2 支付按钮路由分发

文件：`my-store-storefront/src/modules/checkout/components/payment-button/index.tsx`

```typescript
const PaymentButton = ({ cart }) => {
  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isStripeLike(paymentSession?.provider_id):
      // 渲染 Stripe 真实支付按钮（需要填卡号）
      return <StripePaymentButton ... />

    case isManual(paymentSession?.provider_id):
      // 渲染 Manual 免支付按钮（直接下单）
      return <ManualTestPaymentButton ... />

    default:
      return <Button disabled>Select a payment method</Button>
  }
}
```

### 4.3 ManualTestPaymentButton 实现

```typescript
const ManualTestPaymentButton = ({ notReady }) => {
  const handlePayment = () => {
    setSubmitting(true)
    onPaymentCompleted()  // ← 直接调用，无任何支付验证
  }

  const onPaymentCompleted = async () => {
    await placeOrder()    // ← 直接完成订单
  }

  return (
    <Button onClick={handlePayment}>
      Place order
    </Button>
  )
}
```

**对比 StripePaymentButton：**

```typescript
// Stripe 支付按钮需要先调用 stripe.confirmCardPayment()
// 等 Stripe 返回 succeeded 后，才调用 placeOrder()
await stripe.confirmCardPayment(session.data.client_secret, {
  payment_method: { card, billing_details }
}).then(({ paymentIntent }) => {
  if (paymentIntent.status === "succeeded") {
    onPaymentCompleted()  // ← 支付验证通过后才下单
  }
})
```

---

## 五、开发环境配置清单

确保以下配置正确，开发模式才能正常免支付下单：

### 5.1 后端 .env

```bash
# my-store/.env
DATABASE_URL=postgres://xxx:xxx@localhost:5432/medusa_db
JWT_SECRET=your_jwt_secret
COOKIE_SECRET=your_cookie_secret

# 无需配置 Stripe 相关变量
```

### 5.2 前端 .env.local

```bash
# my-store-storefront/.env.local
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxxxxxxxxxxxx   # ← 从后台 Settings > API Keys 获取
```

### 5.3 确认 Region 已注册 pp_system_default

进入 Medusa Admin（`http://localhost:9000/app`）→ Settings → Regions → Europe，
确认 Payment Providers 中包含 **Manual Payment**。

---

## 六、线上真实支付接入指南

线上环境需要接入真实支付网关（如 Stripe），步骤如下：

### Step 1：安装 Stripe 插件

```bash
cd my-store
npm install @medusajs/payment-stripe
```

### Step 2：配置 medusa-config.ts

```typescript
// my-store/medusa-config.ts
import { defineConfig } from "@medusajs/framework/utils"

export default defineConfig({
  // ...
  modules: [
    {
      resolve: "@medusajs/payment-stripe",
      options: {
        apiKey: process.env.STRIPE_API_KEY,      // ← Stripe 后台的 Secret Key
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      },
    },
  ],
})
```

### Step 3：配置后端 .env

```bash
# my-store/.env（线上）
STRIPE_API_KEY=sk_live_xxxxxxxxxxxxxxx        # Stripe Secret Key（线上用 sk_live_）
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxx   # Stripe Webhook 签名密钥
```

### Step 4：在 Medusa Admin 中将 Stripe 加入 Region

1. 进入 `http://your-domain/app` → Settings → Regions
2. 选择你的 Region → Edit → Payment Providers
3. 勾选 **Stripe** → Save

### Step 5：配置前端 .env（线上）

```bash
# my-store-storefront/.env.production
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://your-backend-domain.com
NEXT_PUBLIC_STRIPE_KEY=pk_live_xxxxxxxxxxxxxxx   # Stripe Publishable Key（线上用 pk_live_）
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxxxxx
```

### Step 6：前端渲染 Stripe 支付表单

当 payment session 的 `provider_id` 是 `pp_stripe_stripe` 时，`PaymentButton` 组件会自动渲染 `StripePaymentButton`，展示信用卡输入框，用户填写卡号后点击 Place order 走真实扣款流程。

---

## 七、开发 vs 线上对比总结

| 对比项 | 开发模式（Manual） | 线上模式（Stripe） |
|--------|-------------------|--------------------|
| 支付提供者 | `pp_system_default` | `pp_stripe_stripe` |
| 配置位置 | `seed.ts` Region 注册 | `medusa-config.ts` + Admin Region |
| 前端按钮 | `ManualTestPaymentButton` | `StripePaymentButton` |
| 支付验证 | 无，直接下单 | 调用 Stripe confirmCardPayment |
| 需要密钥 | 不需要 | `STRIPE_API_KEY` + `NEXT_PUBLIC_STRIPE_KEY` |
| 适用场景 | 本地开发、功能测试 | 生产环境、真实交易 |
| 购买记录写入 | ✅ 相同逻辑，正常写入 | ✅ 相同逻辑，正常写入 |

> 💡 **关键点**：不管是 Manual 还是 Stripe，只要 `cart.complete()` 返回 `type="order"`，`placeOrder()` 都会调用 `/store/course-purchases/from-order` 写入课程购买记录，两种模式的购买记录逻辑完全一致。

---

## 八、Webhook 说明（线上必须配置）

线上使用 Stripe 时，支付可能因网络问题延迟确认。需要配置 Stripe Webhook，让 Stripe 在支付完成后主动通知后端：

```bash
# Stripe Dashboard → Webhooks → Add endpoint
# Endpoint URL: https://your-backend/hooks/payment/stripe_stripe
# Events: payment_intent.succeeded, payment_intent.payment_failed
```

Medusa 的 Stripe 插件会自动处理 Webhook 事件并更新订单状态。
