# AI Cross Stand — 独立站开发文档

> 本文档覆盖平台功能介绍、技术栈说明、本地开发流程与线上部署流程，适合开发者快速上手与团队协作参考。

---

## 一、功能介绍

本平台是一套基于 MedusaJS + Next.js 构建的**数字商品独立站**，既支持虚拟产品（软件源码、视频课程），也支持实体产品销售。平台由两大部分组成：**Admin 后台**（内容与业务管理）和 **Storefront 前台**（面向买家的购物体验）。

---

### 1.1 产品与商城

- **商品管理**：支持在 Admin 后台创建、编辑、上架商品，配置价格、变体、库存、图片、分类与标签。
- **虚拟商品扩展**：每件商品可标记为「虚拟产品」，类型分为：
  - `resource`：数字资料/软件源码包，关联文件资产，购买后可下载。
  - `course`：视频课程，关联站内课程模块，购买后解锁全部视频。
- **产品详情富文本**：支持长描述 HTML 编辑，详情页分上下两段展示。
- **产品图片管理**：支持多图上传、排序、设置主图。
- **产品分类**：多级分类树，前台店铺页支持按分类筛选。
- **排序与筛选**：按最新上架、价格升序/降序排序，商品列表展示正方形缩略图及商品数量统计。

---

### 1.2 课程模块

- **课程管理**：在 Admin 后台创建课程，维护课程标题、封面、描述、handle。
- **视频课时**：每门课程包含多集视频，支持设置标题、集数、时长、视频 URL、封面、是否免费。
- **免费预览**：前 N 集可设置为免费播放，购买后解锁完整内容。
- **购买解锁**：通过标准结账流程购买绑定课程的商品，订单确认后自动记录课程购买记录并解锁视频。
- **学习进度**：视频播放详情页展示课时列表（左视频 + 右集数导航），支持会员专属内容保护。

---

### 1.3 博客系统

- **文章管理**：在 Admin 后台使用富文本编辑器创建/发布博客文章（TipTap 编辑器，支持标题、图片、链接、列表、表格等）。
- **分类与标签**：文章支持多级分类（可管理分类树）和多标签，前台支持按分类/标签筛选。
- **用户组可见性**：文章可设置对特定用户组可见（如付费会员专属内容）。
- **内容图片管理**：博客图片统一上传至文件资产库，支持插入文章。
- **前台博客页面**：列表页、详情页、分类页、标签页，侧边栏展示分类与标签导航。

---

### 1.4 内容页面

- **自定义内容页**：在 Admin 后台创建任意静态/富文本页面（如关于我们、隐私政策），通过 URL handle 访问。
- **首页内容管理**：首页 Banner、模块内容可在 Admin 后台可视化配置，无需修改代码发布。

---

### 1.5 文件资产管理

- **文件库**：统一管理站内所有上传文件（软件包、文档、图片等），支持名称、MIME 类型、文件大小查看。
- **安全下载**：虚拟资料商品关联文件资产后，购买用户可获得限时签名下载链接，无法盗链。
- **分页搜索**：文件列表支持关键词搜索与分页。

---

### 1.6 用户与账户

- **注册与登录**：邮箱 + 密码注册/登录，支持 JWT 认证 + Cookie 会话。
- **密码重置**：忘记密码通过邮件发送重置链接（OTP 验证码流程）。
- **个人中心**：前台账户中心支持查看个人信息、地址管理、历史订单。
- **多地区支持**：URL 前缀 `/{countryCode}/` 路由，自动匹配地区货币与税率。

---

### 1.7 购物与结账

- **购物车**：标准购物车操作（增删改数量），支持展示商品变体、价格、折扣。
- **结账流程**：地址填写 → 配送方式 → 支付确认，全流程 Medusa 标准工作流。
- **PayPal 支付**：集成 PayPal REST API，支持生产与沙箱环境切换，Admin 可配置。
- **结账字段配置**：Admin 后台可控制结账页面展示/隐藏哪些字段（如公司名、电话等），适配不同商品类型。
- **订单管理**：Admin 后台查看所有订单详情；前台用户可在账户中心查看历史订单；虚拟商品订单支持自动发货确认。

