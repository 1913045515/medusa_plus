import { defineMiddlewares, authenticate } from "@medusajs/framework/http"

/**
 * 全局 API 中间件配置
 *
 * store 博客路由需要「可选鉴权」：
 *   - 匿名用户可以正常访问（allowUnauthenticated: true）
 *   - 已登录用户的 JWT token 会被解析并挂载到 req.auth_context
 *     从而使博客的 visibility 过滤（user / group）能够正常工作
 */
export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/blogs*",
      middlewares: [
        authenticate("customer", ["bearer", "session"], {
          allowUnauthenticated: true,
        }),
      ],
    },
    {
      matcher: "/admin/content-pages*",
      middlewares: [
        authenticate("user", ["bearer", "session"]),
      ],
    },
    {
      matcher: "/store/content-pages*",
      middlewares: [
        authenticate("customer", ["bearer", "session"], {
          allowUnauthenticated: true,
        }),
      ],
    },
    // Ticket: store routes are open (guest + logged-in), but parse auth if present
    {
      matcher: "/store/tickets*",
      middlewares: [
        authenticate("customer", ["bearer", "session"], {
          allowUnauthenticated: true,
        }),
      ],
    },
    // Ticket: admin routes require admin authentication
    {
      matcher: "/admin/tickets*",
      middlewares: [
        authenticate("user", ["bearer", "session"]),
      ],
    },
    {
      matcher: "/admin/menu-items*",
      middlewares: [
        authenticate("user", ["bearer", "session"]),
      ],
    },
  ],
})
