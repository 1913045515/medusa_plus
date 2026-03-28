import type { Course } from "types/course"
import type { Lesson } from "types/lesson"
import coursesData from "./courses-data.json"

export function getStaticCourses(): Course[] {
  return coursesData.courses as unknown as Course[]
}

export function getStaticCourseByHandle(handle: string): Course | null {
  return (coursesData.courses as unknown as Course[]).find((c) => c.handle === handle) ?? null
}

export function getStaticLessonsByCourseId(courseId: string): Lesson[] {
  const map = coursesData.lessons as unknown as Record<string, Lesson[]>
  return (map[courseId] ?? []).sort((a, b) => a.episode_number - b.episode_number)
}
