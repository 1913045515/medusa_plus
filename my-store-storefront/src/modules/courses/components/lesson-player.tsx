"use client"

import { useState, useRef, useEffect } from "react"
import type { Lesson } from "types/lesson"
import type { Course } from "types/course"
import type { CoursesDictionary } from "@lib/i18n/dictionaries"
import { getLessonPlayUrl } from "@lib/data/lessons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

// ── 工具函数 ──────────────────────────────────────────────────────────────────
function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  return `${m}:${String(s).padStart(2, "0")}`
}

function formatDurationLabel(seconds: number, dict: CoursesDictionary): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m >= 60) {
    const h = Math.floor(m / 60)
    const rm = m % 60
    return `${h}${dict.durationHour}${rm > 0 ? rm + dict.durationMin : ""}`
  }
  return s > 0 ? `${m}${dict.durationMin}${s}${dict.durationMinSec}` : `${m}${dict.durationMin}`
}

// ── 播放图标 ──────────────────────────────────────────────────────────────────
function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  )
}

// ── 视频播放器 ─────────────────────────────────────────────────────────────────
function VideoPlayer({
  lesson,
  videoUrl,
  onEnded,
  onPlaybackError,
}: {
  lesson: Lesson
  videoUrl: string
  onEnded?: () => void
  onPlaybackError?: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const totalDuration = lesson.duration

  // 切集时重置状态
  useEffect(() => {
    setIsPlaying(false)
    setCurrentTime(0)
    setIsLoading(true)
    if (videoRef.current) {
      videoRef.current.load()
    }
  }, [lesson.id])

  const resetControlsTimer = () => {
    setShowControls(true)
    if (controlsTimer.current) clearTimeout(controlsTimer.current)
    controlsTimer.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 3000)
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    setCurrentTime(videoRef.current.currentTime)
    if (videoRef.current.buffered.length > 0) {
      setBuffered(videoRef.current.buffered.end(videoRef.current.buffered.length - 1))
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    const t = Number(e.target.value)
    videoRef.current.currentTime = t
    setCurrentTime(t)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    const v = Number(e.target.value)
    setVolume(v)
    videoRef.current.volume = v
    setIsMuted(v === 0)
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    const muted = !isMuted
    setIsMuted(muted)
    videoRef.current.muted = muted
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0
  const bufferProgress = totalDuration > 0 ? (buffered / totalDuration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black group"
      style={{ aspectRatio: "16/9" }}
      onMouseMove={resetControlsTimer}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* 视频元素 */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        src={videoUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => { setIsPlaying(false); onEnded?.() }}
        onCanPlay={() => setIsLoading(false)}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onError={() => {
          setIsPlaying(false)
          setIsLoading(false)
          onPlaybackError?.()
        }}
        onClick={togglePlay}
        onContextMenu={(event) => event.preventDefault()}
        controlsList="nodownload noplaybackrate noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
        preload="metadata"
        playsInline
      />

      {/* 加载中转圈 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* 中央大播放按钮（暂停时显示） */}
      {!isPlaying && !isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <PlayIcon className="w-8 h-8 text-white ml-1" />
          </div>
        </div>
      )}

      {/* 控制栏 */}
      <div
        className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        <div className="relative px-4 pb-3 pt-8">
          {/* 进度条 */}
          <div className="relative h-1 mb-3 group/progress cursor-pointer">
            {/* 缓冲进度 */}
            <div
              className="absolute inset-y-0 left-0 bg-white/30 rounded-full"
              style={{ width: `${bufferProgress}%` }}
            />
            {/* 播放进度 */}
            <div
              className="absolute inset-y-0 left-0 bg-[#00aaff] rounded-full"
              style={{ width: `${progress}%` }}
            />
            {/* 滑块 */}
            <input
              type="range"
              min={0}
              max={totalDuration}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
              style={{ zIndex: 10 }}
            />
            {/* 拖拽点 */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#00aaff] rounded-full shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>

          {/* 底部控制按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* 播放/暂停 */}
              <button
                onClick={togglePlay}
                className="text-white hover:text-[#00aaff] transition-colors"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <PlayIcon className="w-6 h-6" />
                )}
              </button>

              {/* 音量 */}
              <div className="flex items-center gap-2 group/vol">
                <button onClick={toggleMute} className="text-white hover:text-[#00aaff] transition-colors">
                  {isMuted || volume === 0 ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                    </svg>
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 accent-[#00aaff] cursor-pointer"
                />
              </div>

              {/* 时间 */}
              <span className="text-white/80 text-xs font-mono">
                {formatDuration(Math.floor(currentTime))} / {formatDuration(totalDuration)}
              </span>
            </div>

            {/* 全屏 */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-[#00aaff] transition-colors"
            >
              {isFullscreen ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14H5v5h5v-2H7v3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 选集列表项 ─────────────────────────────────────────────────────────────────
function EpisodeItem({
  lesson,
  isActive,
  isWatched,
  isPurchased,
  dict,
  onClick,
}: {
  lesson: Lesson
  isActive: boolean
  isWatched: boolean
  isPurchased?: boolean
  dict: CoursesDictionary
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 group flex items-start gap-3 ${
        isActive
          ? "bg-[#00aaff]/10 border border-[#00aaff]/30"
          : "hover:bg-grey-10 border border-transparent"
      }`}
    >
      {/* 缩略图 */}
      <div className="flex-shrink-0 relative w-20 rounded overflow-hidden" style={{ aspectRatio: "16/9" }}>
        {lesson.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={lesson.thumbnail_url}
            alt={lesson.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-grey-20 flex items-center justify-center">
            <PlayIcon className="w-4 h-4 text-grey-40" />
          </div>
        )}
        {/* Playing overlay */}
        {isActive && (
          <div className="absolute inset-0 bg-[#00aaff]/20 flex items-center justify-center">
            <div className="flex gap-0.5 items-end h-3">
              <span className="w-0.5 bg-[#00aaff] rounded-full animate-[playing-bar_0.8s_ease-in-out_infinite]" style={{ animationDelay: "0s", height: "40%" }} />
              <span className="w-0.5 bg-[#00aaff] rounded-full animate-[playing-bar_0.8s_ease-in-out_infinite]" style={{ animationDelay: "0.2s", height: "100%" }} />
              <span className="w-0.5 bg-[#00aaff] rounded-full animate-[playing-bar_0.8s_ease-in-out_infinite]" style={{ animationDelay: "0.4s", height: "60%" }} />
            </div>
          </div>
        )}
        {/* Duration label */}
        <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[10px] px-1 rounded">
          {formatDuration(lesson.duration)}
        </span>
      </div>

      {/* Text info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`text-xs font-medium ${isActive ? "text-[#00aaff]" : "text-grey-40"}`}>
            {String(lesson.episode_number).padStart(2, "0")}
          </span>
          {isWatched && !isActive && (
            <CheckIcon className="w-3 h-3 text-green-500 flex-shrink-0" />
          )}
          {!lesson.is_free && !isPurchased && (
            <LockIcon className="w-3 h-3 text-amber-400 flex-shrink-0" />
          )}
        </div>
        <p
          className={`text-xs font-medium leading-tight line-clamp-2 ${
            isActive ? "text-[#00aaff]" : "text-grey-90 group-hover:text-grey-70"
          }`}
        >
          {lesson.title}
        </p>
        <p className="text-[10px] text-grey-40 mt-1">
          {formatDurationLabel(lesson.duration, dict)}
        </p>
      </div>
    </button>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function LessonPlayer({
  course,
  lessons,
  dict,
}: {
  course: Course
  lessons: Lesson[]
  dict: CoursesDictionary
}) {
  const [activeLesson, setActiveLesson] = useState<Lesson>(lessons[0])
  const [activePlayback, setActivePlayback] = useState<{
    videoUrl: string
    expiresAt: string | null
    expiresInSeconds: number | null
  } | null>(null)
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set())
  // Set of course IDs confirmed as purchased (written when play API returns 200)
  const [purchasedCourseIds, setPurchasedCourseIds] = useState<Set<string>>(new Set())
  const [purchasePrompt, setPurchasePrompt] = useState<{
    open: boolean
    lesson?: Lesson
    message?: string
    errorCode?: string
  }>({ open: false })
  const [accessExpired, setAccessExpired] = useState(false)
  const [isRefreshingAccess, setIsRefreshingAccess] = useState(false)
  const [playbackRequestVersion, setPlaybackRequestVersion] = useState(0)

  const listRef = useRef<HTMLDivElement>(null)

  // Pre-check: probe whether the user has purchased this course
  // by testing if the first paid episode returns a video_url
  useEffect(() => {
    const firstPaidLesson = lessons.find((l) => !l.is_free)
    if (firstPaidLesson) {
      getLessonPlayUrl(firstPaidLesson.id).then((r) => {
        if ("video_url" in r) {
          setPurchasedCourseIds((prev) => {
            const next = new Set(Array.from(prev))
            next.add(firstPaidLesson.course_id)
            return next
          })
        }
      }).catch(() => {})
    } else if (lessons.length > 0) {
      // All episodes are free — treat as purchased
      setPurchasedCourseIds((prev) => {
        const next = new Set(Array.from(prev))
        next.add(lessons[0].course_id)
        return next
      })
    }
  }, [lessons])

  // On mount / episode switch: request play url from backend
  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsRefreshingAccess(true)
      setActivePlayback(null)
      setAccessExpired(false)
      setPurchasePrompt({ open: false })

      try {
        const r = await getLessonPlayUrl(activeLesson.id)
        if (cancelled) return

        if ("video_url" in r) {
          setActivePlayback({
            videoUrl: r.video_url,
            expiresAt: r.video_url_expires_at ?? null,
            expiresInSeconds: r.video_url_expires_in_seconds ?? null,
          })
          if (!activeLesson.is_free) {
            setPurchasedCourseIds((prev) => {
              const next = new Set(Array.from(prev))
              next.add(activeLesson.course_id)
              return next
            })
          }
          return
        }

        setPurchasePrompt({
          open: true,
          lesson: activeLesson,
          message: r.error,
          errorCode: r.error_code,
        })
      } finally {
        if (!cancelled) {
          setIsRefreshingAccess(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [activeLesson.id, playbackRequestVersion])

  useEffect(() => {
    if (!activePlayback?.expiresAt) {
      return
    }

    const expiresAtMs = Date.parse(activePlayback.expiresAt)
    if (!Number.isFinite(expiresAtMs)) {
      return
    }

    const remainingMs = expiresAtMs - Date.now()
    if (remainingMs <= 0) {
      setActivePlayback(null)
      setAccessExpired(true)
      return
    }

    const timer = window.setTimeout(() => {
      setActivePlayback(null)
      setAccessExpired(true)
    }, remainingMs)

    return () => window.clearTimeout(timer)
  }, [activePlayback?.expiresAt])

  // Auto-advance to next episode on playback end
  const handleEnded = () => {
    setWatchedIds((prev) => new Set(Array.from(prev).concat(activeLesson.id)))
    const idx = lessons.findIndex((l) => l.id === activeLesson.id)
    if (idx < lessons.length - 1) {
      setActiveLesson(lessons[idx + 1])
    }
  }

  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson)
    setTimeout(() => {
      const el = listRef.current?.querySelector(
        `[data-lesson-id="${lesson.id}"]`
      )
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }, 50)
  }

  const currentIndex = lessons.findIndex((l) => l.id === activeLesson.id)
  const activeVideoUrl = activePlayback?.videoUrl ?? null

  // Purchase page link: use linked product's handle if available, fallback to course handle
  const linkedProductHandle =
    typeof course.metadata?.linked_product_handle === "string" && course.metadata.linked_product_handle
      ? course.metadata.linked_product_handle
      : null
  const purchaseHref = linkedProductHandle ? `/products/${linkedProductHandle}` : `/products/${course.handle}`

  // Map error_code to localized message
  const resolveErrorMessage = (errorCode?: string, fallback?: string): string => {
    const errorCodeMap: Record<string, keyof CoursesDictionary> = {
      login_required: "errorLoginRequired",
      login_expired: "errorLoginExpired",
      purchase_required: "errorPurchaseRequired",
      video_unavailable: "errorVideoUnavailable",
      lesson_not_found: "errorLessonNotFound",
    }
    const dictKey = errorCode ? errorCodeMap[errorCode] : undefined
    if (dictKey) return dict[dictKey] as string
    return fallback || dict.errorCannotPlay
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col large:flex-row gap-4 items-start">
        {/* ── Left: Video ── */}
        <div className="flex-1 min-w-0 w-full">
          <div className="w-full rounded-xl overflow-hidden shadow-2xl bg-black">
            {activeVideoUrl ? (
              <VideoPlayer
                lesson={activeLesson}
                videoUrl={activeVideoUrl}
                onEnded={handleEnded}
                onPlaybackError={() => {
                  setActivePlayback(null)
                  setAccessExpired(true)
                }}
              />
            ) : (
              <div
                className="w-full bg-black flex items-center justify-center text-white/70"
                style={{ aspectRatio: "16/9" }}
              >
                <div className="text-center px-6">
                  <p className="text-sm font-medium">
                    {accessExpired ? dict.accessExpired : dict.cannotPlay}
                  </p>
                  <p className="text-xs text-white/50 mt-2">
                    {accessExpired
                      ? dict.refreshToContinue
                      : purchasePrompt.open
                        ? resolveErrorMessage(purchasePrompt.errorCode, purchasePrompt.message)
                        : isRefreshingAccess
                          ? dict.refreshingAccess
                          : dict.loading}
                  </p>

                  {accessExpired && (
                    <div className="mt-4">
                      <button
                        className="inline-flex items-center justify-center rounded-md bg-[#00aaff] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0095dd] disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => setPlaybackRequestVersion((value) => value + 1)}
                        disabled={isRefreshingAccess}
                      >
                        {isRefreshingAccess ? dict.refreshingAccess : dict.refreshAccess}
                      </button>
                    </div>
                  )}

                  {purchasePrompt.open && !activeLesson.is_free && (
                    <div className="mt-4 flex items-center justify-center gap-3">
                      <LocalizedClientLink
                        href={purchaseHref}
                        className="inline-flex items-center justify-center rounded-md bg-[#00aaff] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0095dd]"
                      >
                        {dict.purchaseCourse}
                      </LocalizedClientLink>
                      <button
                        className="inline-flex items-center justify-center rounded-md border border-white/30 px-4 py-2 text-sm text-white hover:bg-white/10"
                        onClick={() => {
                          setPurchasePrompt({ open: false })
                          setAccessExpired(false)
                        }}
                      >
                        {dict.cancel}
                      </button>
                    </div>
                  )}

                  {purchasePrompt.open && activeLesson.is_free && (
                    <button
                      className="mt-4 inline-flex items-center justify-center rounded-md border border-white/30 px-4 py-2 text-sm text-white hover:bg-white/10"
                      onClick={() => {
                        setPurchasePrompt({ open: false })
                        setAccessExpired(false)
                      }}
                    >
                      {dict.close}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Current episode info */}
          <div className="mt-4 px-1">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-[#00aaff] bg-[#00aaff]/10 px-2 py-0.5 rounded">
                    {dict.episodeLabel.replace("{{n}}", String(activeLesson.episode_number))}
                  </span>
                  {activeLesson.is_free ? (
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                      {dict.free}
                    </span>
                  ) : purchasedCourseIds.has(activeLesson.course_id) ? (
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                      {dict.purchased}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      {dict.paid}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-grey-90 leading-snug">
                  {activeLesson.title}
                </h2>
                {activeLesson.description && (
                  <p className="text-sm text-grey-50 mt-1 leading-relaxed">
                    {activeLesson.description}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-xs text-grey-40">
                  {currentIndex + 1} / {lessons.length}
                </p>
              </div>
            </div>
          </div>

          {/* Course info card */}
          <div className="mt-4 border border-grey-20 rounded-xl p-4 bg-grey-5">
            <div className="flex items-start gap-4">
              {course.thumbnail_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-24 rounded-lg object-cover flex-shrink-0"
                  style={{ aspectRatio: "16/9" }}
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-grey-90">
                  {course.title}
                </h3>
                <p className="text-xs text-grey-50 mt-1 line-clamp-2">
                  {course.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Episodes ── */}
        <div className="w-full large:w-80 flex-shrink-0 border border-grey-20 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-grey-20 bg-grey-5">
            <h3 className="text-sm font-bold text-grey-90">{dict.episodes}</h3>
            <span className="text-xs text-grey-40">
              {currentIndex + 1}/{lessons.length}
            </span>
          </div>

          <div
            ref={listRef}
            className="overflow-y-auto no-scrollbar p-2 space-y-1"
            style={{ maxHeight: "520px" }}
          >
            {lessons.map((lesson) => {
              const isActive = lesson.id === activeLesson.id
              const isWatched = watchedIds.has(lesson.id)
              // Course purchased — hide purchase link
              const isPurchased = purchasedCourseIds.has(lesson.course_id)

              return (
                <div
                  key={lesson.id}
                  data-lesson-id={lesson.id}
                  className={!lesson.is_free && !isPurchased ? "relative" : undefined}
                >
                  <EpisodeItem
                    lesson={lesson}
                    isActive={isActive}
                    isWatched={isWatched}
                    isPurchased={isPurchased}
                    dict={dict}
                    onClick={() => handleSelectLesson(lesson)}
                  />

                  {!lesson.is_free && !isPurchased && (
                    <div className="px-3 pb-2">
                      <LocalizedClientLink
                        href={purchaseHref}
                        className="text-xs text-[#00aaff] hover:underline"
                      >
                        {dict.purchaseToWatch}
                      </LocalizedClientLink>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