---

### 1.8 客服工单

- **工单系统**：登录用户可在前台提交客服工单，填写主题、内容、分类。
- **工单管理**：Admin 后台查看所有工单，支持回复与状态管理。
- **鉴权保护**：未登录用户访问工单页面显示登录提示，不可查看他人工单。

---

### 1.9 站点配置与分析

- **菜单管理**：Admin 后台可视化配置导航菜单，支持多级菜单项、链接与排序，前台实时渲染。
- **站点设置**：商店名称、介绍文字等全局配置在 Admin 后台统一管理。
- **站点分析**：内置 PV/UV 事件采集，记录页面浏览行为，Admin 后台可查看访问统计。
- **邮件代理**：Admin 后台配置 SMTP 服务（主机、端口、用户名、密码、发件人），支持发送测试邮件验证可达性。

---

### 1.10 Admin 后台国际化

- 后台管理界面支持多语言（已内置中文简体）。
- 通过 `src/admin/i18n/` 维护翻译文本，覆盖后台所有自定义页面与组件。

---

## 二、技术栈介绍

### 后端 — `my-store/`

| 技术 | 版本 / 说明 |
|------|------------|
| **MedusaJS** | v2.13 — Headless 商业框架，提供商品、订单、用户、支付等核心模块 |
| **Node.js** | >= 20 LTS |
| **TypeScript** | 严格模式，全项目类型安全 |
| **PostgreSQL** | 16 — 主数据库 |
| **Redis** | 7 — 队列、会话与缓存 |
| **MikroORM** | Medusa 内置 ORM，代码优先数据模型与迁移 |
| **TipTap** | 富文本编辑器（博客、产品详情编辑） |
| **AWS S3 SDK** | 课程视频/图片存储，支持签名 URL |
| **Redocly** | OpenAPI 文档生成与预览 |
| **Jest** | 单元测试 + 集成测试框架 |

**核心架构特点：**
- 文件路由 API：`src/api/` 下按目录结构自动注册 REST 路由。
- 自定义模块：`src/modules/` 独立封装业务逻辑（博客、课程、工单、文件资产、虚拟商品等）。
- 工作流引擎：`src/workflows/` 编排多步骤业务，支持回滚事务。
- 事件订阅：`src/subscribers/` 响应系统事件，解耦副作用（如订单完成后发邮件/解锁课程）。
- 模块关联：`src/links/` 建立跨模块松耦合关系。

---

### 前台 — `my-store-storefront/`

| 技术 | 版本 / 说明 |
|------|------------|
| **Next.js** | 15（App Router + Server Components）|
| **React** | 19 |
| **TypeScript** | 严格模式 |
| **Tailwind CSS** | 3.x — 原子化样式 |
| **Medusa UI** | Medusa 官方组件库（按钮、表单、图标等）|
| **Medusa JS SDK** | 官方 API 客户端，封装所有 Store API 调用 |
| **Turbopack** | 开发服务器（替代 Webpack 加速热更新）|
| **TipTap** | 富文本内容渲染 |
| **PayPal React SDK** | PayPal 支付按钮集成 |
| **Playwright** | E2E 端到端测试 |

**核心架构特点：**
- App Router：全站 Server Components + Client Components 混合，最大化性能与 SEO。
- 国家/地区路由：`/{countryCode}/` 前缀，中间件自动重定向，支持多地区多货币。
- 数据层：`src/lib/data/` 封装所有 Server Actions 和数据获取，Server/Client 组件均可复用。
- 模块化 UI：`src/modules/` 将页面拆分为功能模块（home、store、products、account 等），各模块含 components + templates。

---

### Admin 后台 — 内嵌于 `my-store/`

| 技术 | 说明 |
|------|------|
| **Medusa Admin SDK** | 官方 Admin UI 扩展框架（Vite + React）|
| **React i18next** | Admin 界面多语言 |
| **Medusa UI** | Admin 组件库 |
| **TipTap** | 博客/内容编辑器 |
| **dnd-kit** | 拖拽排序（图片、菜单等）|

