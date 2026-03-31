import type { IProductDetailRepository } from "../repositories/product-detail.repository"
import type { ProductDetailRecord, UpdateProductDetailInput } from "../types"
import sanitizeHtml from "sanitize-html"

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
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
  allowedAttributes: {
    a: ["href", "target", "rel", "title"],
    img: ["src", "alt", "width", "height", "class", "style"],
    td: ["colspan", "rowspan", "style"],
    th: ["colspan", "rowspan", "style"],
    span: ["style", "class"],
    div: ["style", "class"],
    p: ["style", "class"],
    h1: ["style", "class"],
    h2: ["style", "class"],
    h3: ["style", "class"],
    h4: ["style", "class"],
    h5: ["style", "class"],
    h6: ["style", "class"],
    table: ["class", "style"],
    figure: ["class"],
    pre: ["class"],
    code: ["class"],
  },
  allowedStyles: {
    "*": {
      "text-align": [/^(left|right|center|justify)$/],
      "color": [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(/],
      "background-color": [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(/],
      "width": [/^\d+(%|px|em|rem)$/],
      "max-width": [/^\d+(%|px|em|rem)$/],
    },
  },
  allowedSchemes: ["http", "https", "mailto"],
}

export class ProductDetailService {
  constructor(private readonly repo: IProductDetailRepository) {}

  async getByProductId(productId: string): Promise<ProductDetailRecord | null> {
    return this.repo.findByProductId(productId)
  }

  async upsert(productId: string, input: UpdateProductDetailInput): Promise<ProductDetailRecord> {
    const sanitized: UpdateProductDetailInput = {
      long_desc_html: input.long_desc_html ? sanitizeHtml(input.long_desc_html, SANITIZE_OPTIONS) : null,
    }
    return this.repo.upsert(productId, sanitized)
  }

  async delete(productId: string): Promise<boolean> {
    return this.repo.delete(productId)
  }
}
