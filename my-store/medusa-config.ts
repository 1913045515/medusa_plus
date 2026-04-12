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
    // upload_dir 使用绝对路径，避免 medusa start 切换 cwd（/app/.medusa/server）导致路径偏移
    // 生产环境：nginx 直接挂载 ./uploads 卷并在 /uploads/ location 下提供服务
    // 本地开发：http://localhost:9000/uploads（需自行启动静态服务器预览图片）
    {
      resolve: "@medusajs/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/file-local",
            id: "local",
            options: {
              upload_dir: "/app/uploads",
              backend_url: process.env.BACKEND_URL || "http://localhost:9000/uploads",
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
  ],
})
