# PayPal 支付接入说明

> 文档日期：2026-04-07  
> 适用项目：my-store + my-store-storefront

## 1. 当前项目里实际集成了什么支付方式

先说结论：当前项目真正启用的支付方式只有 Medusa 内置的 Manual Payment，也就是免支付测试模式，不是真实扣款。

### 1.1 已实际启用的支付方式

- 后端在 Region 初始化时注册的是 `pp_system_default`。
- 这个 provider 是 Medusa 内置的 Manual Payment Provider。
- 它的行为是“直接允许下单”，不会调用任何外部支付网关。

对应代码现状：

- `my-store/src/scripts/seed.ts` 里 Europe 区域的 `payment_providers` 只有 `pp_system_default`
- `my-store/medusa-config.ts` 里没有 Stripe 或 PayPal 的后端支付模块配置

### 1.2 项目里“有代码痕迹”但未真正启用的支付方式

#### Stripe

前端已经保留了 Stripe 相关能力：

- `my-store-storefront/package.json` 已安装 `@stripe/react-stripe-js` 和 `@stripe/stripe-js`
- `my-store-storefront/src/modules/checkout/components/payment-button/index.tsx` 有 `StripePaymentButton`
- `my-store-storefront/src/lib/constants.tsx` 有 `isStripeLike` 和 Stripe provider 映射

但是当前后端没有看到：

- `@medusajs/payment-stripe` 依赖
- Stripe 的 `medusa-config.ts` 模块注册

所以当前仓库状态下，Stripe 不是“已上线支付方式”，而是“前端预留了接入能力”。

#### PayPal

前端常量里已经预留了 PayPal 的展示项：

- `my-store-storefront/src/lib/constants.tsx` 里有 `pp_paypal_paypal`
- 同文件里还有 `isPaypal` 判断函数

但是当前项目里没有看到：

- PayPal 后端 provider
- PayPal SDK 依赖
- PayPal checkout 按钮组件
- PayPal webhook 配置

所以当前项目并没有真正集成 PayPal，只是 UI 常量层面预留了一个 provider 映射。

## 2. “PayPal 个人支付”能不能接

可以，但要区分两类完全不同的接法。

### 2.1 你说的 WordPress 场景是成立的

你提到的流程通常是这样的：

1. 用户在网站点击 PayPal 按钮
2. 跳转到 PayPal 页面完成支付或授权
3. PayPal 按 `return_url` 或插件配置回跳到网站
4. 网站再根据回跳参数、IPN、Webhook 或插件状态更新订单

这个模式在 WordPress、WooCommerce、捐赠站、简单收款页里很常见。

这说明两件事：

- PayPal Personal 个人账户在某些地区和某些产品形态下，确实可以“收款”
- “能收款”不等于“适合当前这个 Medusa 项目的自定义支付集成方式”

我上一版文档把这两个层次说得太接近了，这里修正。

### 2.2 需要区分“简单跳转收款”和“自定义 API 集成”

#### A. 简单跳转/托管式收款

典型特征：

- 跳到 PayPal 页面完成支付
- 站点只接收回跳
- 很多细节由 PayPal 插件或平台代管

这类模式在 WordPress 上能跑通，不奇怪。

#### B. 自定义商城 API 集成

当前这个项目属于这一类，典型特征是：

- 你自己控制 Medusa 后端 payment provider
- 你自己处理 storefront 的 payment session
- 你自己决定订单何时完成
- 你自己处理 webhook、支付状态回写、重试和幂等

这时要求就更高，不只是“能跳转收款”这么简单。

### 2.3 为什么我仍然建议用 Business 账户

不是因为 Personal 一定完全不能收款，而是因为：

- PayPal 官方 REST API 集成依赖 `clientId` 和 `clientSecret`
- PayPal 官方文档对正式上线集成的表述，更偏向 Business account 场景
- Sandbox 测试本身也是 buyer personal + seller business 的典型组合
- 你这个项目不是 WordPress 插件托管式支付，而是 Medusa 自定义接入
- 后续还要处理 webhook、退款、支付状态同步和后台运维