---

## 三、开发流程介绍

### 3.1 环境准备

**系统依赖：**
- Node.js >= 20 LTS
- Docker & Docker Compose（用于本地数据库）
- Git

**克隆项目：**

```bash
git clone <repository-url>
cd ai-cross-stand
```

---

### 3.2 启动本地基础设施

使用 Docker Compose 启动 PostgreSQL 和 Redis：

```bash
docker compose -f docker-compose.dev.yml up -d
```

默认会启动：
- PostgreSQL（端口 5432）
- Redis（端口 6379）

---

### 3.3 启动后端（my-store）

```bash
cd my-store

# 安装依赖
npm install

# 配置环境变量（复制模板后按实际填写）
cp .env.example .env

# 必填环境变量：
# DATABASE_URL=postgres://medusa:medusa_dev_pass@localhost:5432/medusa_db
# REDIS_URL=redis://:redis_dev_pass@localhost:6379
# JWT_SECRET=your_jwt_secret
# COOKIE_SECRET=your_cookie_secret
# STORE_CORS=http://localhost:8000
# ADMIN_CORS=http://localhost:9000
# AUTH_CORS=http://localhost:8000,http://localhost:9000

# 数据库迁移
npx medusa db:migrate

# （可选）初始化演示数据
npm run seed

# 启动开发服务器
npm run dev
```

后端运行于 `http://localhost:9000`，Admin 后台访问 `http://localhost:9000/app`。

---

### 3.4 启动前台（my-store-storefront）

```bash
cd my-store-storefront

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local

# 必填环境变量：
# NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
# NEXT_PUBLIC_BASE_URL=http://localhost:8000
# NEXT_PUBLIC_DEFAULT_REGION=us
# MEDUSA_BACKEND_URL=http://localhost:9000
# REVALIDATE_SECRET=your_revalidate_secret

# 启动开发服务器（Turbopack）
npm run dev
```

前台运行于 `http://localhost:8000`。

---

### 3.5 Admin 后台使用

Admin 后台无需单独启动，随后端服务一起运行，访问地址：`http://localhost:9000/app`

首次使用需创建管理员账户：

```bash
cd my-store
npx medusa user -e admin@example.com -p your_password
```

---

### 3.6 运行测试

**后端单元测试：**
```bash
cd my-store
npm run test:unit
```

**后端集成测试：**
```bash
npm run test:integration:http
```

**前台 E2E 测试（Playwright）：**
```bash
cd my-store-storefront

# 确保前后端均已运行后执行
npm run test:e2e

# 可视化调试模式
npm run test:e2e:ui
```

---

### 3.7 Admin 扩展开发规范

- **新增自定义路由页面**：在 `src/admin/routes/` 下按目录创建，使用 `defineRouteConfig` 注册菜单项。
- **新增 Widget**：在 `src/admin/widgets/` 下创建，使用 `defineWidgetConfig` 注入到指定产品/订单详情页。
- **国际化翻译**：新增文本在 `src/admin/i18n/` 对应语言文件中添加 key-value。
- **新增自定义 API**：在 `src/api/admin/` 或 `src/api/store/` 下按功能目录创建 `route.ts`，文件路径即为 URL 路径。
- **新增模块**：在 `src/modules/` 下创建模块目录，包含 `models/`、`service.ts`、`index.ts`，并在 `medusa-config.ts` 中注册。
- **数据库变更**：修改数据模型后执行 `npx medusa db:migrate` 运行迁移。

---

### 3.8 OpenAPI 文档

```bash
cd my-store

# 预览 Store API 文档
npm run spec:preview:store   # 访问 http://localhost:8080

# 预览 Admin API 文档
npm run spec:preview:admin   # 访问 http://localhost:8081

# 构建 Bundle
npm run spec:bundle
```

---

## 四、部署流程介绍

### 4.1 架构概览

生产环境使用 Docker Compose 编排，整体服务拓扑：

