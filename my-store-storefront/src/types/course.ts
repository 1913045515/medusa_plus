export type Course = {
  id: string
  handle: string
  title: string
  description: string
  locale?: string | null
  thumbnail_url: string | null
  thumbnail_url_expires_at?: string | null
  level?: string
  lessons_count?: number
  status?: string
  created_at?: string
  updated_at?: string
  metadata?: Record<string, unknown>
}
