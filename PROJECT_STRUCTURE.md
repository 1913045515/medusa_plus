# 项目结构与功能说明

> 本文档描述 `my-store`（Medusa 后端）与 `my-store-storefront`（Next.js 前端）两个项目的目录结构及对应功能。

---

## 一、my-store（Medusa 后端）

**技术栈**：Node.js · TypeScript · MedusaJS v2  
**运行端口**：`9000`  
**启动命令**：`npm run dev`（开发模式）/ `npm start`（生产模式）

### 目录结构

```
my-store/
├── medusa-config.ts          # 核心配置文件：数据库连接、CORS、JWT/Cookie 密钥等
├── instrumentation.ts        # 服务启动时的埋点/监控注册入口
├── jest.config.js            # 单元测试与集成测试配置
├── tsconfig.json             # TypeScript 编译配置
│
├── src/
│   ├── admin/                # 后台管理面板（Admin UI）扩展
│   │   ├── i18n/             # 国际化配置，支持多语言后台界面
│   │   ├── tsconfig.json     # Admin 模块独立 TS 配置
│   │   └── vite-env.d.ts     # Vite 类型声明（Admin 使用 Vite 构建）
│   │
│   ├── api/                  # 自定义 REST API 路由（基于文件路径自动注册）
│   │   ├── admin/
│   │   │   └── custom/       # 自定义管理端 API 扩展（需鉴权）
│   │   └── store/
│   │       └── custom/       # 自定义面向用户的 Store API 扩展
│   │
│   ├── jobs/                 # 定时任务（Cron Jobs），如定期清理、统计等
│   │
│   ├── links/                # 模块关联定义，建立不同模块之间的数据关系（如商品与库存）
│   │
│   ├── modules/              # 自定义业务模块，可扩展 Medusa 核心能力
│   │
│   ├── scripts/
│   │   └── seed.ts           # 数据初始化脚本，包含：
│   │                         #   - 商店货币（EUR/USD）
│   │                         #   - 销售渠道（Sales Channel）
│   │                         #   - 欧洲区域（Region）及税区
│   │                         #   - 仓库库存地点（Stock Location）
│   │                         #   - 物流配置（Standard / Express Shipping）
│   │                         #   - Publishable API Key
│   │                         #   - 示例商品（T-Shirt / Sweatshirt / Sweatpants / Shorts）
│   │
│   ├── subscribers/          # 事件订阅器，监听系统事件并触发自定义逻辑（如下单后发邮件）
│   │
│   └── workflows/            # 自定义工作流，编排多步骤业务逻辑（如自定义下单流程）
│
└── integration-tests/        # 集成测试
    └── http/
        └── health.spec.ts    # 健康检查接口测试
```

### 关键功能说明

| 目录 | 功能 |
|------|------|
| `medusa-config.ts` | 全局配置入口，管理数据库、跨域、认证等核心参数 |
| `src/api/` | 扩展 REST API，`store/` 面向前端，`admin/` 面向后台 |
| `src/modules/` | 自定义业务模块，独立封装数据模型与服务逻辑 |
| `src/workflows/` | 工作流编排，将多个步骤组合为可回滚的事务流程 |
| `src/subscribers/` | 异步事件处理，解耦业务副作用逻辑 |
| `src/jobs/` | 定时任务，处理周期性后台任务 |
| `src/links/` | 跨模块数据关联，实现模块间松耦合关系绑定 |
| `src/scripts/seed.ts` | 一键初始化演示数据，含商品、库存、物流、区域等完整配置 |
| `src/admin/` | 扩展 Medusa Admin 后台 UI，支持自定义页面和组件 |

---

## 二、my-store-storefront（Next.js 前端商城）

**技术栈**：Next.js 15 · React 19 · TypeScript · Tailwind CSS · Turbopack  
**运行端口**：`8000`  
**启动命令**：`npm run dev`（开发模式）/ `npm start`（生产模式）

### 目录结构

