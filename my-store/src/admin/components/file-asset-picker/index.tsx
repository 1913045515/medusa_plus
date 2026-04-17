"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Button,
  Drawer,
  Heading,
  Input,
  Table,
  Text,
} from "@medusajs/ui"

type FileAsset = {
  id: string
  name: string
  original_filename: string
  mime_type: string
  size_bytes: number
  description: string | null
  created_at: string
}

type FileAssetPickerProps = {
  open: boolean
  onClose: () => void
  onSelect: (asset: FileAsset) => void
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}

const PAGE_SIZE = 15

const FileAssetPicker = ({ open, onClose, onSelect }: FileAssetPickerProps) => {
  const { t } = useTranslation()
  const [files, setFiles] = useState<FileAsset[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<FileAsset | null>(null)

  const load = useCallback(async (q: string, offset: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(offset),
      })
      if (q) params.set("q", q)
      const res = await fetch(`/admin/file-assets?${params}`, {
        credentials: "include",
      })
      if (!res.ok) return
      const json = await res.json()
      setFiles(json.file_assets ?? [])
      setTotal(json.count ?? 0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      void load(search, page * PAGE_SIZE)
    }
  }, [open, search, page, load])

  // Reset on re-open
  useEffect(() => {
    if (open) {
      setSearch("")
      setPage(0)
      setSelected(null)
    }
  }, [open])

  const handleConfirm = () => {
    if (!selected) return
    onSelect(selected)
    onClose()
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <Drawer open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <Drawer.Content className="max-w-2xl">
        <Drawer.Header>
          <Heading>{t("fileAssets.picker.title")}</Heading>
        </Drawer.Header>

        <Drawer.Body className="overflow-auto">
          {/* Search */}
          <div className="mb-4">
            <Input
              placeholder={t("fileAssets.picker.searchPlaceholder")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
              }}
            />
          </div>

          {/* Table */}
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell className="w-8"></Table.HeaderCell>
                <Table.HeaderCell>{t("fileAssets.columns.name")}</Table.HeaderCell>
                <Table.HeaderCell>{t("fileAssets.columns.mimeType")}</Table.HeaderCell>
                <Table.HeaderCell>{t("fileAssets.columns.size")}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {loading ? (
                <Table.Row>
                  <td colSpan={4} className="py-8 text-center">
                    <Text className="text-ui-fg-muted">{t("common.loading")}</Text>
                  </td>
                </Table.Row>
              ) : files.length === 0 ? (
                <Table.Row>
                  <td colSpan={4} className="py-8 text-center">
                    <Text className="text-ui-fg-muted">{t("fileAssets.picker.empty")}</Text>
                  </td>
                </Table.Row>
              ) : (
                files.map((asset) => (
                  <Table.Row
                    key={asset.id}
                    className={`cursor-pointer ${selected?.id === asset.id ? "bg-ui-bg-highlight" : "hover:bg-ui-bg-subtle"}`}
                    onClick={() => setSelected(asset)}
                  >
                    <Table.Cell>
                      <input
                        type="radio"
                        readOnly
                        checked={selected?.id === asset.id}
                        className="accent-ui-fg-interactive"
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex flex-col gap-0.5">
                        <Text size="small" weight="plus">{asset.name}</Text>
                        <Text size="xsmall" className="text-ui-fg-subtle font-mono">{asset.original_filename}</Text>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small" className="text-ui-fg-muted">{asset.mime_type}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small">{formatBytes(asset.size_bytes)}</Text>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <Button
                size="small"
                variant="secondary"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                上一页
              </Button>
              <Text size="small" className="text-ui-fg-muted">
                {page + 1} / {totalPages}
              </Text>
              <Button
                size="small"
                variant="secondary"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                下一页
              </Button>
            </div>
          )}
        </Drawer.Body>

        <Drawer.Footer>
          <div className="flex items-center justify-between w-full">
            <Text size="small" className="text-ui-fg-muted">
              {selected
                ? t("fileAssets.picker.selected", { name: selected.name })
                : ""}
            </Text>
            <div className="flex gap-2">
              <Button variant="secondary" size="small" onClick={onClose}>
                {t("fileAssets.picker.cancel")}
              </Button>
              <Button
                variant="primary"
                size="small"
                disabled={!selected}
                onClick={handleConfirm}
              >
                {t("fileAssets.picker.select")}
              </Button>
            </div>
          </div>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

export default FileAssetPicker
export type { FileAsset }
