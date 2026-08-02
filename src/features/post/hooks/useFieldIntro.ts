import { useEffect, useRef, useState } from "react";

// 각 필드 첫 진입 시 1회만 재생되는 2단계 안내 서브타이틀
const INTRO: Record<"to" | "body", [string, string]> = {
  to: [
    "편지를 받을 사람을\n먼저 적어주세요",
    "이 편지는 누구에게 닿으면 좋을까요?",
  ],
  body: [
    "전하고 싶은 말을\n천천히 적어주세요",
    "문장이 정리되지 않아도 괜찮아요",
  ],
};
const INTRO_DELAY = 300; // 첫 문구 등장 지연
const INTRO_FADE = 300; // 페이드 시간
const INTRO_HOLD = 1500; // 첫 문구 유지 후 두 번째로 전환

/**
 * To/본문 첫 진입 시 안내 서브타이틀을 1회(2단계)로 재생한다.
 * subtitle/subShown로 표시하고, hideSubtitle로 즉시 숨긴다.
 */
export function useFieldIntro() {
  const [subtitle, setSubtitle] = useState("");
  const [subShown, setSubShown] = useState(false);
  const timersRef = useRef<number[]>([]);
  const doneRef = useRef<{ to: boolean; body: boolean }>({
    to: false,
    body: false,
  });

  // 언마운트 시 타이머 정리
  useEffect(
    () => () => timersRef.current.forEach((id) => clearTimeout(id)),
    [],
  );

  function clearTimers() {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  }

  function hideSubtitle() {
    clearTimers();
    setSubShown(false);
  }

  function playIntro(field: "to" | "body") {
    if (doneRef.current[field]) {
      hideSubtitle();
      return;
    }
    doneRef.current[field] = true;
    const [m0, m1] = INTRO[field];
    clearTimers();
    timersRef.current.push(
      window.setTimeout(() => {
        setSubtitle(m0);
        setSubShown(true);
      }, INTRO_DELAY),
    );
    timersRef.current.push(
      window.setTimeout(() => setSubShown(false), INTRO_DELAY + INTRO_HOLD),
    );
    timersRef.current.push(
      window.setTimeout(
        () => {
          setSubtitle(m1);
          setSubShown(true);
        },
        INTRO_DELAY + INTRO_HOLD + INTRO_FADE,
      ),
    );
  }

  return { subtitle, subShown, playIntro, hideSubtitle };
}