```
my-store-storefront/
├── next.config.js            # Next.js 构建配置
├── tailwind.config.js        # Tailwind CSS 主题与插件配置
├── next-sitemap.js           # SEO 站点地图生成配置
├── check-env-variables.js    # 启动前环境变量校验脚本
├── postcss.config.js         # PostCSS 配置（Tailwind 依赖）
│
├── public/                   # 静态资源（favicon 等）
│
└── src/
    ├── middleware.ts          # Next.js 中间件：处理国家/地区路由重定向（基于 countryCode）
    │
    ├── app/                   # Next.js App Router 页面路由
    │   ├── layout.tsx         # 全局根布局（HTML 结构、字体、全局 Provider）
    │   ├── not-found.tsx      # 全局 404 页面
    │   └── [countryCode]/     # 动态国家/地区路由（支持多地区）
    │       ├── (main)/        # 主站页面路由组（含公共导航 Layout）
    │       │   ├── page.tsx       # 首页
    │       │   ├── layout.tsx     # 主站公共布局（Header/Footer）
    │       │   ├── account/       # 用户账户中心（登录/注册/个人信息/地址/订单）
    │       │   ├── cart/          # 购物车页面
    │       │   ├── categories/    # 商品分类页面
    │       │   ├── collections/   # 商品集合页面
    │       │   ├── products/      # 商品详情页
    │       │   ├── store/         # 商品列表/商城页面
    │       │   └── order/         # 订单详情与确认页
    │       └── (checkout)/    # 结账路由组（独立 Layout，无公共导航）
    │           ├── layout.tsx     # 结账专用布局
    │           └── checkout/      # 结账流程页面
    │
    ├── lib/                   # 公共工具库与数据层
    │   ├── config.ts          # Medusa SDK 客户端初始化配置
    │   ├── constants.tsx      # 全局常量（导航链接、默认参数等）
    │   ├── context/
    │   │   └── modal-context.tsx  # 全局 Modal 状态管理 Context
    │   ├── data/              # 服务端数据请求函数（Server Actions / API 调用）
    │   │   ├── products.ts    # 商品数据获取
    │   │   ├── cart.ts        # 购物车操作（增删改查）
    │   │   ├── orders.ts      # 订单数据获取
    │   │   ├── customer.ts    # 用户信息管理
    │   │   ├── categories.ts  # 商品分类数据
    │   │   ├── collections.ts # 商品集合数据
    │   │   ├── regions.ts     # 区域/地区数据
    │   │   ├── fulfillment.ts # 物流配送数据
    │   │   ├── payment.ts     # 支付相关数据
    │   │   ├── variants.ts    # 商品变体数据
    │   │   ├── cookies.ts     # Cookie 读写操作
    │   │   ├── locales.ts     # 语言列表数据
    │   │   ├── locale-actions.ts # 语言切换 Server Action
    │   │   └── onboarding.ts  # 新用户引导状态管理
    │   ├── hooks/
    │   │   ├── use-in-view.tsx      # 元素可见性检测 Hook（懒加载）
    │   │   └── use-toggle-state.tsx # 开关状态管理 Hook
    │   └── util/              # 工具函数
    │       ├── money.ts           # 货币格式化
    │       ├── get-product-price.ts # 商品价格计算
    │       ├── get-percentage-diff.ts # 折扣百分比计算
    │       ├── sort-products.ts   # 商品排序
    │       ├── product.ts         # 商品数据处理
    │       ├── compare-addresses.ts # 地址比较工具
    │       ├── medusa-error.ts    # 统一错误处理
    │       ├── env.ts             # 环境变量读取工具
    │       ├── get-locale-header.ts # 请求头语言获取
    │       ├── isEmpty.ts         # 空值判断
    │       └── repeat.ts          # 数组重复生成工具
    │
    ├── modules/               # 页面功能模块（UI 组件 + 页面模板）
    │   ├── home/              # 首页模块（Hero Banner、Featured Products 等）
    │   ├── layout/            # 全站布局组件
    │   │   └── components/
    │   │       ├── cart-button/       # 导航栏购物车按钮
    │   │       ├── cart-dropdown/     # 购物车下拉预览
    │   │       ├── cart-mismatch-banner/ # 购物车地区不匹配提示
    │   │       ├── country-select/    # 国家/地区选择器
    │   │       ├── language-select/   # 语言切换选择器
    │   │       ├── side-menu/         # 移动端侧边导航菜单
    │   │       └── medusa-cta/        # Medusa 品牌 CTA 组件
    │   ├── products/          # 商品模块
    │   │   └── components/
    │   │       ├── product-preview/   # 商品卡片预览
    │   │       ├── product-actions/   # 商品加购操作（规格选择、加入购物车）
    │   │       ├── product-tabs/      # 商品详情标签页（描述、尺码等）
    │   │       ├── image-gallery/     # 商品图片画廊
    │   │       ├── product-price/     # 商品价格展示（含折扣）
    │   │       ├── related-products/  # 相关商品推荐
    │   │       ├── thumbnail/         # 商品缩略图
    │   │       └── product-onboarding-cta/ # 新手引导 CTA
    │   ├── cart/              # 购物车模块
    │   │   └── components/
    │   │       ├── item/              # 购物车单项商品
    │   │       ├── empty-cart-message/ # 空购物车提示
    │   │       ├── cart-item-select/  # 购物车商品规格修改
    │   │       └── sign-in-prompt/    # 未登录提示
    │   ├── checkout/          # 结账模块
    │   │   └── components/
    │   │       ├── addresses/         # 收货地址填写
    │   │       ├── shipping/          # 配送方式选择
    │   │       ├── payment/           # 支付方式选择
    │   │       ├── payment-button/    # 支付确认按钮
    │   │       ├── discount-code/     # 优惠码输入
    │   │       ├── review/            # 订单确认/Review 步骤
    │   │       └── shipping-address/  # 配送地址组件
    │   ├── account/           # 账户中心模块
    │   │   └── components/
    │   │       ├── login/             # 登录表单
    │   │       ├── register/          # 注册表单
    │   │       ├── overview/          # 账户概览
    │   │       ├── profile-name/      # 修改姓名
    │   │       ├── profile-email/     # 修改邮箱
    │   │       ├── profile-phone/     # 修改电话
    │   │       ├── profile-password/  # 修改密码
    │   │       ├── profile-billing-address/ # 账单地址管理
    │   │       ├── address-book/      # 地址簿管理
    │   │       ├── order-overview/    # 订单列表
    │   │       ├── order-card/        # 订单卡片
    │   │       ├── account-nav/       # 账户中心侧边导航
    │   │       └── transfer-request-form/ # 订单转移请求
    │   ├── order/             # 订单模块
    │   │   └── components/
    │   │       ├── order-details/     # 订单详情信息
    │   │       ├── order-summary/     # 订单金额汇总
    │   │       ├── items/             # 订单商品列表
    │   │       ├── payment-details/   # 支付信息
    │   │       ├── shipping-details/  # 物流信息
    │   │       └── transfer-actions/  # 订单转移操作
    │   ├── store/             # 商城列表模块（商品筛选、排序、分页）
    │   ├── categories/        # 分类页模块
    │   ├── collections/       # 集合页模块
    │   ├── shipping/          # 配送信息展示组件
    │   ├── common/            # 通用 UI 组件库
    │   │   └── components/
    │   │       ├── input/             # 表单输入框
    │   │       ├── modal/             # 弹窗组件
    │   │       ├── radio/             # 单选框
    │   │       ├── checkbox/          # 复选框
    │   │       ├── native-select/     # 原生下拉选择
    │   │       ├── filter-radio-group/ # 筛选用单选组
    │   │       ├── cart-totals/       # 价格合计展示
    │   │       ├── line-item-price/   # 行项目价格
    │   │       ├── line-item-unit-price/ # 行项目单价
    │   │       ├── line-item-options/ # 行项目规格选项
    │   │       ├── delete-button/     # 删除按钮
    │   │       ├── divider/           # 分割线
    │   │       ├── interactive-link/  # 交互式链接
    │   │       └── localized-client-link/ # 带地区前缀的客户端跳转链接
    │   └── skeletons/         # 骨架屏加载占位组件
    │       └── components/
    │           ├── skeleton-product-preview/    # 商品卡片骨架屏
    │           ├── skeleton-cart-item/          # 购物车项骨架屏
    │           ├── skeleton-cart-totals/        # 价格合计骨架屏
    │           ├── skeleton-order-summary/      # 订单汇总骨架屏
    │           ├── skeleton-line-item/          # 行项目骨架屏
    │           └── skeleton-order-confirmed-header/ # 订单确认头部骨架屏
    │
    ├── styles/
    │   └── globals.css        # 全局样式（Tailwind 基础样式引入）
    │
    └── types/
        ├── global.ts          # 全局类型声明（扩展 Window、全局接口等）
        └── icon.ts            # 图标组件类型声明
```