```
Internet
   │
   ▼
[ Nginx ]  ← 反向代理，负责 HTTPS 终结、域名路由
   │
   ├──→ [ Storefront (Next.js) ]  前台商城
   ├──→ [ Backend (MedusaJS) ]   API + Admin 后台
   │          │
   │          ├──→ [ PostgreSQL ]  主数据库
   │          └──→ [ Redis ]       缓存与队列
   │
   └──→ [ Uploads Volume ]        静态文件/上传存储（共享挂载卷）
```

---

### 4.2 构建 Docker 镜像

两个应用各有独立 `Dockerfile`，分别进行多阶段构建（编译 → 精简运行时）：

```bash
# 构建后端镜像
docker build -t my-store:latest ./my-store

# 构建前台镜像
docker build -t my-store-storefront:latest ./my-store-storefront
```

---

### 4.3 配置生产环境变量

在服务器的部署目录创建 `.env` 文件，填写所有生产环境变量：

**后端关键变量：**

```env
DATABASE_URL=postgres://user:password@postgres:5432/dbname
REDIS_URL=redis://:password@redis:6379
JWT_SECRET=<强随机字符串>
COOKIE_SECRET=<强随机字符串>
STORE_CORS=https://your-storefront-domain
ADMIN_CORS=https://your-admin-domain
AUTH_CORS=https://your-storefront-domain,https://your-admin-domain
UPLOAD_DIR=/app/uploads
BACKEND_URL=https://your-api-domain

# 若启用 PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_CONFIG_ENCRYPTION_KEY=<随机密钥>

# 若启用 S3 课程视频存储
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
COURSE_MEDIA_S3_BUCKET=...
COURSE_MEDIA_S3_REGION=...
```

**前台关键变量：**

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://your-api-domain
NEXT_PUBLIC_BASE_URL=https://your-storefront-domain
NEXT_PUBLIC_DEFAULT_REGION=us
MEDUSA_BACKEND_URL=https://your-api-domain
REVALIDATE_SECRET=<随机字符串>
```

---

### 4.4 启动生产服务

```bash
cd deploy

# 启动所有服务（后台运行）
docker compose --env-file ../.env -f docker-compose.yml up -d

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f backend
docker compose logs -f storefront
```

---

### 4.5 数据库初始化（首次部署）

```bash
# 进入后端容器执行迁移
docker compose exec backend npx medusa db:migrate

# （可选）初始化演示数据
docker compose exec backend npx medusa exec ./src/scripts/seed.ts

# 创建管理员账户
docker compose exec backend npx medusa user -e admin@example.com -p your_password
```

---

### 4.6 Nginx 配置说明

`deploy/nginx/` 目录存放 Nginx 配置，职责：

- **HTTPS 终结**：SSL 证书配置在 `deploy/nginx/ssl/` 目录。
- **路由转发**：按域名将请求分别代理到前台（端口 8000）和后端（端口 9000）。
- **静态文件服务**：`/uploads/` 路径直接映射到上传文件卷，避免流量经过 Node.js。
- **Gzip 压缩**：启用响应压缩，降低带宽消耗。

SSL 证书更新（示例，使用 Certbot）：

```bash
certbot certonly --webroot -w /var/www/certbot -d your-domain.com
# 将证书复制到 deploy/nginx/ssl/
docker compose exec nginx nginx -s reload
```

---

### 4.7 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建并替换容器（零停机滚动更新）
docker compose build backend storefront
docker compose up -d --no-deps backend storefront

# 若有数据库变更，执行迁移
docker compose exec backend npx medusa db:migrate
```

---

### 4.8 数据备份

**PostgreSQL 备份：**

```bash
docker compose exec postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup_$(date +%Y%m%d).sql
```

**恢复：**

```bash
cat backup_20260101.sql | docker compose exec -T postgres psql -U $POSTGRES_USER $POSTGRES_DB
```

---

### 4.9 健康检查

| 服务 | 检查地址 |
|------|---------|
| 后端 API | `GET /health` → `{"status":"ok"}` |
| Admin 后台 | `GET /app` → 200 |
| 前台 | `GET /` → 200 |
| PostgreSQL | `pg_isready` |
| Redis | `redis-cli ping` → `PONG` |
