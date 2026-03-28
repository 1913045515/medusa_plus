import type { HomepageStaticTemplateContent } from "types/homepage"

const HomepageTemplate = ({ template }: { template: HomepageStaticTemplateContent }) => {
  return (
    <section className="cms-homepage-template">
      {template.template.css ? <style dangerouslySetInnerHTML={{ __html: template.template.css }} /> : null}
      <div dangerouslySetInnerHTML={{ __html: template.template.html }} />
    </section>
  )
}

export default HomepageTemplate