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
import { useState, useEffect, useCallback } from "react"
import { useTranslation } from "react-i18next"
import EditorToolbar from "./toolbar"

type ProductDetailEditorProps = {
  value: string
  onChange: (html: string) => void
}

export default function ProductDetailEditor({ value, onChange }: ProductDetailEditorProps) {
  const { t } = useTranslation()
  const [isSourceMode, setIsSourceMode] = useState(false)
  const [sourceHtml, setSourceHtml] = useState(value)

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
        <EditorToolbar editor={editor} />
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
