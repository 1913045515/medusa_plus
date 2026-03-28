export type Lesson = {
  id: string
  course_id: string
  title: string
  description: string | null
  episode_number: number
  duration: number
  is_free: boolean
  thumbnail_url: string | null
  video_url: string | null
  status: string
  created_at: string
  updated_at: string
  metadata: Record<string, unknown>
}

export type LessonWithUrl = Lesson & { video_url: string }
