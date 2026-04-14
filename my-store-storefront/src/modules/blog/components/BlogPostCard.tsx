import Link from "next/link"
import Image from "next/image"
import type { BlogPost } from "@lib/data/blog"
import type { BlogDictionary } from "@lib/i18n/dictionaries"

/** Replace {{n}} placeholder in a template string */
function fmt(template: string, n: number): string {
  return template.replace("{{n}}", String(n))
}

type Props = {
  post: BlogPost
  pinned?: boolean
  dict?: BlogDictionary
}

function readTimeMinutes(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 300))
}

export default function BlogPostCard({ post, pinned, dict }: Props) {
  const readTime = readTimeMinutes(post.word_count)
  const coverSrc = post.cover_image_signed_url || post.cover_image

  return (
    <article
      className={`group flex flex-col rounded-lg border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow bg-white ${
        pinned ? "ring-2 ring-blue-500" : ""
      }`}
    >
      {coverSrc && (
        <Link href={`/blog/${post.slug}`} className="block overflow-hidden">
          <div className="relative h-48 w-full">
            <Image
              src={coverSrc}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </Link>
      )}

      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Meta */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 flex-wrap">
          {pinned && (
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{dict?.pinned ?? "Pinned"}</span>
          )}
          <span>{dict ? fmt(dict.minuteRead, readTime) : `${readTime} min read`}</span>
          {post.published_at && (
            <span>{new Date(post.published_at).toLocaleDateString()}</span>
          )}
        </div>

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-base font-semibold text-neutral-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm text-neutral-600 line-clamp-3 flex-1">{post.excerpt}</p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-2">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/blog/tag/${tag.slug}`}
                className="text-xs bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded-full text-neutral-600 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-neutral-100">
          <span>{dict ? fmt(dict.reads, post.read_count) : `${post.read_count} views`}</span>
          <Link href={`/blog/${post.slug}`} className="text-blue-500 hover:underline font-medium">
            {dict?.readMore ?? "Read more →"}
          </Link>
        </div>
      </div>
    </article>
  )
}
