import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

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
    // 文件上传模块：backend_url 控制生成的图片 URL 前缀
    // 本地开发（默认）：upload_dir="static"，Medusa dev server 自动在 /static 下提供静态文件服务
    // Docker 生产环境：通过 UPLOAD_DIR=/app/uploads 将文件写入挂载卷，nginx 从 /uploads/ 对外服务
    {
      resolve: "@medusajs/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/file-local",
            id: "local",
            options: {
              upload_dir: process.env.UPLOAD_DIR || "static",
              backend_url: process.env.BACKEND_URL || "http://localhost:9000/static",
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
  ],
})
