import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import { useState, useEffect, useCallback, useRef } from "react"
import { useTranslation } from "react-i18next"
import EditorToolbar from "./toolbar"
import { toast } from "@medusajs/ui"

type ProductDetailEditorProps = {
  value: string
  onChange: (html: string) => void
  /** Optional image upload handler. When provided, pasting/dropping images and
   *  clicking the image toolbar button will trigger upload instead of URL prompt.
   *  Receives the File and must return the URL to embed in the editor. */
  onImageUpload?: (file: File) => Promise<string>
}

export default function ProductDetailEditor({ value, onChange, onImageUpload }: ProductDetailEditorProps) {
  const { t } = useTranslation()
  const [isSourceMode, setIsSourceMode] = useState(false)
  const [sourceHtml, setSourceHtml] = useState(value)

  // Keep upload callback in a ref so editorProps closure always has the latest version
  const onImageUploadRef = useRef(onImageUpload)
  useEffect(() => { onImageUploadRef.current = onImageUpload }, [onImageUpload])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      TextStyle,
      Color,
    ],
    content: value,
    editorProps: {
      handlePaste(view, event) {
        const uploadFn = onImageUploadRef.current
        if (!uploadFn) return false
        const items = event.clipboardData?.items
        if (!items) return false
        for (const item of Array.from(items)) {
          if (item.type.startsWith("image/")) {
            event.preventDefault()
            const file = item.getAsFile()
            if (!file) continue
            uploadFn(file)
              .then((url) => {
                const node = view.state.schema.nodes.image?.create({ src: url })
                if (node) {
                  const tr = view.state.tr.replaceSelectionWith(node)
                  view.dispatch(tr)
                }
              })
              .catch(() => {
                toast.error(t("productDetail.imageUploadFailed", "Image upload failed"))
              })
            return true
          }
        }
        return false
      },
      handleDrop(view, event) {
        const uploadFn = onImageUploadRef.current
        if (!uploadFn) return false
        const files = (event as DragEvent).dataTransfer?.files
        if (!files?.length) return false
        for (const file of Array.from(files)) {
          if (file.type.startsWith("image/")) {
            event.preventDefault()
            uploadFn(file)
              .then((url) => {
                const node = view.state.schema.nodes.image?.create({ src: url })
                if (node) {
                  const tr = view.state.tr.replaceSelectionWith(node)
                  view.dispatch(tr)
                }
              })
              .catch(() => {
                toast.error(t("productDetail.imageUploadFailed", "Image upload failed"))
              })
            return true
          }
        }
        return false
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML()
      onChange(html)
      setSourceHtml(html)
    },
  })

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
      setSourceHtml(value)
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSourceChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const html = e.target.value
      setSourceHtml(html)
      onChange(html)
    },
    [onChange]
  )

  const toggleMode = useCallback(() => {
    if (isSourceMode && editor) {
      // Switching source → visual: push source HTML into editor
      editor.commands.setContent(sourceHtml, { emitUpdate: false })
    } else if (editor) {
      // Switching visual → source
      setSourceHtml(editor.getHTML())
    }
    setIsSourceMode((prev) => !prev)
  }, [isSourceMode, editor, sourceHtml])

  return (
    <div className="border border-ui-border-base rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-ui-bg-subtle px-2 py-1 border-b border-ui-border-base">
        <EditorToolbar editor={editor} onImageUpload={onImageUpload} />
        <button
          type="button"
          onClick={toggleMode}
          className="ml-2 px-2 py-1 text-xs rounded border border-ui-border-base hover:bg-ui-bg-base-hover whitespace-nowrap"
        >
          {isSourceMode
            ? t("productDetail.visualMode", "Visual")
            : t("productDetail.htmlMode", "HTML")}
        </button>
      </div>

      {isSourceMode ? (
        <textarea
          value={sourceHtml}
          onChange={handleSourceChange}
          className="w-full min-h-[300px] p-3 font-mono text-sm bg-ui-bg-base text-ui-fg-base resize-y outline-none"
          spellCheck={false}
        />
      ) : (
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none p-3 min-h-[300px] focus-within:outline-none [&_.ProseMirror]:outline-none"
        />
      )}
    </div>
  )
}
