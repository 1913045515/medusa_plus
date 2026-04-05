"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Thumbs, FreeMode } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper"
import { useState } from "react"
import Image from "next/image"
import Zoom from "react-medium-image-zoom"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/thumbs"
import "swiper/css/free-mode"
import "react-medium-image-zoom/dist/styles.css"

type ImageItem = {
  id: string
  url: string
  is_main?: boolean
}

type ImageCarouselProps = {
  images: ImageItem[]
  dict: {
    previousImage: string
    nextImage: string
  }
}

export default function ImageCarousel({ images, dict }: ImageCarouselProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null)

  // Sort: main image first
  const sorted = [...images].sort((a, b) => {
    if (a.is_main && !b.is_main) return -1
    if (!a.is_main && b.is_main) return 1
    return 0
  })

  if (sorted.length === 0) {
    return (
      <div className="w-full aspect-square bg-ui-bg-subtle rounded-lg flex items-center justify-center text-ui-fg-muted">
        No images
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Main Carousel */}
      <Swiper
        modules={[Navigation, Thumbs]}
        navigation={{
          nextEl: ".swiper-button-next-custom",
          prevEl: ".swiper-button-prev-custom",
        }}
        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
        className="w-full rounded-lg overflow-hidden bg-ui-bg-subtle"
        spaceBetween={0}
        slidesPerView={1}
      >
        {sorted.map((img, idx) => (
          <SwiperSlide key={img.id}>
            <Zoom>
              <div className="relative w-full aspect-square">
                <Image
                  src={img.url}
                  alt={`Product image ${idx + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                  className="object-cover"
                  priority={idx === 0}
                />
              </div>
            </Zoom>
          </SwiperSlide>
        ))}

        {/* Navigation arrows */}
        <button
          className="swiper-button-prev-custom absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
          aria-label={dict.previousImage}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          className="swiper-button-next-custom absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
          aria-label={dict.nextImage}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </Swiper>

      {/* Thumbnail strip */}
      {sorted.length > 1 && (
        <Swiper
          modules={[FreeMode, Thumbs]}
          onSwiper={setThumbsSwiper}
          spaceBetween={8}
          slidesPerView={Math.min(sorted.length, 5)}
          freeMode
          watchSlidesProgress
          className="w-full"
        >
          {sorted.map((img, idx) => (
            <SwiperSlide key={img.id} className="!w-16 !h-16 cursor-pointer">
              <div className="relative w-16 h-16 rounded overflow-hidden border-2 border-transparent [.swiper-slide-thumb-active_&]:border-ui-fg-interactive">
                <Image
                  src={img.url}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  sizes="64px"
                  unoptimized
                  className="object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  )
}