所以，从“能不能偶尔收款”的角度，Personal 在某些场景可能可行；但从“这个 Medusa 项目要长期稳定集成真实支付”的角度，Business 账户仍然是更稳妥的方案。

### 2.4 如果你是个人卖课，没有公司怎么办

这不一定是障碍。

很多情况下，PayPal Business 并不等于必须是公司主体，也可以是个人经营者身份开通。是否支持、要提交哪些材料，要看你所在国家或地区的 PayPal 政策。

更准确的说法应该是：

- 你可以是个人卖家
- 但你的网站如果要做稳定的开发者集成，通常还是建议使用 Business 类型账户来承接收款

### 2.5 修正后的结论

如果你只是想做一个类似 WordPress 的“跳转 PayPal 后回站”的简单收款链路，Personal 在某些情况下确实可能可用。

但如果你要在这个项目里做真正可维护的 PayPal 集成，推荐方案仍然是：

1. 准备 PayPal Developer App
2. 优先使用 PayPal Business 账户承接收款
3. 后端接入 PayPal provider
4. 前端接入 PayPal Checkout Button 或跳转式按钮
5. 用 Webhook 回写支付状态

## 3. 推荐接入方案

推荐优先采用“Medusa 官方 example 的 PayPal module provider 思路”，理由是：

- 和当前项目的 Medusa v2 架构更接近
- provider 直接注册在 `@medusajs/medusa/payment` 模块下
- 对你现在这个自定义后端项目更容易定位和维护

可选备选方案：

- 使用第三方社区插件 `@alphabite/medusa-paypal`

如果目标是尽快接入，第三方插件也可行；如果目标是长期维护可控，建议优先参考 Medusa 官方 example 的 provider 方式。

## 4. 针对本项目的具体接入步骤

下面的步骤是按照你当前仓库结构整理的，不是泛泛而谈。

### Step 1：准备 PayPal 账号和开发者应用

你需要先准备这些信息：

- PayPal Business 账户
- PayPal Developer Dashboard 中创建的 App
- Sandbox 环境的 `PAYPAL_CLIENT_ID`
- Sandbox 环境的 `PAYPAL_CLIENT_SECRET`
- 一个 Webhook ID

建议先只做 Sandbox：

- `PAYPAL_ENVIRONMENT=sandbox`
- 等联调完成后再切到 live

### Step 2：后端接入 PayPal provider

推荐做法是参考 Medusa 官方 example，把 PayPal provider 模块拷进当前后端项目。

建议来源：

- Medusa 官方 example 的 `paypal-integration`
- 其中的做法是把 `src/modules/paypal` 复制到现有项目，再在 `medusa-config.ts` 注册 provider

你当前项目里建议新增：

- `my-store/src/modules/paypal/` 目录

然后安装后端所需依赖：

```bash
cd my-store
npm install @paypal/paypal-server-sdk
```

### Step 3：在后端配置 PayPal 环境变量

给 `my-store/.env` 增加：

```bash
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_ENVIRONMENT=sandbox
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id
PAYPAL_AUTO_CAPTURE=true
```

字段说明：

- `PAYPAL_CLIENT_ID`：PayPal App 的 Client ID
- `PAYPAL_CLIENT_SECRET`：PayPal App 的 Client Secret
- `PAYPAL_ENVIRONMENT`：建议先用 `sandbox`
- `PAYPAL_WEBHOOK_ID`：Webhook 配置完成后拿到的 ID
- `PAYPAL_AUTO_CAPTURE`：是否在下单时自动扣款

如果你卖的是线上课程，通常建议先用：

```bash
PAYPAL_AUTO_CAPTURE=true
```

这样买家支付成功后，订单和课程购买记录更容易保持一致。

### Step 4：在 medusa-config.ts 注册 PayPal provider

你当前项目的后端配置文件是：

- `my-store/medusa-config.ts`

参考 Medusa 官方 example，目标配置形态应类似：

```ts
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/paypal",
            id: "paypal",
            options: {
              client_id: process.env.PAYPAL_CLIENT_ID!,
              client_secret: process.env.PAYPAL_CLIENT_SECRET!,
              environment: process.env.PAYPAL_ENVIRONMENT || "sandbox",
              autoCapture: process.env.PAYPAL_AUTO_CAPTURE === "true",
              webhook_id: process.env.PAYPAL_WEBHOOK_ID,
            },
          },
        ],
      },
    },
  ],
})
```

