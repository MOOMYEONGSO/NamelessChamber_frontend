import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import classes from "./PostSubmitPage.module.css";
import FullscreenToggleButton from "../../../components/fullsrceen/FullscreenToggleButton";
import { PATHS } from "../../../constants/path";
import type { UiType } from "../types/typeMap";
import { SUBMIT_LOADING_MESSAGE } from "../../../constants/messages";

type State = {
  type?: UiType;
  tags?: string[];
  stayMs?: number;
  message?: string;
  showCalendar?: boolean;
  streakState?: {
    calendar: { weekStart: string; days: boolean[]; counts: number[] };
    coin: number;
    totalPosts: number;
    postId: string;
    tags?: string[];
  };
};

function PostSubmitPage() {
  const nav = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as State;

  const { type: urlTypeParam } = useParams<{ type: UiType }>();
  const routeType = urlTypeParam ?? state.type ?? "public";

  const stayMs = state.stayMs ?? 1600;
  const message = state.message ?? SUBMIT_LOADING_MESSAGE;

  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (state.showCalendar) {
        nav(PATHS.POST_STREAK_TYPE(routeType), {
          replace: true,
          state: {
            ...state.streakState,
            tags: state.tags,
          },
        });
      } else {
        // 캘린더가 없어도 랜덤 리롤 페이지로 이동
        nav(PATHS.POST_REROLL_TYPE(routeType), {
          replace: true,
          state: {
            tags: state.tags,
          },
        });
      }
    }, stayMs);
    return () => clearTimeout(t);
  }, [
    nav,
    routeType,
    stayMs,
    state.showCalendar,
    state.streakState,
    state.tags,
  ]);

  return (
    <main
      className={classes.wrap}
      ref={wrapRef}
      aria-live="polite"
      aria-busy="true"
    >
      <div className={classes.fullscreenBtn}>
        <FullscreenToggleButton alwaysHoverStyle targetRef={wrapRef} />
      </div>
      <p className={classes.message}>{message}</p>
    </main>
  );
}

export default PostSubmitPage;
