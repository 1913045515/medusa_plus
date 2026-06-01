import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

if (!process.env.PAYPAL_CONFIG_ENCRYPTION_KEY) {
  console.warn(
    '[PayPal] WARNING: PAYPAL_CONFIG_ENCRYPTION_KEY is not set. ' +
    'PayPal payment configuration will not work until this environment variable is provided.'
  )
}

// 微信支付：只有在必要 env 均存在时才启用，避免本地开发环境在未填配置时反复报错。
// 如需强制关闭，可设 WECHATPAY_DISABLED=true。
const wechatPayEnabled =
  process.env.WECHATPAY_DISABLED !== 'true' &&
  !!process.env.WECHATPAY_APP_ID &&
  !!process.env.WECHATPAY_MCH_ID &&
  !!process.env.WECHATPAY_API_V3_KEY

if (!wechatPayEnabled) {
  console.warn(
    '[WechatPay] 已禁用微信支付提供方（未检测到必要 env）。' +
    '请配置 WECHATPAY_APP_ID / WECHATPAY_MCH_ID / WECHATPAY_API_V3_KEY 后重启。'
  )
}

process.env.COURSE_MEDIA_S3_REGION =
  process.env.COURSE_MEDIA_S3_REGION || process.env.AWS_REGION || 'ap-southeast-1'
process.env.COURSE_MEDIA_S3_MAX_FILE_SIZE_BYTES =
  process.env.COURSE_MEDIA_S3_MAX_FILE_SIZE_BYTES || `${2 * 1024 * 1024 * 1024}`
process.env.COURSE_MEDIA_SIGNED_URL_TTL_SECONDS =
  process.env.COURSE_MEDIA_SIGNED_URL_TTL_SECONDS || `${2 * 60 * 60}`

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
      jwtExpiresIn: "7d",
    }
  },
  admin: {
    disable: false,
  },
  modules: [
    // 文件上传模块：使用公有 S3 桶存储产品主图，与博客图片使用同一公有桶
    // 上传后直接返回 S3 公有 URL，不经过网站服务器，节省带宽
    {
      resolve: "@medusajs/file",
      options: {
        providers: [
          {
            resolve: "./src/providers/public-s3-file",
            id: "s3",
            options: {
              file_url:
                process.env.FILE_S3_URL ||
                `https://${process.env.BLOG_MEDIA_S3_BUCKET || process.env.COURSE_MEDIA_S3_BUCKET}.s3.${process.env.BLOG_MEDIA_S3_REGION || process.env.COURSE_MEDIA_S3_REGION || 'ap-southeast-1'}.amazonaws.com`,
              access_key_id:
                process.env.BLOG_MEDIA_S3_ACCESS_KEY_ID ||
                process.env.COURSE_MEDIA_S3_ACCESS_KEY_ID,
              secret_access_key:
                process.env.BLOG_MEDIA_S3_SECRET_ACCESS_KEY ||
                process.env.COURSE_MEDIA_S3_SECRET_ACCESS_KEY,
              region:
                process.env.BLOG_MEDIA_S3_REGION ||
                process.env.COURSE_MEDIA_S3_REGION ||
                'ap-southeast-1',
              bucket:
                process.env.BLOG_MEDIA_S3_BUCKET ||
                process.env.COURSE_MEDIA_S3_BUCKET,
              prefix: "products/",
              cache_control: "public, max-age=31536000",
            },
          },
        ],
      },
    },
    {
      resolve: "./src/modules/video",
    },
    {
      resolve: "./src/modules/course",
    },
    {
      resolve: "./src/modules/product-detail",
    },
    {
      resolve: "./src/modules/site-analytics",
    },
    {
      resolve: "./src/modules/store-settings",
    },
    {
      resolve: "./src/modules/email-proxy",
    },
    {
      resolve: "./src/modules/password-reset",
    },
    {
      resolve: "./src/modules/email-otp",
    },
    {
      resolve: "./src/modules/blog",
    },
    {
      resolve: "./src/modules/content-pages",
    },
    {
      resolve: "./src/modules/ticket",
    },
    {
      resolve: "./src/modules/menu",
    },
    {
      resolve: "./src/modules/paypal",
    },
    {
      resolve: "./src/modules/file-asset",
    },
    // 支付提供方：PayPal + 微信支付 APIv3（微信仅在 env 齐备时注册）
    {
      resolve: "@medusajs/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/paypal/paypal-payment-provider",
            id: "paypal",
          },
          ...(wechatPayEnabled
            ? [
                {
                  resolve: "./src/modules/wechatpay/wechatpay-payment-provider",
                  id: "wechat",
                },
              ]
            : []),
        ],
      },
    },
  ],
})
