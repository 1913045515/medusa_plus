import Link from "next/link"
import { Button, Heading, Text } from "@medusajs/ui"
import type { HomepageHero } from "types/homepage"

const Hero = ({ hero }: { hero: HomepageHero }) => {
  return (
    <section className="relative overflow-hidden border-b border-ui-border-base bg-[#0f172a] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: hero.background_image_url ? `url(${hero.background_image_url})` : undefined }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.34),_transparent_35%),linear-gradient(135deg,_rgba(15,23,42,0.9),_rgba(12,74,110,0.82))]" />

      <div className="relative content-container py-20 small:py-28 grid gap-8 small:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] items-end">
        <div className="max-w-3xl">
          <Text className="mb-4 uppercase tracking-[0.28em] text-sm text-white/70">
            {hero.eyebrow}
          </Text>
          <Heading level="h1" className="text-5xl small:text-7xl leading-[1.02] text-white font-normal">
            {hero.title}
          </Heading>
          {hero.subtitle ? (
            <Heading level="h2" className="mt-4 text-2xl small:text-3xl leading-tight text-white/85 font-normal">
              {hero.subtitle}
            </Heading>
          ) : null}
          {hero.description ? (
            <Text className="mt-6 max-w-2xl text-base small:text-lg leading-7 text-white/72">
              {hero.description}
            </Text>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={hero.primary_cta.href}>
              <Button className="rounded-full px-6 bg-white text-ui-fg-base hover:bg-white/90">
                {hero.primary_cta.label}
              </Button>
            </Link>
            {hero.secondary_cta ? (
              <Link href={hero.secondary_cta.href}>
                <Button variant="transparent" className="rounded-full px-6 border border-white/30 text-white hover:bg-white/10">
                  {hero.secondary_cta.label}
                </Button>
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[28px] border border-white/15 bg-white/10 backdrop-blur-md p-6">
            <Text className="text-xs uppercase tracking-[0.22em] text-white/60">Publishing model</Text>
            <Text className="mt-3 text-xl leading-8 text-white/90">
              Admin edits structured homepage content. Storefront renders only published data.
            </Text>
          </div>
          <div className="rounded-[28px] border border-white/15 bg-black/20 p-6">
            <Text className="text-xs uppercase tracking-[0.22em] text-white/60">Operational benefit</Text>
            <Text className="mt-3 text-sm leading-6 text-white/75">
              Marketing can update the message, CTA, and featured learning offers without frontend deployments.
            </Text>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
