const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * Medusa Cloud-related environment variables
 */
const S3_HOSTNAME = process.env.MEDUSA_CLOUD_S3_HOSTNAME
const S3_PATHNAME = process.env.MEDUSA_CLOUD_S3_PATHNAME
const COURSE_MEDIA_S3_BUCKET = process.env.COURSE_MEDIA_S3_BUCKET
const COURSE_MEDIA_S3_REGION =
  process.env.COURSE_MEDIA_S3_REGION || "ap-southeast-1"
const BLOG_MEDIA_S3_BUCKET =
  process.env.BLOG_MEDIA_S3_BUCKET || process.env.COURSE_MEDIA_S3_BUCKET
const BLOG_MEDIA_S3_REGION =
  process.env.BLOG_MEDIA_S3_REGION || "ap-southeast-1"

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      // 生产环境：明确允许后台与前台域名
      {
        protocol: "https",
        hostname: "admin.wolzq.com",
      },
      {
        protocol: "https",
        hostname: "www.wolzq.com",
      },
      {
        protocol: "https",
        hostname: "wolzq.com",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      // 通配符：允许所有 AWS S3 bucket 域名（格式：bucket.s3.region.amazonaws.com）
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      ...(COURSE_MEDIA_S3_BUCKET
        ? [
            {
              protocol: "https",
              hostname: `${COURSE_MEDIA_S3_BUCKET}.s3.${COURSE_MEDIA_S3_REGION}.amazonaws.com`,
            },
            {
              protocol: "https",
              hostname: `${COURSE_MEDIA_S3_BUCKET}.s3.amazonaws.com`,
            },
          ]
        : []),
      ...(BLOG_MEDIA_S3_BUCKET
        ? [
            {
              protocol: "https",
              hostname: `${BLOG_MEDIA_S3_BUCKET}.s3.${BLOG_MEDIA_S3_REGION}.amazonaws.com`,
            },
            {
              protocol: "https",
              hostname: `${BLOG_MEDIA_S3_BUCKET}.s3.amazonaws.com`,
            },
          ]
        : []),
      ...(S3_HOSTNAME && S3_PATHNAME
        ? [
            {
              protocol: "https",
              hostname: S3_HOSTNAME,
              pathname: S3_PATHNAME,
            },
          ]
        : []),
    ],
  },
}

module.exports = nextConfig
