import type { Editor } from "@tiptap/react";
import classes from "./RichEditorToolbar.module.css";

const FONT_STYLES = [
  { label: "정직한", value: "'Pretendard Variable', Pretendard, sans-serif" },
  { label: "차분한", value: "'Nanum Myeongjo', serif" },
  { label: "솔직한", value: "'Nanum Brush Script', cursive" },
  { label: "결연한", value: "'East Sea Dokdo', cursive" },
];

const FONT_SIZES = [
  { label: "작게", value: "14px" },
  { label: "보통", value: "18px" },
  { label: "크게", value: "22px" },
  { label: "아주 크게", value: "28px" },
];

const AlignLeftIcon = () => (
  <svg width="14" height="12" viewBox="0 0 14 12" aria-hidden>
    <rect y="0" width="14" height="2" rx="1" fill="currentColor" />
    <rect y="5" width="9" height="2" rx="1" fill="currentColor" />
    <rect y="10" width="14" height="2" rx="1" fill="currentColor" />
  </svg>
);

const AlignCenterIcon = () => (
  <svg width="14" height="12" viewBox="0 0 14 12" aria-hidden>
    <rect y="0" width="14" height="2" rx="1" fill="currentColor" />
    <rect x="2.5" y="5" width="9" height="2" rx="1" fill="currentColor" />
    <rect y="10" width="14" height="2" rx="1" fill="currentColor" />
  </svg>
);

const AlignRightIcon = () => (
  <svg width="14" height="12" viewBox="0 0 14 12" aria-hidden>
    <rect y="0" width="14" height="2" rx="1" fill="currentColor" />
    <rect x="5" y="5" width="9" height="2" rx="1" fill="currentColor" />
    <rect y="10" width="14" height="2" rx="1" fill="currentColor" />
  </svg>
);

interface RichEditorToolbarProps {
  editor: Editor;
}

export default function RichEditorToolbar({ editor }: RichEditorToolbarProps) {
  const currentFontFamily =
    editor.getAttributes("textStyle").fontFamily ?? FONT_STYLES[0].value;
  const currentFontSize =
    editor.getAttributes("textStyle").fontSize ?? "18px";
  const currentColor =
    editor.getAttributes("textStyle").color ?? "#2a2827";

  const setFontSize = (value: string) => {
    // 매 호출마다 현재 선택 영역 기준으로 새 체인 생성 (stale chain 방지)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chain = editor.chain().focus() as any;
    if (value === "18px") {
      chain.unsetFontSize().run();
    } else {
      chain.setFontSize(value).run();
    }
  };

  return (
    <div className={classes.toolbar}>
      {/* 폰트 스타일 */}
      <div className={classes.selectWrapper}>
        <select
          className={classes.select}
          value={currentFontFamily}
          onChange={(e) =>
            editor.chain().focus().setFontFamily(e.target.value).run()
          }
        >
          {FONT_STYLES.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <span className={classes.selectArrow}>∨</span>
      </div>

      {/* 폰트 크기 */}
      <div className={classes.selectWrapper}>
        <select
          className={classes.select}
          value={currentFontSize}
          onChange={(e) => setFontSize(e.target.value)}
        >
          {FONT_SIZES.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <span className={classes.selectArrow}>∨</span>
      </div>

      <div className={classes.separator} />

      {/* 서식 버튼 */}
      <button
        type="button"
        className={`${classes.formatBtn} ${editor.isActive("bold") ? classes.active : ""}`}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="굵게 (Ctrl+B)"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        className={`${classes.formatBtn} ${editor.isActive("underline") ? classes.active : ""}`}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="밑줄 (Ctrl+U)"
      >
        <u>U</u>
      </button>
      <button
        type="button"
        className={`${classes.formatBtn} ${editor.isActive("strike") ? classes.active : ""}`}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="취소선"
      >
        <s>S</s>
      </button>
      <button
        type="button"
        className={`${classes.formatBtn} ${editor.isActive("italic") ? classes.active : ""}`}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="기울임 (Ctrl+I)"
      >
        <em>I</em>
      </button>

      <div className={classes.separator} />

      {/* 색상 피커 */}
      <label className={classes.colorLabel} title="글자 색상">
        <div
          className={classes.colorSwatch}
          style={{ backgroundColor: currentColor }}
        />
        <span className={classes.selectArrow}>∨</span>
        <input
          type="color"
          className={classes.colorInput}
          value={currentColor}
          onChange={(e) =>
            editor.chain().focus().setColor(e.target.value).run()
          }
        />
      </label>

      <div className={classes.separator} />

      {/* 정렬 버튼 */}
      <button
        type="button"
        className={`${classes.alignBtn} ${editor.isActive({ textAlign: "left" }) ? classes.active : ""}`}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        title="왼쪽 정렬"
      >
        <AlignLeftIcon />
      </button>
      <button
        type="button"
        className={`${classes.alignBtn} ${editor.isActive({ textAlign: "center" }) ? classes.active : ""}`}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        title="가운데 정렬"
      >
        <AlignCenterIcon />
      </button>
      <button
        type="button"
        className={`${classes.alignBtn} ${editor.isActive({ textAlign: "right" }) ? classes.active : ""}`}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        title="오른쪽 정렬"
      >
        <AlignRightIcon />
      </button>
    </div>
  );
}
