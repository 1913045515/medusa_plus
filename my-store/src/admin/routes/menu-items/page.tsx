import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BarsThree, EllipsisVertical, PencilSquare, Trash, Plus, ArrowPath } from "@medusajs/icons"
import { useEffect, useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import {
  Container,
  Heading,
  Button,
  Badge,
  Text,
  toast,
  usePrompt,
  Input,
  Switch,
  Tabs,
} from "@medusajs/ui"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  UniqueIdentifier,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

export const config = defineRouteConfig({
  label: "menuItems.menuLabel", translationNs: "translation",
  icon: BarsThree,
})

type MenuItem = {
  id: string
  menu_type: string
  title: string
  href: string
  icon: string | null
  parent_id: string | null
  sort_order: number
  is_visible: boolean
  target: string
  children?: MenuItem[]
}

type FlatMenuItem = MenuItem & { depth: number; parentTitle?: string }

const BASE = "/admin"

// Server-side revalidation is handled by the Medusa backend routes after each
// write operation (POST/PUT/DELETE/reorder/reset). No browser-side storefront
// notification is needed here.

// Resolve i18n key (e.g. "blog.menuLabel") to translated label; return raw title otherwise.
function useResolveLabel(title: string): string {
  const { t } = useTranslation()
  if (/^[a-zA-Z][a-zA-Z0-9]*\.[a-zA-Z][a-zA-Z0-9.]+$/.test(title)) {
    const resolved = t(title)
    return resolved !== title ? resolved : title
  }
  return title
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).message ?? `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

// Build flat list with depth info for drag-and-drop
function buildFlatList(items: MenuItem[]): FlatMenuItem[] {
  const result: FlatMenuItem[] = []
  const roots = items.filter((i) => !i.parent_id).sort((a, b) => a.sort_order - b.sort_order)
  for (const root of roots) {
    result.push({ ...root, depth: 0, children: undefined })
    const children = items.filter((i) => i.parent_id === root.id).sort((a, b) => a.sort_order - b.sort_order)
    for (const child of children) {
      result.push({ ...child, depth: 1, parentTitle: root.title, children: undefined })
    }
  }
  return result
}

// Convert flat list back to proper sort_order and parent_id
function extractReorderPayload(flat: FlatMenuItem[]): Array<{ id: string; parent_id: string | null; sort_order: number }> {
  // Recalculate sort_order per parent group
  const groups: Record<string, number> = {}
  return flat.map((item) => {
    const key = item.parent_id ?? "__root__"
    groups[key] = (groups[key] ?? -1) + 1
    return { id: item.id, parent_id: item.parent_id, sort_order: groups[key] }
  })
}

// SortableRow component
function SortableRow({
  item,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  dragOverId,
  activeId,
}: {
  item: FlatMenuItem
  onEdit: (item: FlatMenuItem) => void
  onDelete: (item: FlatMenuItem) => void
  onMoveUp: (item: FlatMenuItem) => void
  onMoveDown: (item: FlatMenuItem) => void
  canMoveUp: boolean
  canMoveDown: boolean
  dragOverId: UniqueIdentifier | null
  activeId: UniqueIdentifier | null
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const resolvedTitle = useResolveLabel(item.title)
  const isI18nKey = resolvedTitle !== item.title
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const isDropTarget = dragOverId === item.id && activeId !== item.id && item.depth === 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-3 py-2.5 border-b border-ui-border-base last:border-0 group transition-colors ${
        isDropTarget ? "bg-blue-50 border-l-2 border-l-blue-400" : "hover:bg-ui-bg-subtle"
      }`}
    >
      {/* Indentation for children */}
      {item.depth === 1 && <div className="w-6 shrink-0" />}

      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-ui-bg-base text-ui-fg-muted shrink-0 touch-none"
        aria-label="Drag to reorder"
        style={{ touchAction: "none" }}
      >
        <EllipsisVertical className="w-3.5 h-3.5" />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ui-fg-base truncate">{resolvedTitle}</span>
          {isI18nKey && (
            <span className="text-xs text-ui-fg-muted font-mono bg-ui-bg-subtle px-1 rounded shrink-0">{item.title}</span>
          )}
          {item.depth === 1 && (
            <Badge size="xsmall" color="grey">Sub-item</Badge>
          )}
          {!item.is_visible && (
            <Badge size="xsmall" color="orange">Hidden</Badge>
          )}
        </div>
        <div className="text-xs text-ui-fg-muted truncate mt-0.5">{item.href}</div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onMoveUp(item)}
          disabled={!canMoveUp}
          className="p-1 rounded hover:bg-ui-bg-base text-ui-fg-muted disabled:opacity-30 disabled:cursor-not-allowed"
          title="上移"
        >
          ↑
        </button>
        <button
          onClick={() => onMoveDown(item)}
          disabled={!canMoveDown}
          className="p-1 rounded hover:bg-ui-bg-base text-ui-fg-muted disabled:opacity-30 disabled:cursor-not-allowed"
          title="下移"
        >
          ↓
        </button>
        <button
          onClick={() => onEdit(item)}
          className="p-1.5 rounded hover:bg-ui-bg-base text-ui-fg-muted"
          title="编辑"
        >
          <PencilSquare className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(item)}
          className="p-1.5 rounded hover:bg-ui-bg-base text-red-500"
          title="删除"
        >
          <Trash className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Edit modal
