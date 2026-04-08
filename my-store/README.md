<p align="center">
  <a href="https://www.medusajs.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    <img alt="Medusa logo" src="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    </picture>
  </a>
</p>
<h1 align="center">
  Medusa
</h1>

<h4 align="center">
  <a href="https://docs.medusajs.com">Documentation</a> |
  <a href="https://www.medusajs.com">Website</a>
</h4>

<p align="center">
  Building blocks for digital commerce
</p>
<p align="center">
  <a href="https://github.com/medusajs/medusa/blob/master/CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="PRs welcome!" />
  </a>
    <a href="https://www.producthunt.com/posts/medusa"><img src="https://img.shields.io/badge/Product%20Hunt-%231%20Product%20of%20the%20Day-%23DA552E" alt="Product Hunt"></a>
  <a href="https://discord.gg/xpCwq3Kfn8">
    <img src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg" alt="Discord Chat" />
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=medusajs">
    <img src="https://img.shields.io/twitter/follow/medusajs.svg?label=Follow%20@medusajs" alt="Follow @medusajs" />
  </a>
</p>

## Compatibility

This starter is compatible with versions >= 2 of `@medusajs/medusa`. 

## Getting Started

Visit the [Quickstart Guide](https://docs.medusajs.com/learn/installation) to set up a server.

Visit the [Docs](https://docs.medusajs.com/learn/installation#get-started) to learn more about our system requirements.

## Course Media S3 Configuration

The course admin and storefront media flow now support S3-backed course thumbnails, lesson thumbnails, and lesson videos.

Set these environment variables in local and production environments:

- COURSE_MEDIA_S3_BUCKET: target S3 bucket name.
- COURSE_MEDIA_S3_REGION: S3 region. Defaults to ap-southeast-1.
- COURSE_MEDIA_S3_ACCESS_KEY_ID: IAM access key for server-side uploads, deletes, and signed URL generation.
- COURSE_MEDIA_S3_SECRET_ACCESS_KEY: IAM secret key paired with the access key above.
- COURSE_MEDIA_S3_MAX_FILE_SIZE_BYTES: optional upload limit in bytes. Defaults to 2147483648 (2 GB).
- COURSE_MEDIA_SIGNED_URL_TTL_SECONDS: optional signed URL lifetime in seconds. Defaults to 7200.

Notes:

- Do not commit S3 credentials to the repository. Load them from .env files, secret managers, or your deployment platform.
- The admin stores permanent S3 object metadata in the database, but the storefront only receives time-limited signed URLs.
- Existing legacy thumbnail_url and video_url values remain untouched until an editor uploads replacement media.

Recommended post-deploy validation:

1. Upload a course thumbnail, a lesson thumbnail, and a lesson video in admin.
2. Confirm the admin UI shows file name, type, and size instead of the permanent S3 URL.
3. Open the storefront course detail page and verify thumbnails load through signed URLs.
4. Play a lesson and confirm the /store/lessons/:id/play response includes video_url_expires_at and video_url_expires_in_seconds.
5. After the signed URL expires, confirm the player shows the refresh-access prompt and can fetch a new URL.

## What is Medusa

Medusa is a set of commerce modules and tools that allow you to build rich, reliable, and performant commerce applications without reinventing core commerce logic. The modules can be customized and used to build advanced ecommerce stores, marketplaces, or any product that needs foundational commerce primitives. All modules are open-source and freely available on npm.

Learn more about [Medusa’s architecture](https://docs.medusajs.com/learn/introduction/architecture) and [commerce modules](https://docs.medusajs.com/learn/fundamentals/modules/commerce-modules) in the Docs.

## Build with AI Agents

### Claude Code Plugin

If you use AI agents like Claude Code, check out the [medusa-dev Claude Code plugin](https://github.com/medusajs/medusa-claude-plugins).

### Other Agents

If you use AI agents other than Claude Code, copy the [skills directory](https://github.com/medusajs/medusa-claude-plugins/tree/main/plugins/medusa-dev/skills) into your agent's relevant `skills` directory.

### MCP Server

You can also add the MCP server `https://docs.medusajs.com/mcp` to your AI agents to answer questions related to Medusa. The `medusa-dev` Claude Code plugin includes this MCP server by default.

## Community & Contributions

The community and core team are available in [GitHub Discussions](https://github.com/medusajs/medusa/discussions), where you can ask for support, discuss roadmap, and share ideas.

Join our [Discord server](https://discord.com/invite/medusajs) to meet other community members.

## Other channels

- [GitHub Issues](https://github.com/medusajs/medusa/issues)
- [Twitter](https://twitter.com/medusajs)
- [LinkedIn](https://www.linkedin.com/company/medusajs)
- [Medusa Blog](https://medusajs.com/blog/)
