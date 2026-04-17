"use client"

import { defineRouteConfig } from "@medusajs/admin-sdk"
import { FolderOpen } from "@medusajs/icons"
import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Button,
  Badge,
  Container,
  Heading,
  Input,
  Table,
  Text,
  toast,
  usePrompt,
} from "@medusajs/ui"

export const config = defineRouteConfig({
  label: "fileAssets.menuLabel",
  translationNs: "translation",
  icon: FolderOpen,
})

type FileAsset = {
  id: string
  name: string
  original_filename: string
  mime_type: string
  size_bytes: number
  description: string | null
  created_at: string
}

type EditState = {
  id: string
  name: string
  description: string
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}

const PAGE_SIZE = 20

const FileAssetsPage = () => {
  const { t } = useTranslation()
  const prompt = usePrompt()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [files, setFiles] = useState<FileAsset[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editState, setEditState] = useState<EditState | null>(null)
  const [saving, setSaving] = useState(false)

  const loadFiles = useCallback(async (q: string, offset: number) => {
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
      if (!res.ok) throw new Error(t("fileAssets.loadFailed"))
      const json = await res.json()
      setFiles(json.file_assets ?? [])
      setTotal(json.count ?? 0)
    } catch (err: any) {
      toast.error(err?.message ?? t("fileAssets.loadFailed"))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void loadFiles(search, page * PAGE_SIZE)
  }, [search, page, loadFiles])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(0)
  }

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (e.target) e.target.value = ""

    const MAX = 500 * 1024 * 1024
    if (file.size > MAX) {
      toast.error(t("fileAssets.upload.fileTooLarge"))
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch(`/admin/file-assets`, {
        method: "POST",
        credentials: "include",
        body: formData,
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.message ?? t("fileAssets.upload.failed"))
      toast.success(t("fileAssets.upload.success"))
      void loadFiles(search, page * PAGE_SIZE)
    } catch (err: any) {
      toast.error(err?.message ?? t("fileAssets.upload.failed"))
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (asset: FileAsset) => {
    const confirmed = await prompt({
      title: t("fileAssets.delete.title"),
      description: t("fileAssets.delete.confirm", { name: asset.name }),
      confirmText: t("common.delete"),
      cancelText: t("common.cancel"),
    })
    if (!confirmed) return

    try {
      const res = await fetch(`/admin/file-assets/${asset.id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const json = await res.json().catch(() => ({}))
      if (res.status === 409) {
        toast.error(t("fileAssets.delete.referenced", { count: json.referenced_count ?? 1 }))
        return
      }
      if (!res.ok) throw new Error(json?.message ?? t("fileAssets.delete.failed"))
      toast.success(t("fileAssets.delete.success"))
      void loadFiles(search, page * PAGE_SIZE)
    } catch (err: any) {
      toast.error(err?.message ?? t("fileAssets.delete.failed"))
    }
  }

  const startEdit = (asset: FileAsset) => {
    setEditState({
      id: asset.id,
      name: asset.name,
      description: asset.description ?? "",
    })
  }

  const handleSaveEdit = async () => {
    if (!editState) return
    setSaving(true)
    try {
      const res = await fetch(`/admin/file-assets/${editState.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editState.name,
          description: editState.description || null,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.message ?? t("fileAssets.edit.failed"))
      toast.success(t("fileAssets.edit.success"))
      setEditState(null)
      void loadFiles(search, page * PAGE_SIZE)
    } catch (err: any) {
      toast.error(err?.message ?? t("fileAssets.edit.failed"))
    } finally {
      setSaving(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <Container className="p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-base">
        <div>
          <Heading level="h1">{t("fileAssets.title")}</Heading>
          <Text size="small" className="text-ui-fg-muted mt-1">
            {t("fileAssets.description")}
          </Text>
        </div>
        <Button
          variant="primary"
          size="small"
          isLoading={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {t("fileAssets.uploadBtn")}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelected}
        />
      </div>

      {/* Edit panel */}
      {editState && (
        <div className="px-6 py-4 border-b border-ui-border-base bg-ui-bg-subtle">
          <Heading level="h3" className="mb-3">
            {t("fileAssets.edit.title")}
          </Heading>
          <div className="flex flex-col gap-3 max-w-lg">
            <div className="flex flex-col gap-1">
              <Text size="small" weight="plus">{t("fileAssets.edit.nameLabel")}</Text>
              <Input
                value={editState.name}
                onChange={(e) => setEditState((s) => s ? { ...s, name: e.target.value } : s)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Text size="small" weight="plus">{t("fileAssets.edit.descriptionLabel")}</Text>
              <Input
                value={editState.description}
                onChange={(e) => setEditState((s) => s ? { ...s, description: e.target.value } : s)}
              />
            </div>
            <div className="flex gap-2">
              <Button size="small" variant="primary" isLoading={saving} onClick={handleSaveEdit}>
                {t("fileAssets.edit.save")}
              </Button>
              <Button size="small" variant="secondary" onClick={() => setEditState(null)}>
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="px-6 py-3 border-b border-ui-border-base">
        <Input
          placeholder={t("fileAssets.searchPlaceholder")}
          value={search}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{t("fileAssets.columns.name")}</Table.HeaderCell>
            <Table.HeaderCell>{t("fileAssets.columns.mimeType")}</Table.HeaderCell>
            <Table.HeaderCell>{t("fileAssets.columns.size")}</Table.HeaderCell>
            <Table.HeaderCell>{t("fileAssets.columns.uploadedAt")}</Table.HeaderCell>
            <Table.HeaderCell>{t("fileAssets.columns.actions")}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading ? (
            <Table.Row>
              <td colSpan={5} className="py-8 text-center">
                <Text className="text-ui-fg-muted">{t("common.loading")}</Text>
              </td>
            </Table.Row>
          ) : files.length === 0 ? (
            <Table.Row>
              <td colSpan={5} className="py-8 text-center">
                <Text className="text-ui-fg-muted">{t("fileAssets.empty")}</Text>
              </td>
            </Table.Row>
          ) : (
            files.map((asset) => (
              <Table.Row key={asset.id}>
                <Table.Cell>
                  <div className="flex flex-col gap-0.5">
                    <Text weight="plus" size="small">{asset.name}</Text>
                    {asset.description && (
                      <Text size="xsmall" className="text-ui-fg-muted">{asset.description}</Text>
                    )}
                    <Text size="xsmall" className="text-ui-fg-subtle font-mono">{asset.original_filename}</Text>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Badge size="2xsmall" color="grey">{asset.mime_type}</Badge>
                </Table.Cell>
                <Table.Cell>
                  <Text size="small">{formatBytes(asset.size_bytes)}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text size="small" className="text-ui-fg-muted">
                    {new Date(asset.created_at).toLocaleDateString()}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => startEdit(asset)}
                    >
                      {t("common.edit")}
                    </Button>
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() => handleDelete(asset)}
                    >
                      {t("common.delete")}
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-ui-border-base">
          <Text size="small" className="text-ui-fg-muted">
            {total} 个文件
          </Text>
          <div className="flex gap-2">
            <Button
              size="small"
              variant="secondary"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              上一页
            </Button>
            <Text size="small" className="self-center text-ui-fg-muted">
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
        </div>
      )}
    </Container>
  )
}

export default FileAssetsPage