function EditModal({
  item,
  allItems,
  menuType,
  onClose,
  onSave,
}: {
  item: FlatMenuItem | null
  allItems: FlatMenuItem[]
  menuType: string
  onClose: () => void
  onSave: () => void
}) {
  const isNew = !item
  const [title, setTitle] = useState(item?.title ?? "")
  const [href, setHref] = useState(item?.href ?? "")
  const [parentId, setParentId] = useState(item?.parent_id ?? "")
  const [isVisible, setIsVisible] = useState(item?.is_visible !== false)
  const [target, setTarget] = useState(item?.target ?? "_self")
  const [saving, setSaving] = useState(false)

  const roots = allItems.filter((i) => i.depth === 0 && i.id !== item?.id)

  const handleSave = async () => {
    if (!title.trim() || !href.trim()) {
      toast.error("标题和链接不能为空")
      return
    }
    setSaving(true)
    try {
      const body = {
        title: title.trim(),
        href: href.trim(),
        parent_id: parentId || null,
        is_visible: isVisible,
        target,
        menu_type: menuType,
      }
      if (isNew) {
        await apiFetch("/menu-items", { method: "POST", body: JSON.stringify(body) })
        toast.success("Menu item created")
      } else {
        await apiFetch(`/menu-items/${item!.id}`, { method: "PUT", body: JSON.stringify(body) })
        toast.success("Menu item updated")
      }
      onSave()
    } catch (err: any) {
      toast.error("Save failed", { description: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <Heading level="h2" className="mb-4">{isNew ? "Add Menu Item" : "Edit Menu Item"}</Heading>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ui-fg-base mb-1">Title *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Home — or i18n key like blog.menuLabel" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ui-fg-base mb-1">URL *</label>
            <Input value={href} onChange={(e) => setHref(e.target.value)} placeholder="e.g. / or /store" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ui-fg-base mb-1">Parent item (optional — sets this as a sub-item)</label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full border border-ui-border-base rounded-md px-3 py-2 text-sm"
            >
              <option value="">None (top-level)</option>
              {roots.map((r) => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-ui-fg-base">Visible</label>
            <Switch checked={isVisible} onCheckedChange={setIsVisible} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ui-fg-base mb-1">Open in</label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full border border-ui-border-base rounded-md px-3 py-2 text-sm"
            >
              <option value="_self">Same window</option>
              <option value="_blank">New tab</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} isLoading={saving}>Save</Button>
        </div>
      </div>
    </div>
  )
}

// Main menu list component
function MenuList({ menuType }: { menuType: string }) {
  const [items, setItems] = useState<FlatMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [dragOverId, setDragOverId] = useState<UniqueIdentifier | null>(null)
  const [editItem, setEditItem] = useState<FlatMenuItem | null | undefined>(undefined)
  const prompt = usePrompt()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch<{ menu_items: MenuItem[] }>(`/menu-items?type=${menuType}`)
      setItems(buildFlatList(data.menu_items))
    } catch (err: any) {
      toast.error("加载失败", { description: err.message })
    } finally {
      setLoading(false)
    }
  }, [menuType])

  useEffect(() => { loadItems() }, [loadItems])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id)
  }

  const handleDragOver = (event: DragOverEvent) => {
    setDragOverId(event.over?.id ?? null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setDragOverId(null)

    if (!over || active.id === over.id) return

    const activeIdx = items.findIndex((i) => i.id === active.id)
    const overIdx = items.findIndex((i) => i.id === over.id)
    if (activeIdx === -1 || overIdx === -1) return

    const activeItem = items[activeIdx]
    const overItem = items[overIdx]

    let newItems = [...items]

    // Cross-level: dragging a root item over a root item (depth=0) → make it a child
    // Only if the over item is a root and the pointer "holds" over it briefly
    // For simplicity: if active is depth=0 and over is depth=0 but different item,
    // allow user to explicitly make it a child via the edit modal.
    // For same-type reorder, use arrayMove.

    // Determine new parent: if over item is depth=1, keep same parent
    let newParentId = activeItem.parent_id

    if (activeItem.depth === 0 && overItem.depth === 1) {
      // Dragging root into a child-level zone → make it child of over's parent
      newParentId = overItem.parent_id
    } else if (activeItem.depth === 1 && overItem.depth === 0) {
      // Dragging a child to root level → make it root
      newParentId = null
    }

    // Update parent_id in the item
    newItems[activeIdx] = { ...activeItem, parent_id: newParentId, depth: newParentId ? 1 : 0 }

    // Reorder: move in array
    newItems = arrayMove(newItems, activeIdx, overIdx)

    setItems(newItems)

    // Save to backend
    try {
      const payload = extractReorderPayload(newItems)
      await apiFetch("/menu-items/reorder", {
        method: "POST",
        body: JSON.stringify({ items: payload }),
      })
      toast.success("Order saved")
      loadItems() // reload to confirm server state
    } catch (err: any) {
      toast.error("Failed to save order", { description: err.message })
      loadItems() // reload on failure
    }
  }

  const handleDelete = async (item: FlatMenuItem) => {
    const hasChildren = items.some((i) => i.parent_id === item.id)
    const hint = hasChildren
      ? `"${item.title}" has sub-items. Deleting it will also remove all sub-items.`
      : `Delete menu item "${item.title}"?`
    const confirmed = await prompt({
      title: "Confirm deletion",
      description: hint,
      confirmText: "Delete",
      cancelText: "Cancel",
    })
    if (!confirmed) return
    try {
      await apiFetch(`/menu-items/${item.id}`, { method: "DELETE" })
      toast.success("Deleted")
      loadItems()
    } catch (err: any) {
      toast.error("Delete failed", { description: err.message })
    }
  }

  const handleMoveUp = async (item: FlatMenuItem) => {
    const idx = items.findIndex((i) => i.id === item.id)
    if (idx <= 0) return
    // Find the previous sibling (same parent)
    let prevIdx = idx - 1
    while (prevIdx >= 0 && items[prevIdx].parent_id !== item.parent_id) prevIdx--
    if (prevIdx < 0) return
    const newItems = [...items]
    ;[newItems[prevIdx], newItems[idx]] = [newItems[idx], newItems[prevIdx]]
    setItems(newItems)
    try {
      const payload = extractReorderPayload(newItems)
      await apiFetch("/menu-items/reorder", { method: "POST", body: JSON.stringify({ items: payload }) })
      loadItems()
    } catch (err: any) {
      toast.error("Failed to save order", { description: err.message })
      loadItems()
    }
  }

  const handleMoveDown = async (item: FlatMenuItem) => {
    const idx = items.findIndex((i) => i.id === item.id)
    if (idx < 0 || idx >= items.length - 1) return
    // Find the next sibling (same parent)
    let nextIdx = idx + 1
    while (nextIdx < items.length && items[nextIdx].parent_id !== item.parent_id) nextIdx++
    if (nextIdx >= items.length) return
    const newItems = [...items]
    ;[newItems[idx], newItems[nextIdx]] = [newItems[nextIdx], newItems[idx]]
    setItems(newItems)
    try {
      const payload = extractReorderPayload(newItems)
      await apiFetch("/menu-items/reorder", { method: "POST", body: JSON.stringify({ items: payload }) })
      loadItems()
    } catch (err: any) {
      toast.error("Failed to save order", { description: err.message })
      loadItems()
    }
  }

  const activeItem = items.find((i) => i.id === activeId)

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-2">
        <Button
          size="small"
          variant="secondary"
          onClick={async () => {
            const confirmed = window.confirm(
              "This will delete ALL existing menu items and re-seed defaults. Continue?"
            )
            if (!confirmed) return
            try {
              await apiFetch("/menu-items/reset", { method: "POST" })
              toast.success("Menu reset to defaults")
              loadItems()
            } catch (err: any) {
              toast.error("Reset failed", { description: err.message })
            }
          }}
          className="flex items-center gap-1 text-red-500"
        >
          <ArrowPath className="w-4 h-4" />
          Reset to Defaults
        </Button>
        <Button
          size="small"
          onClick={() => setEditItem(null)}
          className="flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-ui-fg-muted text-sm">加载中...</div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-ui-fg-muted text-sm">暂无菜单项</div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="border border-ui-border-base rounded-lg overflow-hidden">
              {items.map((item) => {
                // Find siblings with same parent to determine canMoveUp/canMoveDown
                const siblings = items.filter((i) => i.parent_id === item.parent_id)
                const sibIdx = siblings.findIndex((s) => s.id === item.id)
                return (
                  <SortableRow
                    key={item.id}
                    item={item}
                    onEdit={(i) => setEditItem(i)}
                    onDelete={handleDelete}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    canMoveUp={sibIdx > 0}
                    canMoveDown={sibIdx < siblings.length - 1}
                    dragOverId={dragOverId}
                    activeId={activeId}
                  />
                )
              })}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeItem && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-white border border-ui-border-base rounded-lg shadow-lg opacity-90">
                <EllipsisVertical className="w-3.5 h-3.5 text-ui-fg-muted" />
                <span className="text-sm font-medium">{activeItem.title}</span>
                <span className="text-xs text-ui-fg-muted ml-1">{activeItem.href}</span>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      <div className="mt-3 text-xs text-ui-fg-muted">
        Tip: Drag the ≡ handle to reorder; dragging a top-level item into the sub-item zone makes it a sub-item. Use Edit to change parent.
      </div>

      {/* Admin menu preview — shows how the saved items will look as navigation links */}
      {menuType === "admin" && !loading && items.length > 0 && (
        <div className="mt-6 border border-ui-border-base rounded-lg p-4 bg-ui-bg-subtle">
          <p className="text-xs font-semibold text-ui-fg-muted uppercase tracking-wider mb-3">
            Navigation Preview — Admin Quick Links
          </p>
          <p className="text-xs text-ui-fg-muted mb-3">
            Admin menu items are stored in the database and can be consumed by any custom admin component. Below is a live preview of the current items as clickable navigation links.
          </p>
          <nav className="flex flex-wrap gap-2">
            {items
              .filter((i) => i.is_visible && i.depth === 0)
              .map((item) => {
                const children = items.filter((c) => c.parent_id === item.id && c.is_visible)
                return (
                  <div key={item.id} className="flex flex-col gap-1">
                    <a
                      href={item.href}
                      target={item.target}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md bg-white border border-ui-border-base text-ui-fg-base hover:bg-ui-bg-base transition-colors"
                    >
                      {item.title}
                    </a>
                    {children.length > 0 && (
                      <div className="flex flex-col gap-0.5 pl-3 border-l border-ui-border-base ml-2">
                        {children.map((c) => (
                          <a
                            key={c.id}
                            href={c.href}
                            target={c.target}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded text-ui-fg-subtle hover:text-ui-fg-base hover:bg-ui-bg-base transition-colors"
                          >
                            {c.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
          </nav>
        </div>
      )}

      {editItem !== undefined && (
        <EditModal
          item={editItem}
          allItems={items}
          menuType={menuType}
          onClose={() => setEditItem(undefined)}
          onSave={() => { setEditItem(undefined); loadItems() }}
        />
      )}
    </div>
  )
}

export default function MenuItemsPage() {
  const [tab, setTab] = useState("front")

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Heading level="h1">Menu Management</Heading>
          <Text className="text-ui-fg-subtle mt-1">Manage front-end and admin navigation. Drag to reorder — changes save automatically and the storefront updates immediately.</Text>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <Tabs.List>
          <Tabs.Trigger value="front">Front Menu</Tabs.Trigger>
          <Tabs.Trigger value="admin">Admin Menu</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="front" className="mt-4">
          <MenuList key="front" menuType="front" />
        </Tabs.Content>
        <Tabs.Content value="admin" className="mt-4">
          <MenuList key="admin" menuType="admin" />
        </Tabs.Content>
      </Tabs>
    </Container>
  )
}
