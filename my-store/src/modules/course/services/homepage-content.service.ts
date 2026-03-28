import type {
  CreateHomepageContentInput,
  HomepageContentPayload,
  HomepageContentRecord,
  HomepageStaticTemplatePayload,
  HomepageStructuredContentPayload,
  UpsertHomepageContentInput,
} from "../types"
import type { IHomepageContentRepository } from "../repositories/homepage-content.repository"

export const DEFAULT_HOMEPAGE_CONTENT: HomepageStructuredContentPayload = {
  render_mode: "structured",
  hero: {
    eyebrow: "AI Cross-Stand",
    title: "把商城与课程体验放到一个首页里",
    subtitle: "商品成交与内容转化共用一个运营入口",
    description:
      "在后台统一维护首页主视觉、卖点区块和精选课程，前台只负责把内容稳定渲染出来。",
    background_image_url:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
    primary_cta: {
      label: "立即查看课程",
      href: "/courses",
    },
    secondary_cta: {
      label: "进入商城",
      href: "/store",
    },
  },
  highlights: [
    {
      id: "highlight-1",
      title: "后台统一维护",
      description: "运营同学在 admin 中调整首页文案、按钮和推荐内容，无需改前端代码。",
      icon: "layout",
    },
    {
      id: "highlight-2",
      title: "课程与商品联动",
      description: "首页可以同时承载课程推荐、商品引流和活动入口。",
      icon: "sparkles",
    },
    {
      id: "highlight-3",
      title: "前台稳定兜底",
      description: "即使后台内容未配置完整，首页依然能使用默认内容正常展示。",
      icon: "shield",
    },
  ],
  featured_courses: [
    {
      id: "featured-course-1",
      title: "React 商城实战课",
      description: "用真实商城业务拆解前台页面、状态和数据流设计。",
      image_url:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      href: "/courses",
      badge: "热门课程",
    },
    {
      id: "featured-course-2",
      title: "Medusa 后台扩展课",
      description: "学习如何扩展 admin、API 与模块，建立面向运营的后台能力。",
      image_url:
        "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
      href: "/courses",
      badge: "后台实践",
    },
  ],
}

export const EMPTY_STATIC_HOMEPAGE_TEMPLATE: HomepageStaticTemplatePayload = {
  render_mode: "static_html",
  template: {
    html: "",
    css: "",
  },
}

