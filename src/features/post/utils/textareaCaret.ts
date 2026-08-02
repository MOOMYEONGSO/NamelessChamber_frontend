// textarea 캐럿(커서)의 상단 오프셋(px)을 숨김 미러 엘리먼트로 측정한다.
// 자동 확장되는 textarea는 내부 스크롤이 없어, 바깥 컨테이너를 캐럿 위치에
// 맞춰 스크롤하려면 캐럿의 y좌표가 필요하다.
const MIRROR_PROPS = [
  "boxSizing",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "lineHeight",
  "letterSpacing",
  "textTransform",
  "wordBreak",
  "overflowWrap",
] as const;

export function getCaretOffsetTop(ta: HTMLTextAreaElement): number {
  const style = window.getComputedStyle(ta);
  const mirror = document.createElement("div");
  const s = mirror.style;

  s.position = "absolute";
  s.top = "0";
  s.left = "-9999px";
  s.visibility = "hidden";
  s.whiteSpace = "pre-wrap";
  s.overflowWrap = "break-word";
  s.width = `${ta.clientWidth}px`;
  MIRROR_PROPS.forEach((p) => {
    s[p] = style[p];
  });

  const caret = ta.selectionStart ?? ta.value.length;
  mirror.textContent = ta.value.slice(0, caret);
  // 캐럿 위치 마커 (zero-width space)
  const marker = document.createElement("span");
  marker.textContent = "​";
  mirror.appendChild(marker);

  document.body.appendChild(mirror);
  const top = marker.offsetTop;
  document.body.removeChild(mirror);
  return top;
}
