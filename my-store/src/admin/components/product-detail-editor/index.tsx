import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react"
import { Node, mergeAttributes } from "@tiptap/core"
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

// ─── Image upload placeholder node ───────────────────────────────────────────

function ImageUploadingView() {
  return (
    <NodeViewWrapper>
      <div
        contentEditable={false}
        className="my-2 select-none rounded border border-ui-border-base bg-ui-bg-subtle px-4 py-3"
      >
        <p className="mb-1.5 text-xs text-ui-fg-muted">正在上传图片…</p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-ui-bg-component">
          <div className="h-full animate-pulse rounded-full bg-ui-fg-interactive" style={{ width: "55%" }} />
        </div>
      </div>
    </NodeViewWrapper>
  )
}

const ImageUploadPlaceholderNode = Node.create({
  name: "imageUploadPlaceholder",
  group: "block",
  atom: true,
  addAttributes() {
    return { uploadId: { default: null } }
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes({ "data-type": "image-upload-placeholder", "data-upload-id": HTMLAttributes.uploadId })]
  },
  parseHTML() {
    return [{ tag: 'div[data-type="image-upload-placeholder"]' }]
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageUploadingView)
  },
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

function replacePlaceholder(
  editor: ReturnType<typeof useEditor>,
  uploadId: string,
  replacement: "image" | "remove",
  imageUrl?: string
) {
  if (!editor) return
  const { state } = editor
  let foundPos = -1
  let foundSize = 0
  state.doc.descendants((node, pos) => {
    if (foundPos !== -1) return false
    if (node.type.name === "imageUploadPlaceholder" && node.attrs.uploadId === uploadId) {
      foundPos = pos
      foundSize = node.nodeSize
    }
  })
  if (foundPos === -1) return
  if (replacement === "image" && imageUrl) {
    const imageNode = editor.state.schema.nodes.image?.create({ src: imageUrl })
    if (imageNode) {
      editor.view.dispatch(editor.state.tr.replaceWith(foundPos, foundPos + foundSize, imageNode))
    }
  } else {
    editor.view.dispatch(editor.state.tr.delete(foundPos, foundPos + foundSize))
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

type ProductDetailEditorProps = {
  value: string
  onChange: (html: string) => void
  /** Optional image upload handler. When provided, pasting/dropping images and
   *  clicking the image toolbar button will trigger upload instead of URL prompt.
   *  Should return the public URL to embed in the editor. */
  onImageUpload?: (file: File) => Promise<string>
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProductDetailEditor({ value, onChange, onImageUpload }: ProductDetailEditorProps) {
  const { t } = useTranslation()
  const [isSourceMode, setIsSourceMode] = useState(false)
  const [sourceHtml, setSourceHtml] = useState(value)

  const onImageUploadRef = useRef(onImageUpload)
  useEffect(() => { onImageUploadRef.current = onImageUpload }, [onImageUpload])

  // Always-current ref to the editor instance (safe to read inside async callbacks)
  const editorRef = useRef<ReturnType<typeof useEditor>>(null)

  // Ref to the centralised upload handler so paste/drop closures always see latest version
  const doUploadRef = useRef<((file: File) => void) | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
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
      ImageUploadPlaceholderNode,
    ],
    content: value,
    editorProps: {
      handlePaste(_view, event) {
        if (!doUploadRef.current) return false
        const items = event.clipboardData?.items
        if (!items) return false
        for (const item of Array.from(items)) {
          if (item.type.startsWith("image/")) {
            event.preventDefault()
            const file = item.getAsFile()
            if (!file) continue
            doUploadRef.current(file)
            return true
          }
        }
        return false
      },
      handleDrop(_view, event) {
        if (!doUploadRef.current) return false
        const files = (event as DragEvent).dataTransfer?.files
        if (!files?.length) return false
        for (const file of Array.from(files)) {
          if (file.type.startsWith("image/")) {
            event.preventDefault()
            doUploadRef.current(file)
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

  // Keep editorRef current
  useEffect(() => { editorRef.current = editor }, [editor])

  // Centralised: insert placeholder → upload → replace with image
  const handleImageUpload = useCallback((file: File) => {
    const uploadFn = onImageUploadRef.current
    const ed = editorRef.current
    if (!uploadFn || !ed) return

    const uploadId = crypto.randomUUID()
    ed.chain().focus().insertContent({ type: "imageUploadPlaceholder", attrs: { uploadId } }).run()

    uploadFn(file)
      .then((url) => {
        replacePlaceholder(editorRef.current, uploadId, "image", url)
      })
      .catch(() => {
        replacePlaceholder(editorRef.current, uploadId, "remove")
        toast.error(t("productDetail.imageUploadFailed", "图片上传失败"))
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps — reads via refs; intentionally stable

  // Sync doUploadRef whenever upload capability changes
  useEffect(() => {
    doUploadRef.current = onImageUpload ? handleImageUpload : null
  }, [onImageUpload, handleImageUpload])

  // Sync external value changes into editor
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
      editor.commands.setContent(sourceHtml, { emitUpdate: false })
    } else if (editor) {
      setSourceHtml(editor.getHTML())
    }
    setIsSourceMode((prev) => !prev)
  }, [isSourceMode, editor, sourceHtml])

  return (
    <div className="border border-ui-border-base rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-ui-bg-subtle px-2 py-1 border-b border-ui-border-base">
        <EditorToolbar
          editor={editor}
          onImageUpload={onImageUpload}
          onUploadFile={onImageUpload ? handleImageUpload : undefined}
        />
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
