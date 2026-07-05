import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle, Color, FontFamily, FontSize } from "@tiptap/extension-text-style";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import RichEditorToolbar from "./RichEditorToolbar";
import classes from "./RichEditor.module.css";

interface RichEditorProps {
  initialValue: string;
  onChange: (html: string, textLength: number) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function RichEditor({
  initialValue,
  onChange,
  placeholder = "자유롭게 작성해보세요.",
  disabled = false,
}: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      // StarterKit(v3)에 underline이 이미 포함되어 있어 별도 등록 시 중복 충돌 발생
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      CharacterCount,
      Placeholder.configure({ placeholder }),
    ],
    content: initialValue,
    editable: !disabled,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML(), e.storage.characterCount.characters());
    },
  });

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  return (
    <div className={classes.container}>
      <EditorContent editor={editor} className={classes.editorContent} />
      {editor && <RichEditorToolbar editor={editor} />}
    </div>
  );
}
