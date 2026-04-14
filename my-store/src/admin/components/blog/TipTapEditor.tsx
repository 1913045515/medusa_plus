"use client"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import Heading from "@tiptap/extension-heading"

type TipTapEditorProps = {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export function TipTapEditor({ content, onChange, placeholder = "开始写作..." }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Heading.configure({ levels: [1, 2, 3] }),
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  return (
    <div className="border border-ui-border-base rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-ui-border-base bg-ui-bg-subtle">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 text-sm rounded ${editor.isActive("bold") ? "bg-ui-bg-base-pressed" : "hover:bg-ui-bg-base-hover"}`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 text-sm rounded italic ${editor.isActive("italic") ? "bg-ui-bg-base-pressed" : "hover:bg-ui-bg-base-hover"}`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2 py-1 text-sm rounded line-through ${editor.isActive("strike") ? "bg-ui-bg-base-pressed" : "hover:bg-ui-bg-base-hover"}`}
        >
          S
        </button>
        <span className="w-px bg-ui-border-base mx-1 self-stretch" />
        {[1, 2, 3].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run()}
            className={`px-2 py-1 text-sm font-bold rounded ${editor.isActive("heading", { level }) ? "bg-ui-bg-base-pressed" : "hover:bg-ui-bg-base-hover"}`}
          >
            H{level}
          </button>
        ))}
        <span className="w-px bg-ui-border-base mx-1 self-stretch" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 text-sm rounded ${editor.isActive("bulletList") ? "bg-ui-bg-base-pressed" : "hover:bg-ui-bg-base-hover"}`}
        >
          • 列表
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 text-sm rounded ${editor.isActive("orderedList") ? "bg-ui-bg-base-pressed" : "hover:bg-ui-bg-base-hover"}`}
        >
          1. 列表
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-2 py-1 text-sm rounded ${editor.isActive("blockquote") ? "bg-ui-bg-base-pressed" : "hover:bg-ui-bg-base-hover"}`}
        >
          引用
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-2 py-1 text-sm rounded font-mono ${editor.isActive("codeBlock") ? "bg-ui-bg-base-pressed" : "hover:bg-ui-bg-base-hover"}`}
        >
          代码
        </button>
        <span className="w-px bg-ui-border-base mx-1 self-stretch" />
        <button
          type="button"
          onClick={() => {
            const url = window.prompt("图片 URL:")
            if (url) editor.chain().focus().setImage({ src: url }).run()
          }}
          className="px-2 py-1 text-sm rounded hover:bg-ui-bg-base-hover"
        >
          图片
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt("链接地址:")
            if (url) editor.chain().focus().setLink({ href: url }).run()
          }}
          className="px-2 py-1 text-sm rounded hover:bg-ui-bg-base-hover"
        >
          链接
        </button>
      </div>

      {/* Content Area */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[400px] focus-within:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[400px]"
      />
    </div>
  )
}