注意两点：

1. 这一步是“新增 PayPal provider”，不是替换你现有的文件上传、course、video、product-detail 模块。
2. 需要把 PayPal provider 追加进现有 `modules` 数组，而不是覆盖现有配置。

### Step 5：把 PayPal 加到 Region

你现在的种子数据只注册了：

```ts
payment_providers: ["pp_system_default"]
```

对于已初始化的数据库，最稳妥的做法不是改 seed 再重跑，而是直接在 Medusa Admin 里开启 PayPal：

1. 打开 Admin
2. 进入 Settings
3. 找到 Regions
4. 编辑正在使用的 Region
5. 在 Payment Providers 中勾选 PayPal
6. 保存

如果你未来要初始化新环境，也可以把 `my-store/src/scripts/seed.ts` 改成同时注册 PayPal，例如：

```ts
payment_providers: ["pp_system_default", "pp_paypal_paypal"]
```

是否使用这个 provider_id，要以你最终引入的 PayPal provider 实际暴露的 id 为准。根据你当前 storefront 常量，项目预期的 PayPal id 是：

```ts
pp_paypal_paypal
```

### Step 6：前端安装 PayPal SDK

进入 storefront：

```bash
cd my-store-storefront
npm install @paypal/react-paypal-js
```

然后增加前端环境变量：

```bash
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
```

### Step 7：复用当前 checkout 流程，只补 PayPal 渲染逻辑

这是这个项目最关键的点。

你当前 storefront 的 checkout 流程已经有这些现成能力：

- `my-store-storefront/src/lib/data/cart.ts` 已有 `initiatePaymentSession`
- 同文件已有 `placeOrder`
- `my-store-storefront/src/modules/checkout/components/payment/index.tsx` 已有支付方式选择流程
- `my-store-storefront/src/modules/checkout/components/payment-button/index.tsx` 已根据 provider_id 分发不同支付按钮

所以 PayPal 接入不需要重写整个 checkout，只要在现有结构上补一个 PayPal 分支。

### Step 8：前端需要改的文件

#### 8.1 constants.tsx

你当前文件已经有：

- `paymentInfoMap.pp_paypal_paypal`
- `isPaypal()`

这部分基本可以直接复用。

#### 8.2 payment-button/index.tsx

当前这个文件只处理：

- Stripe
- Manual Payment

你需要新增第三个分支：

```tsx
case isPaypal(paymentSession?.provider_id):
  return <PayPalPaymentButton cart={cart} data-testid={dataTestId} />
```

#### 8.3 新增 PayPalPaymentButton 组件

建议新增一个组件，例如：

- `my-store-storefront/src/modules/checkout/components/payment-button/paypal-payment-button.tsx`

职责如下：

1. 从后端获取 PayPal client token
2. 使用 `PayPalScriptProvider` 加载 PayPal SDK
3. 渲染 `PayPalButtons`
4. 在 `createOrder` 中使用当前 cart 的 payment session
5. 在 `onApprove` 中调用现有 `placeOrder()`

一个适合这个项目的实现思路如下：

```tsx
"use client"

import { useEffect, useState } from "react"
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"
import { placeOrder } from "@lib/data/cart"

export default function PayPalPaymentButton() {
  const [clientToken, setClientToken] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      const resp = await fetch("/store/paypal/client-token", {
        method: "POST",
        credentials: "include",
      })
      const data = await resp.json()
      setClientToken(data.clientToken)
    }

    run()
  }, [])

  if (!clientToken) {
    return null
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        intent: "capture",
        currency: "EUR",
        dataClientToken: clientToken,
      }}
    >
      <PayPalButtons
        createOrder={async () => {
          return "PAYPAL_ORDER_ID_FROM_SESSION"
        }}
        onApprove={async () => {
          await placeOrder()
        }}
      />
    </PayPalScriptProvider>
  )
}
```

这里要注意：

- `createOrder` 里不能硬编码订单号
- 它应该返回后端 PayPal session 创建出来的 PayPal order id
- 具体字段名要以你最终引入的 PayPal provider 返回结构为准

