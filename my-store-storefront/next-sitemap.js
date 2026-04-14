const excludedPaths = ["/checkout", "/account/*"]

const BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://localhost:9000"

const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  process.env.MEDUSA_PUBLISHABLE_KEY ||
  ""

module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_VERCEL_URL,
  generateRobotsTxt: true,
  exclude: excludedPaths + ["/[sitemap]"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: "*",
        disallow: excludedPaths,
      },
    ],
  },
  additionalPaths: async (config) => {
    const paths = []
    try {
      const res = await fetch(`${BACKEND_URL}/store/blogs?limit=200&status=published`, {
        headers: { "x-publishable-api-key": PUBLISHABLE_KEY },
      })
      if (res.ok) {
        const data = await res.json()
        const posts = data.posts || []
        for (const post of posts) {
          if (post.visibility === "all") {
            paths.push({
              loc: `/blog/${post.slug}`,
              lastmod: post.updated_at,
              changefreq: "weekly",
              priority: 0.7,
            })
          }
        }
      }
    } catch (e) {
      console.warn("Sitemap: Failed to fetch blog posts:", e.message)
    }
    try {
      const res = await fetch(`${BACKEND_URL}/store/blog-categories`, {
        headers: { "x-publishable-api-key": PUBLISHABLE_KEY },
      })
      if (res.ok) {
        const data = await res.json()
        const categories = data.categories || []
        for (const cat of categories) {
          paths.push({
            loc: `/blog/category/${cat.slug}`,
            changefreq: "weekly",
            priority: 0.5,
          })
        }
      }
    } catch (e) {
      console.warn("Sitemap: Failed to fetch blog categories:", e.message)
    }
    return paths
  },
}
