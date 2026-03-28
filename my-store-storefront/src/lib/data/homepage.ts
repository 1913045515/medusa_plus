import type {
  HomepageContent,
  HomepageStaticTemplateContent,
  HomepageStructuredContent,
} from "types/homepage"
import { getLocale } from "./locale-actions"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL

function getPublishableKey(): string {
  const key =
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY ||
    process.env.MEDUSA_PUBLISHABLE_KEY

  if (!key) {
    throw new Error(
      "Missing publishable key. Set NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY in my-store-storefront/.env.local"
    )
  }

  return key
}

export const defaultHomepageContent: HomepageStructuredContent = {
  render_mode: "structured",
  hero: {
    eyebrow: "AI Cross-Stand",
    title: "Commerce and courses, edited from one admin home",
    subtitle: "Use the backend as the source of truth for your storefront narrative",
    description:
      "The homepage reads live content maintained by admin so operations can adjust messaging, highlights, and featured learning offers without shipping frontend code.",
    background_image_url:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
    primary_cta: {
      label: "Browse Courses",
      href: "/courses",
    },
    secondary_cta: {
      label: "Open Store",
      href: "/store",
    },
  },
  highlights: [
    {
      id: "highlight-1",
      title: "Admin-owned storytelling",
      description: "Hero copy, buttons, and homepage sections are maintained from Medusa admin.",
      icon: "layout",
    },
    {
      id: "highlight-2",
      title: "Built for conversion",
      description: "Put product intent and learning journeys in the same launch surface.",
      icon: "sparkles",
    },
    {
      id: "highlight-3",
      title: "Safe fallback rendering",
      description: "The storefront falls back to defaults if CMS content is unavailable.",
      icon: "shield",
    },
  ],
  featured_courses: [
    {
      id: "featured-course-1",
      title: "React Commerce Intensive",
      description: "A product-minded front-end course for teams building storefront experiences.",
      image_url:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      href: "/courses",
      badge: "Popular",
    },
    {
      id: "featured-course-2",
      title: "Medusa Admin Extensions",
      description: "Learn how to add operator-facing tools and content workflows on top of Medusa.",
      image_url:
        "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
      href: "/courses",
      badge: "Backend",
    },
  ],
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

export function isStaticHomepageContent(
  input: HomepageContent
): input is HomepageStaticTemplateContent {
  return input.render_mode === "static_html"
}

function normalizeStructuredHomepageContent(
  input?: Partial<HomepageStructuredContent> | null
): HomepageStructuredContent {
  return {
    render_mode: "structured",
    hero: {
      eyebrow: input?.hero?.eyebrow ?? defaultHomepageContent.hero.eyebrow,
      title: input?.hero?.title?.trim() || defaultHomepageContent.hero.title,
      subtitle: input?.hero?.subtitle ?? defaultHomepageContent.hero.subtitle,
      description: input?.hero?.description ?? defaultHomepageContent.hero.description,
      background_image_url:
        input?.hero?.background_image_url ?? defaultHomepageContent.hero.background_image_url,
      primary_cta: {
        label:
          input?.hero?.primary_cta?.label?.trim() || defaultHomepageContent.hero.primary_cta.label,
        href:
          input?.hero?.primary_cta?.href?.trim() || defaultHomepageContent.hero.primary_cta.href,
      },
      secondary_cta: input?.hero?.secondary_cta
        ? {
            label:
              input.hero.secondary_cta.label?.trim() ||
              defaultHomepageContent.hero.secondary_cta?.label ||
              "Learn More",
            href:
              input.hero.secondary_cta.href?.trim() ||
              defaultHomepageContent.hero.secondary_cta?.href ||
              "/",
          }
        : defaultHomepageContent.hero.secondary_cta,
    },
    highlights: (input?.highlights ?? defaultHomepageContent.highlights).map((item, index) => ({
      id: item.id || `highlight-${index + 1}`,
      title: item.title?.trim() || `Highlight ${index + 1}`,
      description: item.description?.trim() || "",
      icon: item.icon ?? null,
    })),
    featured_courses: (input?.featured_courses ?? defaultHomepageContent.featured_courses).map(
      (item, index) => ({
        id: item.id || `featured-course-${index + 1}`,
        title: item.title?.trim() || `Featured Course ${index + 1}`,
        description: item.description?.trim() || "",
        image_url: item.image_url ?? null,
        href: item.href?.trim() || "/courses",
        badge: item.badge ?? null,
      })
    ),
  }
}

function normalizeStaticHomepageContent(
  input?: Partial<HomepageStaticTemplateContent> | null
): HomepageStaticTemplateContent | null {
  const html = sanitizeTemplateHtml(input?.template?.html)
  const css = sanitizeTemplateCss(input?.template?.css)

  if (!html) {
    return null
  }

  return {
    render_mode: "static_html",
    template: {
      html,
      css,
    },
  }
}

function normalizeHomepageContent(input?: Partial<HomepageContent> | null): HomepageContent {
  if (input?.render_mode === "static_html" || input?.template) {
    return normalizeStaticHomepageContent(input as Partial<HomepageStaticTemplateContent> | null) ?? defaultHomepageContent
  }

  return normalizeStructuredHomepageContent(input as Partial<HomepageStructuredContent> | null)
}

export async function getHomepageContent(siteKey: string, localeArg?: string | null): Promise<HomepageContent> {
  if (!BACKEND_URL) {
    return defaultHomepageContent
  }

  try {
    const locale = localeArg ?? (await getLocale())
    const url = new URL(`${BACKEND_URL}/store/homepage-content`)
    url.searchParams.set("site_key", siteKey)

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-publishable-api-key": getPublishableKey(),
        ...(locale ? { "x-medusa-locale": locale } : {}),
      },
      cache: "no-store",
    })

    if (!res.ok) {
      return defaultHomepageContent
    }

    const data = (await res.json()) as { homepage?: HomepageContent }
    return normalizeHomepageContent(data.homepage)
  } catch {
    return defaultHomepageContent
  }
}