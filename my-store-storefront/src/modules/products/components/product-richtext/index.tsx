"use client"

import DOMPurify from "isomorphic-dompurify"
import "./richtext.css"

type ProductRichtextProps = {
  html: string | null
  sectionTitle?: string
  wrapperClassName?: string
}

export default function ProductRichtext({ html, sectionTitle, wrapperClassName }: ProductRichtextProps) {
  if (!html) return null

  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr",
      "strong", "em", "u", "s", "del", "ins",
      "a", "img",
      "ul", "ol", "li",
      "blockquote", "pre", "code",
      "table", "thead", "tbody", "tfoot", "tr", "th", "td",
      "span", "div", "sub", "sup",
      "figure", "figcaption",
    ],
    ALLOWED_ATTR: [
      "href", "target", "rel", "title",
      "src", "alt", "width", "height",
      "class", "style",
      "colspan", "rowspan",
    ],
  })

  return (
    <div className={wrapperClassName ?? "product-richtext-wrapper"}>
      {sectionTitle && (
        <h3 className="text-lg font-semibold text-ui-fg-base mb-4">{sectionTitle}</h3>
      )}
      <div
        className="product-richtext"
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    </div>
  )
}
