import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd"
import { Badge, clx } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { useCallback } from "react"

type ImageItem = {
  image_id: string
  url: string
  is_main: boolean
  sort_order: number
}

type ProductImagesManagerProps = {
  images: ImageItem[]
  onChange: (images: ImageItem[]) => void
}

export default function ProductImagesManager({
  images,
  onChange,
}: ProductImagesManagerProps) {
  const { t } = useTranslation()

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return
      const items = Array.from(images)
      const [moved] = items.splice(result.source.index, 1)
      items.splice(result.destination.index, 0, moved)
      onChange(items.map((img, idx) => ({ ...img, sort_order: idx })))
    },
    [images, onChange]
  )

  const setMain = useCallback(
    (imageId: string) => {
      onChange(
        images.map((img) => ({
          ...img,
          is_main: img.image_id === imageId,
        }))
      )
    },
    [images, onChange]
  )

  if (images.length === 0) {
    return (
      <p className="text-ui-fg-muted text-sm py-4">
        {t("productImages.empty", "No images available")}
      </p>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="product-images" direction="horizontal">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex flex-wrap gap-3"
          >
            {images.map((img, index) => (
              <Draggable
                key={img.image_id}
                draggableId={img.image_id}
                index={index}
              >
                {(dragProvided, snapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    className={clx(
                      "relative w-28 h-28 rounded-lg border overflow-hidden group cursor-grab",
                      snapshot.isDragging
                        ? "border-ui-border-interactive shadow-lg"
                        : "border-ui-border-base",
                      img.is_main && "ring-2 ring-ui-fg-interactive"
                    )}
                  >
                    <img
                      src={img.url}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {img.is_main && (
                      <Badge
                        color="green"
                        className="absolute top-1 left-1 text-[10px]"
                      >
                        {t("productImages.mainBadge", "Main")}
                      </Badge>
                    )}
                    {!img.is_main && (
                      <button
                        type="button"
                        onClick={() => setMain(img.image_id)}
                        className="absolute inset-0 bg-black/40 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {t("productImages.setAsMain", "Set as Main")}
                      </button>
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