### Step 9：确认课程购买记录链路不需要重写

你当前项目里，`placeOrder()` 在完成订单后还会调用：

- `/store/course-purchases/from-order`

这意味着只要 PayPal 支付成功后仍然走现有 `placeOrder()`，课程购买记录逻辑就可以复用，不需要为 PayPal 单独重写一套“发课逻辑”。

这点非常重要。

也就是说，PayPal 接入的核心目标不是改“课程购买成功逻辑”，而是保证：

1. PayPal 支付成功
2. 之后调用现有 `placeOrder()`
3. 保持现有订单完成后写入课程购买记录的流程不变

### Step 10：配置 Webhook

PayPal 真实支付不能只依赖前端回调，必须补 Webhook。

你需要在 PayPal 开发者后台创建 webhook，并把事件推送到你的后端公开地址。

建议监听至少这些事件：

- `CHECKOUT.ORDER.APPROVED`
- `PAYMENT.CAPTURE.COMPLETED`
- `PAYMENT.CAPTURE.DENIED`
- `PAYMENT.CAPTURE.REFUNDED`

然后把 webhook id 写回：

```bash
PAYPAL_WEBHOOK_ID=...
```

如果你的环境暂时没有公网地址，可以用隧道工具联调，例如 ngrok。

## 5. 本项目最少要改哪些文件

如果按“官方 example provider + 当前 storefront 复用”的方式做，至少会涉及这些位置：

### 后端

- `my-store/package.json`
- `my-store/medusa-config.ts`
- `my-store/.env`
- `my-store/src/modules/paypal/` 新增 provider 模块
- `my-store/src/scripts/seed.ts` 可选修改

### 前端

- `my-store-storefront/package.json`
- `my-store-storefront/.env.local` 或生产环境变量配置
- `my-store-storefront/src/lib/constants.tsx` 一般只需校对，不一定要改
- `my-store-storefront/src/modules/checkout/components/payment-button/index.tsx`
- `my-store-storefront/src/modules/checkout/components/payment-button/paypal-payment-button.tsx` 新增

## 6. 建议的实施顺序

建议按下面顺序做，不要一上来就改前端按钮：

1. 先把 PayPal Business 账户和 Developer App 准备好
2. 先在后端把 PayPal provider 跑通
3. 在 Admin 里确认 Region 已出现 PayPal
4. 确认 cart 能创建 PayPal payment session
5. 再接 storefront 的 PayPal 按钮
6. 最后再打通 webhook

这样排查问题最省时间，因为支付系统最容易出问题的不是 React 按钮，而是 provider 配置、region 绑定和 webhook。

## 7. 验收清单

PayPal 接入完成后，至少要验证这些点：

### Sandbox 验收

1. 结账页能看到 PayPal 选项
2. 选择 PayPal 后可以进入 PayPal 授权流程
3. 支付成功后 `placeOrder()` 正常执行
4. 订单在 Medusa Admin 中可见
5. `/store/course-purchases/from-order` 正常写入课程购买记录
6. Webhook 能正确回写支付结果

### 异常场景验收

1. 用户取消支付时，订单不能误完成
2. PayPal 支付失败时，前端能看到错误提示
3. Webhook 重复投递时，不会重复发课
4. 同一个 cart 重试支付时，不会出现脏 session

## 8. 最终结论

### 当前项目现状

- 当前真正启用的支付方式只有 `pp_system_default`
- Stripe 只有前端预留，后端未启用
- PayPal 只有常量预留，尚未集成

### 你的 PayPal 接入建议

- PayPal Personal 在某些产品形态下可以收款，你说的 WordPress 跳转回站流程是成立的
- 但当前项目属于 Medusa 自定义支付集成，不是托管式 WordPress 插件场景
- 对这个项目，正式接入时仍然优先建议使用 PayPal Business 账户
- 本项目最合适的落地方式，是在 Medusa 后端增加 PayPal provider，再在 storefront 补 PayPal 按钮分支
- 现有 `placeOrder()` 和课程购买记录逻辑可以继续复用

这意味着，PayPal 接入的改造面其实不算大，关键在于先把后端 provider 和 webhook 配对好。