### 关键功能说明

| 目录 | 功能 |
|------|------|
| `src/middleware.ts` | 根据用户 IP/配置自动重定向至对应国家地区路由（如 `/dk/...`） |
| `src/app/[countryCode]/` | 多地区路由基础，所有页面均在国家代码命名空间下运行 |
| `src/app/[countryCode]/(main)/` | 主站功能页面：首页、商品、分类、购物车、账户、订单 |
| `src/app/[countryCode]/(checkout)/` | 独立结账流程，与主站布局隔离 |
| `src/lib/data/` | 所有 Server Action 和 API 调用的集中管理层，对接 Medusa 后端 |
| `src/lib/util/` | 纯工具函数：价格计算、货币格式化、地址比较等 |
| `src/modules/` | 按业务功能拆分的 UI 模块，每个模块包含 `components/` 和 `templates/` |
| `src/modules/common/` | 跨模块复用的基础 UI 组件（表单、弹窗、价格展示等）|
| `src/modules/skeletons/` | 异步加载时的骨架屏占位组件，提升用户体验 |

---

## 三、两个项目的协作关系

```
┌─────────────────────────────┐        ┌──────────────────────────────────┐
│     my-store (后端)          │        │   my-store-storefront (前端)      │
│     localhost:9000           │        │   localhost:8000                  │
│                              │        │                                   │
│  ┌──────────────────────┐   │  REST  │  ┌────────────────────────────┐  │
│  │ Medusa Store API      │◄──┼────────┼──│ src/lib/data/*.ts          │  │
│  │ /store/*             │   │        │  │ (Server Actions)           │  │
│  └──────────────────────┘   │        │  └────────────────────────────┘  │
│                              │        │                                   │
│  ┌──────────────────────┐   │        │  ┌────────────────────────────┐  │
│  │ Medusa Admin API      │   │        │  │ src/app/[countryCode]/     │  │
│  │ /admin/*             │   │        │  │ (页面路由)                  │  │
│  └──────────────────────┘   │        │  └────────────────────────────┘  │
│                              │        │                                   │
│  ┌──────────────────────┐   │        │  ┌────────────────────────────┐  │
│  │ Admin UI 后台         │   │        │  │ src/modules/               │  │
│  │ localhost:9000/app   │   │        │  │ (功能 UI 模块)              │  │
│  └──────────────────────┘   │        │  └────────────────────────────┘  │
└─────────────────────────────┘        └──────────────────────────────────┘
```

| 项目 | 职责 | 访问地址 |
|------|------|----------|
| `my-store` | 提供 REST API、管理数据库、处理业务逻辑、暴露 Admin 后台 | API: `http://localhost:9000` · Admin: `http://localhost:9000/app` |
| `my-store-storefront` | 消费 Medusa API，渲染面向用户的商城页面 | 商城: `http://localhost:8000` |
