# 换域名时代码层面需修改的位置

> **结论**：代码层面真正硬编码了当前域名的**只有一处**（`next.config.js`）。
> 其余所有域名引用均通过环境变量读取，换域名只需更新 `.env` / 部署环境变量即可。

---

## 一、代码中硬编码域名（必须改代码）

### `my-store-storefront/next.config.js` — L46~56

Next.js 图片白名单 `images.remotePatterns`，当前写死了三条生产域名：

```js
{ protocol: "https", hostname: "admin.wolzq.com" },
{ protocol: "https", hostname: "www.wolzq.com"   },
{ protocol: "https", hostname: "wolzq.com"        },
```

**换域名后需修改**：将上述三条替换为新域名，例如：

```js
{ protocol: "https", hostname: "admin.newdomain.com" },
{ protocol: "https", hostname: "www.newdomain.com"   },
{ protocol: "https", hostname: "newdomain.com"        },
```

---

## 二、通过环境变量控制（只改 .env，不改代码）

以下域名相关逻辑全部从环境变量读取，**代码无需改动**。

| 环境变量 | 用途 | 使用位置（代码文件摘要） |
|---|---|---|
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` / `MEDUSA_BACKEND_URL` | 后端 API 地址（all store/api routes） | `middleware.ts`、所有 `src/lib/data/*.ts`、所有 `src/app/api/**` |
| `NEXT_PUBLIC_BASE_URL` | 前台站点根 URL（用于 `metadataBase`、Open Graph） | `src/lib/util/env.ts` → `getBaseURL()` → `src/app/layout.tsx`、`src/app/[countryCode]/(main)/layout.tsx` |
| `NEXT_PUBLIC_STORE_URL` | RSS Feed 中的站点 URL | `src/app/feed/rss.xml/route.ts` |
| `STORE_URL` / `STORE_CORS` | 邮件中的商店链接、密码重置跳转链接 | `my-store/src/api/store/auth/email-otp/send/route.ts`、`my-store/src/api/store/password-reset/request/route.ts`、`my-store/src/subscribers/order-placed.ts` |
| `ADMIN_URL` | 管理员密码重置邮件中的后台链接 | `my-store/src/subscribers/auth-admin-password-reset.ts` |
| `ADMIN_CORS` / `STORE_CORS` | CORS 跨域白名单 | `my-store-storefront/src/app/api/revalidate-menu/route.ts` |
| `NEXT_PUBLIC_VERCEL_URL` | Sitemap 站点地址 | `my-store-storefront/next-sitemap.js` |

---

## 三、不需要改的第三方 URL（与自有域名无关）

以下硬编码 URL 属于第三方服务或占位素材，换域名不影响：

| URL | 位置 | 说明 |
|---|---|---|
| `https://api.ipify.org` | `src/lib/analytics/client.ts:59` | 公共 IP 检测服务 |
| `https://images.unsplash.com/...` | `src/lib/data/homepage.ts`、`my-store/src/modules/course/services/homepage-content.service.ts` | 首页默认背景图（占位） |
| `https://via.placeholder.com/...` | seed 脚本、lesson/course repositories | 开发环境占位缩略图 |
| `https://www.w3schools.com/html/mov_bbb.mp4` | seed 脚本、lesson repositories | 开发环境示例视频 |
| `https://twitter.com/intent/tweet`、`https://www.facebook.com/sharer`、`https://service.weibo.com/share` | `src/modules/blog/templates/blog-detail.tsx` | 博客分享按钮（动态拼接当前页 URL） |
| `https://amzn-s3-lzq-bucket.s3.ap-southeast-1.amazonaws.com/` | 单元测试文件 | 测试 mock 数据，不影响生产 |
| `https://medusa-public-images.s3.eu-west-1.amazonaws.com/` | `my-store/src/scripts/seed.ts` | seed 脚本商品图片 |

---

## 四、换域名操作清单

```
1. [代码] 修改 my-store-storefront/next.config.js
          images.remotePatterns 中的三条 wolzq.com → 新域名

2. [环境变量] 部署时更新以下变量：
   前台 (.env / 容器环境变量)：
     NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.newdomain.com
     NEXT_PUBLIC_BASE_URL=https://www.newdomain.com
     NEXT_PUBLIC_STORE_URL=https://www.newdomain.com

   后台 (.env / 容器环境变量)：
     STORE_URL=https://www.newdomain.com
     STORE_CORS=https://www.newdomain.com
     ADMIN_CORS=https://admin.newdomain.com
     BACKEND_URL=https://api.newdomain.com
     ADMIN_URL=https://admin.newdomain.com

3. [基础设施] nginx 配置文件中的 server_name（属于配置文件，已排除）

4. [重新构建] 前台镜像需重新 docker build（NEXT_PUBLIC_* 变量在构建时注入）
```
