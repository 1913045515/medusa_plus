export type Lesson = {
  id: string
  course_id: string
  title: string
  description: string | null
  episode_number: number
  duration: number
  is_free: boolean
  thumbnail_url: string | null
  thumbnail_url_expires_at?: string | null
  video_url: string | null
  status: string
  created_at: string
  updated_at: string
  metadata: Record<string, unknown>
}

export type LessonPlaySuccess = {
  video_url: string
  video_url_expires_at?: string | null
  video_url_expires_in_seconds?: number | null
}

export type LessonPlayError = {
  error: string
  code: 401 | 403
  error_code?: string
}

export type LessonPlayResponse = LessonPlaySuccess | LessonPlayError

export type LessonWithUrl = Lesson & LessonPlaySuccess