const SCRIPT_TAG_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gis
const STYLE_TAG_REGEX = /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gis
const EVENT_HANDLER_ATTR_REGEX = /\son[a-z-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi
const JS_URL_ATTR_REGEX = /\s(href|src|xlink:href|formaction)\s*=\s*(["'])\s*javascript:[^"']*\2/gi

function sanitizeTemplateHtml(html?: string | null): string {
  return (html ?? "")
    .replace(SCRIPT_TAG_REGEX, "")
    .replace(STYLE_TAG_REGEX, "")
    .replace(EVENT_HANDLER_ATTR_REGEX, "")
    .replace(JS_URL_ATTR_REGEX, ' $1="#"')
    .trim()
}

function sanitizeTemplateCss(css?: string | null): string {
  return (css ?? "")
    .replace(/@import\s+[^;]+;?/gi, "")
    .replace(/expression\s*\(/gi, "(")
    .replace(/javascript\s*:/gi, "")
    .trim()
}

function isStaticTemplatePayload(
  content?: Partial<HomepageContentPayload> | null
): content is Partial<HomepageStaticTemplatePayload> {
  return content?.render_mode === "static_html" || Boolean((content as any)?.template)
}

function normalizeStructuredPayload(
  content?: Partial<HomepageStructuredContentPayload> | null
): HomepageStructuredContentPayload {
  return {
    render_mode: "structured",
    hero: {
      eyebrow: content?.hero?.eyebrow ?? DEFAULT_HOMEPAGE_CONTENT.hero.eyebrow,
      title: content?.hero?.title?.trim() || DEFAULT_HOMEPAGE_CONTENT.hero.title,
      subtitle: content?.hero?.subtitle ?? DEFAULT_HOMEPAGE_CONTENT.hero.subtitle,
      description: content?.hero?.description ?? DEFAULT_HOMEPAGE_CONTENT.hero.description,
      background_image_url:
        content?.hero?.background_image_url ?? DEFAULT_HOMEPAGE_CONTENT.hero.background_image_url,
      primary_cta: {
        label:
          content?.hero?.primary_cta?.label?.trim() || DEFAULT_HOMEPAGE_CONTENT.hero.primary_cta.label,
        href:
          content?.hero?.primary_cta?.href?.trim() || DEFAULT_HOMEPAGE_CONTENT.hero.primary_cta.href,
      },
      secondary_cta: content?.hero?.secondary_cta
        ? {
            label:
              content.hero.secondary_cta.label?.trim() ||
              DEFAULT_HOMEPAGE_CONTENT.hero.secondary_cta?.label ||
              "了解更多",
            href:
              content.hero.secondary_cta.href?.trim() ||
              DEFAULT_HOMEPAGE_CONTENT.hero.secondary_cta?.href ||
              "/",
          }
        : DEFAULT_HOMEPAGE_CONTENT.hero.secondary_cta,
    },
    highlights: (content?.highlights ?? DEFAULT_HOMEPAGE_CONTENT.highlights)
      .slice(0, 3)
      .map((item, index) => ({
        id: item.id?.trim() || `highlight-${index + 1}`,
        title: item.title?.trim() || `卖点 ${index + 1}`,
        description: item.description?.trim() || "",
        icon: item.icon ?? null,
      })),
    featured_courses: (content?.featured_courses ?? DEFAULT_HOMEPAGE_CONTENT.featured_courses).map(
      (item, index) => ({
        id: item.id?.trim() || `featured-course-${index + 1}`,
        title: item.title?.trim() || `精选内容 ${index + 1}`,
        description: item.description?.trim() || "",
        image_url: item.image_url ?? null,
        href: item.href?.trim() || "/courses",
        badge: item.badge ?? null,
      })
    ),
  }
}

function normalizeStaticTemplatePayload(
  content?: Partial<HomepageStaticTemplatePayload> | null
): HomepageStaticTemplatePayload {
  return {
    render_mode: "static_html",
    template: {
      html: sanitizeTemplateHtml(content?.template?.html ?? EMPTY_STATIC_HOMEPAGE_TEMPLATE.template.html),
      css: sanitizeTemplateCss(content?.template?.css ?? EMPTY_STATIC_HOMEPAGE_TEMPLATE.template.css),
    },
  }
}

function normalizePayload(content?: Partial<HomepageContentPayload> | null): HomepageContentPayload {
  if (isStaticTemplatePayload(content)) {
    return normalizeStaticTemplatePayload(content)
  }

  return normalizeStructuredPayload(content as Partial<HomepageStructuredContentPayload> | null)
}

export class HomepageContentService {
  constructor(private readonly homepageContentRepo: IHomepageContentRepository) {}

  private normalizeLocale(locale?: string | null): string | null {
    const trimmed = locale?.trim()
    return trimmed ? trimmed : null
  }

  private resolveHomepageContentVariant(
    record: HomepageContentRecord,
    locale?: string | null
  ): HomepageContentPayload {
    const normalizedLocale = this.normalizeLocale(locale)
    const localizedContent = normalizedLocale ? record.translations?.[normalizedLocale] : null
    return normalizePayload(localizedContent ?? record.content)
  }

  private async buildDuplicateHandle(sourceHandle: string): Promise<string> {
    const normalizedBase = `${sourceHandle.trim()}-copy`
    let nextHandle = normalizedBase
    let counter = 2

    while (await this.homepageContentRepo.findByHandle(nextHandle)) {
      nextHandle = `${normalizedBase}-${counter}`
      counter += 1
    }

    return nextHandle
  }

  private buildDuplicateTitle(sourceTitle: string): string {
    const trimmedTitle = sourceTitle.trim()
    return trimmedTitle ? `${trimmedTitle} 副本` : "首页模板副本"
  }

  async getPublishedHomepageContent(locale?: string | null, siteKey: string = "default"): Promise<HomepageContentRecord> {
    let current = await this.homepageContentRepo.findActivePublished(siteKey)
    if (!current && siteKey !== "default") {
      current = await this.homepageContentRepo.findActivePublished("default")
    }
    if (current) {
      return {
        ...current,
        content: this.resolveHomepageContentVariant(current, locale),
      }
    }

    return {
      id: "homepage_main",
      title: "默认首页",
      handle: "main",
      site_key: siteKey,
      status: "published",
      is_active: true,
      published_at: null,
      content: DEFAULT_HOMEPAGE_CONTENT,
      translations: null,
      metadata: null,
      created_at: null,
      updated_at: null,
    }
  }

  async listHomepageContents(locale?: string | null): Promise<HomepageContentRecord[]> {
    const items = await this.homepageContentRepo.listAll()
    return items.map((item) => ({
      ...item,
      content: this.resolveHomepageContentVariant(item, locale),
    }))
  }

  async createHomepageContent(input: CreateHomepageContentInput): Promise<HomepageContentRecord> {
    if (!input.title.trim()) {
      throw new Error("Homepage title is required")
    }

    if (!input.handle.trim()) {
      throw new Error("Homepage handle is required")
    }

    const existing = await this.homepageContentRepo.findByHandle(input.handle.trim())
    if (existing) {
      throw new Error(`Homepage handle '${input.handle}' already exists`)
    }

    return this.homepageContentRepo.create({
      ...input,
      title: input.title.trim(),
      handle: input.handle.trim(),
      site_key: input.site_key?.trim() || "default",
      status: input.status ?? "draft",
      content: normalizePayload(input.content ?? EMPTY_STATIC_HOMEPAGE_TEMPLATE),
      translations: input.translations ?? null,
    })
  }

  async saveHomepageContent(input: UpsertHomepageContentInput): Promise<HomepageContentRecord> {
    if (!input.id) {
      throw new Error("Homepage id is required")
    }

    const normalized = normalizePayload(input.content)

    if (normalized.render_mode === "structured") {
      if (!normalized.hero.title.trim()) {
        throw new Error("Hero title is required")
      }

      if (!normalized.hero.primary_cta.href.trim()) {
        throw new Error("Primary CTA link is required")
      }
    }

    if (input.status === "published" && normalized.render_mode === "static_html") {
      if (!normalized.template.html.trim()) {
        throw new Error("Template HTML is required before publish")
      }
    }

    const updated = await this.homepageContentRepo.update(input.id, {
      id: input.id,
      title: input.title?.trim(),
      handle: input.handle?.trim(),
      site_key: input.site_key?.trim() || undefined,
      status: input.status ?? "draft",
      is_active: input.is_active ?? false,
      content: normalized,
      translations: input.translations ?? null,
      metadata: input.metadata ?? null,
    })

    if (!updated) {
      throw new Error(`Homepage ${input.id} not found`)
    }

    return {
      ...updated,
      content: normalizePayload(updated.content),
    }
  }

  async publishHomepageContent(id: string): Promise<HomepageContentRecord> {
    const current = await this.homepageContentRepo.findById(id)
    const published = await this.homepageContentRepo.publish(id, current?.site_key ?? "default")
    if (!published) {
      throw new Error(`Homepage ${id} not found`)
    }

    return {
      ...published,
      content: normalizePayload(published.content),
    }
  }

  async duplicateHomepageContent(id: string): Promise<HomepageContentRecord> {
    const source = await this.homepageContentRepo.findById(id)

    if (!source) {
      throw new Error(`Homepage ${id} not found`)
    }

    const nextHandle = await this.buildDuplicateHandle(source.handle)

    const duplicated = await this.homepageContentRepo.create({
      title: this.buildDuplicateTitle(source.title),
      handle: nextHandle,
      site_key: source.site_key,
      status: "draft",
      is_active: false,
      content: normalizePayload(source.content),
      translations: source.translations ?? null,
      metadata: source.metadata ?? null,
    })

    return {
      ...duplicated,
      content: normalizePayload(duplicated.content),
    }
  }

  async deleteHomepageContent(id: string): Promise<void> {
    const current = await this.homepageContentRepo.findById(id)

    if (!current) {
      throw new Error(`Homepage ${id} not found`)
    }

    if (current.is_active) {
      throw new Error("Active homepage template cannot be deleted")
    }

    const deleted = await this.homepageContentRepo.delete(id)

    if (!deleted) {
      throw new Error(`Homepage ${id} could not be deleted`)
    }
  }
}