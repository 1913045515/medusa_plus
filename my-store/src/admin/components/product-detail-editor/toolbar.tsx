import { Button, clx } from "@medusajs/ui"
import type { Editor } from "@tiptap/react"
import { useTranslation } from "react-i18next"

type ToolbarProps = {
  editor: Editor | null
}

const ToolbarButton = ({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={clx(
      "p-1.5 rounded text-xs font-mono border border-transparent hover:bg-ui-bg-base-hover",
      active && "bg-ui-bg-base-pressed border-ui-border-base font-bold"
    )}
  >
    {children}
  </button>
)

export default function EditorToolbar({ editor }: ToolbarProps) {
  const { t } = useTranslation()
  if (!editor) return null

  const addImage = () => {
    const url = window.prompt(t("productDetail.imageUrlPrompt", "Image URL"))
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  const addLink = () => {
    const url = window.prompt(t("productDetail.linkUrlPrompt", "Link URL"))
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }

  return (
    <div className="flex flex-wrap gap-0.5 border-b border-ui-border-base p-1.5 bg-ui-bg-subtle">
      {/* Text formatting */}
      <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title={t("productDetail.bold", "Bold")}>
        B
      </ToolbarButton>
      <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title={t("productDetail.italic", "Italic")}>
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title={t("productDetail.underline", "Underline")}>
        <u>U</u>
      </ToolbarButton>

      <span className="w-px bg-ui-border-base mx-1" />

      {/* Headings */}
      {([1, 2, 3, 4] as const).map((level) => (
        <ToolbarButton
          key={level}
          active={editor.isActive("heading", { level })}
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
          title={`H${level}`}
        >
          H{level}
        </ToolbarButton>
      ))}

      <span className="w-px bg-ui-border-base mx-1" />

      {/* Lists */}
      <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title={t("productDetail.bulletList", "Bullet List")}>
        • ―
      </ToolbarButton>
      <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title={t("productDetail.orderedList", "Ordered List")}>
        1.
      </ToolbarButton>

      <span className="w-px bg-ui-border-base mx-1" />

      {/* Block */}
      <ToolbarButton active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title={t("productDetail.quote", "Quote")}>
        ""
      </ToolbarButton>
      <ToolbarButton active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title={t("productDetail.codeBlock", "Code Block")}>
        {"</>"}
      </ToolbarButton>

      <span className="w-px bg-ui-border-base mx-1" />

      {/* Table */}
      <ToolbarButton
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        title={t("productDetail.insertTable", "Insert Table")}
      >
        ⊞
      </ToolbarButton>

      {/* Image & Link */}
      <ToolbarButton onClick={addImage} title={t("productDetail.insertImage", "Insert Image")}>
        🖼
      </ToolbarButton>
      <ToolbarButton active={editor.isActive("link")} onClick={addLink} title={t("productDetail.insertLink", "Insert Link")}>
        🔗
      </ToolbarButton>

      <span className="w-px bg-ui-border-base mx-1" />

      {/* Align */}
      {(["left", "center", "right"] as const).map((align) => (
        <ToolbarButton
          key={align}
          active={editor.isActive({ textAlign: align })}
          onClick={() => editor.chain().focus().setTextAlign(align).run()}
          title={align}
        >
          {{ left: "⫷", center: "⫿", right: "⫸" }[align]}
        </ToolbarButton>
      ))}
    </div>
  )
}
