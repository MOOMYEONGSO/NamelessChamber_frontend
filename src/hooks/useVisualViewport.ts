import { useEffect, useState } from "react";

type VisualViewportState = {
  /** 키보드 위 가시 영역 높이 */
  height: number;
  /** 가시 영역 상단 오프셋 (iOS 스크롤 보정) */
  offsetTop: number;
};

/**
 * visualViewport로 키보드 위 가시 영역(높이/상단 오프셋)을 추적한다.
 * 모바일 키보드가 열릴 때 레이아웃을 자판 위로 맞추는 용도.
 * 값이 0이면 아직 측정 전이거나 visualViewport 미지원.
 */
export function useVisualViewport(): VisualViewportState {
  const [state, setState] = useState<VisualViewportState>({
    height: 0,
    offsetTop: 0,
  });

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () =>
      setState({ height: vv.height, offsetTop: vv.offsetTop });
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return state;
}
