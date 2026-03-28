export type HomepageCta = {
  label: string
  href: string
}

export type HomepageHero = {
  eyebrow: string | null
  title: string
  subtitle: string | null
  description: string | null
  background_image_url: string | null
  primary_cta: HomepageCta
  secondary_cta: HomepageCta | null
}

export type HomepageHighlightItem = {
  id: string
  title: string
  description: string
  icon: string | null
}

export type HomepageFeaturedCourseItem = {
  id: string
  title: string
  description: string
  image_url: string | null
  href: string
  badge: string | null
}

export type HomepageStructuredContent = {
  render_mode: "structured"
  hero: HomepageHero
  highlights: HomepageHighlightItem[]
  featured_courses: HomepageFeaturedCourseItem[]
}

export type HomepageStaticTemplateContent = {
  render_mode: "static_html"
  template: {
    html: string
    css: string
  }
}

export type HomepageContent = HomepageStructuredContent | HomepageStaticTemplateContent