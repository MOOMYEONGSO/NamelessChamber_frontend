import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import classes from "./PostWritePage.module.css";
import letter from "../components/letter/Letter.module.css";
import { PATHS } from "../../../constants/path";
import { useCreatePost } from "../hooks/useCreatePost";
import { SUBMIT_LOADING_MESSAGE } from "../../../constants/messages";
import type { tags as PostTag } from "../types/tags";
import Camera from "../../../assets/icons/Camera";
import Menu from "../../../assets/icons/Menu";
import SideDrawer from "../../../components/drawer/SideDrawer";
import TagSelectScreen from "../components/tag/TagSelectScreen";
import iconUp from "../../../assets/icons/icon_up.svg";
import iconDown from "../../../assets/icons/icon_down.svg";
import iconMailman from "../../../assets/icons/icon_mailman.svg";
import { getCaretOffsetTop } from "../utils/textareaCaret";

type Step = "to" | "body" | "from";

// 각 필드 첫 진입 시 1회만 재생되는 2단계 안내 서브타이틀
const INTRO: Record<"to" | "body", [string, string]> = {
  to: ["편지를 받을 사람을\n먼저 적어주세요", "이 편지는 누구에게 닿으면 좋을까요?"],
  body: ["전하고 싶은 말을\n천천히 적어주세요", "문장이 정리되지 않아도 괜찮아요"],
};
const INTRO_DELAY = 300; // 첫 문구 등장 지연
const INTRO_FADE = 300; // 페이드 시간
const INTRO_HOLD = 1500; // 첫 문구 유지 후 두 번째로 전환

const DRAFT_KEY = "draft:post-write:text";

function PostWritePage() {
  const navigate = useNavigate();
  const { type } = useParams<{ type?: string }>();
  const shouldRedirect = Boolean(type && type !== "text");
  const routeType = "text" as const;

  const [to, setTo] = useState("");
  const [body, setBody] = useState("");
  const [from, setFrom] = useState("");
  const [step, setStep] = useState<Step>("to");
  const [showTagScreen, setShowTagScreen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [vh, setVh] = useState(0); // 키보드 위 가시 영역 높이 (visualViewport)

  const [subtitle, setSubtitle] = useState("");
  const [subShown, setSubShown] = useState(false);

  const toRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fromRef = useRef<HTMLInputElement>(null);
  const cardWrapRef = useRef<HTMLDivElement>(null);
  const introDoneRef = useRef<{ to: boolean; body: boolean }>({
    to: false,
    body: false,
  });
  const timersRef = useRef<number[]>([]);

  const { mutateAsync, isPending } = useCreatePost({
    onSuccess: (data, vars) => {
      localStorage.removeItem(DRAFT_KEY);
      navigate(PATHS.POST_SUBMIT_TYPE(routeType), {
        replace: true,
        state: {
          type: routeType,
          tags: vars.tags,
          showCalendar: data.showCalendar && !!data.calendar,
          streakState:
            data.showCalendar && data.calendar
              ? {
                  calendar: data.calendar,
                  coin: data.coin,
                  totalPosts: data.totalPosts,
                  postId: data.postId,
                  tags: vars.tags,
                }
              : undefined,
          stayMs: 1600,
          message: SUBMIT_LOADING_MESSAGE,
        },
      });
    },
  });

  // 초안 불러오기
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const p = JSON.parse(raw) as Partial<
        Record<"to" | "body" | "from", string>
      >;
      if (typeof p.to === "string") setTo(p.to);
      if (typeof p.body === "string") setBody(p.body);
      if (typeof p.from === "string") setFrom(p.from);
    } catch {
      // ignore
    }
  }, []);

  // 초안 자동 저장 (디바운스)
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ to, body, from }));
      } catch {
        // ignore
      }
    }, 350);
    return () => clearTimeout(id);
  }, [to, body, from]);

  // 진입 시 To 자동 포커스 (onFocus에서 안내 재생)
  useEffect(() => {
    if (shouldRedirect) return;
    const t = window.setTimeout(() => toRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [shouldRedirect]);

  // 키보드 위 가시 영역 높이 추적 → 레이아웃을 자판 위로 맞춤
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setVh(vv.height);
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  // 언마운트 시 타이머 정리
  useEffect(
    () => () => timersRef.current.forEach((id) => clearTimeout(id)),
    [],
  );

  function clearIntroTimers() {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  }

  function hideSubtitle() {
    clearIntroTimers();
    setSubShown(false);
  }

  // 해당 필드를 키보드 위 영역에 보이도록 스크롤 (편지 위치 조정)
  function revealField(el: HTMLElement | null) {
    if (!el) return;
    requestAnimationFrame(() =>
      el.scrollIntoView({ block: "center", behavior: "smooth" }),
    );
  }

  // 본문 캐럿(커서)이 가시 영역에 보이도록 cardWrap을 스크롤.
  // 자동 확장 textarea는 내부 스크롤이 없어 바깥 컨테이너를 캐럿에 맞춘다.
  function scrollCaretIntoView() {
    const ta = bodyRef.current;
    const wrap = cardWrapRef.current;
    if (!ta || !wrap) return;

    const lineH = parseFloat(window.getComputedStyle(ta).lineHeight) || 40;
    const caretY = getCaretOffsetTop(ta);
    const taTop = ta.getBoundingClientRect().top;
    const wrapRect = wrap.getBoundingClientRect();
    const caretTop = taTop + caretY;
    const caretBottom = caretTop + lineH;

    if (caretBottom > wrapRect.bottom - lineH) {
      wrap.scrollTop += caretBottom - (wrapRect.bottom - lineH);
    } else if (caretTop < wrapRect.top + lineH) {
      wrap.scrollTop -= wrapRect.top + lineH - caretTop;
    }
  }

  // 진입 안내 서브타이틀 1회 재생 (2단계). 이미 본 필드면 재생 안 함
  function playIntro(field: "to" | "body") {
    if (introDoneRef.current[field]) {
      hideSubtitle();
      return;
    }
    introDoneRef.current[field] = true;
    const [m0, m1] = INTRO[field];
    clearIntroTimers();
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
      window.setTimeout(() => {
        setSubtitle(m1);
        setSubShown(true);
      }, INTRO_DELAY + INTRO_HOLD + INTRO_FADE),
    );
  }

  function onFocusField(field: Step) {
    setStep(field);
    setFocused(true);
    if (field === "body") {
      // 본문은 캐럿 위치 기준으로 스크롤 (전체 중앙 정렬 시 캐럿이 가려질 수 있음)
      requestAnimationFrame(scrollCaretIntoView);
    } else {
      revealField(field === "to" ? toRef.current : fromRef.current);
    }
    if (field === "from") hideSubtitle();
    else playIntro(field);
  }

  function focusBodyAt(pos: number) {
    const ta = bodyRef.current;
    if (!ta) return;
    ta.focus();
    const p = Math.max(0, Math.min(pos, ta.value.length));
    requestAnimationFrame(() => {
      ta.setSelectionRange(p, p);
      scrollCaretIntoView();
    });
  }

  // 위/아래 버튼: 커서를 한 줄 위/아래로 이동 (편집은 커서 위치에서).
  // 본문 줄 사이 이동, 첫/끝 줄을 넘으면 To/From으로 (콘텐츠 범위 안에서만)
  function moveCaret(dir: -1 | 1) {
    const active = document.activeElement;

    if (active === toRef.current) {
      if (dir === 1) focusBodyAt(0);
      return;
    }
    if (active === fromRef.current) {
      if (dir === -1) focusBodyAt(bodyRef.current?.value.length ?? 0);
      return;
    }

    const ta = bodyRef.current;
    if (!ta) return;
    const val = ta.value;
    const pos = ta.selectionStart ?? 0;
    const lineStart = val.lastIndexOf("\n", pos - 1) + 1;
    const col = pos - lineStart;

    if (dir === -1) {
      if (lineStart === 0) {
        // 본문 첫 줄 → To 끝으로
        const to = toRef.current;
        to?.focus();
        const end = to?.value.length ?? 0;
        requestAnimationFrame(() => to?.setSelectionRange(end, end));
        return;
      }
      const prevStart = val.lastIndexOf("\n", lineStart - 2) + 1;
      const newPos = Math.min(prevStart + col, lineStart - 1);
      ta.setSelectionRange(newPos, newPos);
      requestAnimationFrame(scrollCaretIntoView);
    } else {
      const lineEnd = val.indexOf("\n", pos);
      if (lineEnd === -1) {
        // 본문 마지막 줄 → From 끝으로
        const fr = fromRef.current;
        fr?.focus();
        const end = fr?.value.length ?? 0;
        requestAnimationFrame(() => fr?.setSelectionRange(end, end));
        return;
      }
      const nextStart = lineEnd + 1;
      const nextNl = val.indexOf("\n", nextStart);
      const nextEnd = nextNl === -1 ? val.length : nextNl;
      const newPos = Math.min(nextStart + col, nextEnd);
      ta.setSelectionRange(newPos, newPos);
      requestAnimationFrame(scrollCaretIntoView);
    }
  }

  function handleFieldBlur() {
    window.setTimeout(() => {
      const el = document.activeElement;
      const inFields =
        el === toRef.current || el === bodyRef.current || el === fromRef.current;
      if (!inFields) setFocused(false);
    }, 0);
  }

  function handleBodyChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const el = e.target;
    setBody(el.value);
    // 자동 높이 확장
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
    hideSubtitle();
    // 입력 중인 캐럿 줄이 보이도록 스크롤
    requestAnimationFrame(scrollCaretIntoView);
  }

  function handleSubmit(tag: PostTag) {
    if (isPending) return;
    void mutateAsync({
      to: to.trim() || undefined,
      from: from.trim() || undefined,
      content: body.trim(),
      tags: [tag],
    });
  }

  if (shouldRedirect) {
    return <Navigate to={PATHS.POST_ALL} replace />;
  }

  if (showTagScreen) {
    return (
      <TagSelectScreen
        onSubmit={handleSubmit}
        onClose={() => setShowTagScreen(false)}
        submitting={isPending}
      />
    );
  }

  const showReceipt = from.trim().length > 0;

  return (
    <div
      className={classes.page}
      style={vh ? { height: `${vh}px` } : undefined}
    >
      <header className={classes.topbar}>
        <button
          type="button"
          className={classes.iconBtn}
          onClick={() => setIsDrawerOpen(true)}
          aria-label="메뉴 열기"
          aria-expanded={isDrawerOpen}
        >
          <Menu />
        </button>

        {showReceipt && (
          <button
            type="button"
            className={classes.receipt}
            onClick={() => setShowTagScreen(true)}
            disabled={isPending}
          >
            <img src={iconMailman} alt="" className={classes.receiptIcon} />
            <span>접수</span>
          </button>
        )}
      </header>

      <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <div className={classes.subtitleArea}>
        <p
          className={`${classes.subtitle} ${subShown ? classes.subShown : ""}`}
          aria-live="polite"
        >
          {subtitle}
        </p>
      </div>

      <div className={classes.cardWrap} ref={cardWrapRef}>
        {/* 편지지 양식은 Letter.module.css(줄노트/타이포/여백) 재활용 */}
        <div className={letter.paper}>
          <div className={letter.sheet}>
            <p className={`${letter.to} ${classes.lineRow}`}>
              <span className={classes.prefixLabel}>To.</span>
              <input
                ref={toRef}
                className={classes.inlineInput}
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  hideSubtitle();
                }}
                onFocus={() => onFocusField("to")}
                onBlur={handleFieldBlur}
                placeholder="혼자라고 느끼는 사람에게"
                autoComplete="off"
                enterKeyHint="next"
              />
            </p>

            <div className={`${letter.body} ${classes.bodyRow}`}>
              <textarea
                ref={bodyRef}
                className={classes.inlineBody}
                value={body}
                onChange={handleBodyChange}
                onFocus={() => onFocusField("body")}
                onBlur={handleFieldBlur}
                placeholder="지금 떠오르는 말부터 적어보세요"
                rows={1}
              />
            </div>

            <p className={`${letter.from} ${classes.lineRow}`}>
              <span className={classes.prefixLabel}>From.</span>
              <input
                ref={fromRef}
                className={classes.inlineInput}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                onFocus={() => onFocusField("from")}
                onBlur={handleFieldBlur}
                placeholder="지금의 나를 한 문장으로"
                autoComplete="off"
              />
            </p>
          </div>
        </div>
      </div>

      {focused && (
        <div className={classes.kbBar}>
          <button
            type="button"
            className={classes.kbCamera}
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => navigate(PATHS.POST_NEW_IMAGE)}
            aria-label="이미지 등록"
          >
            <Camera />
          </button>

          <div className={classes.kbNav}>
            <button
              type="button"
              className={classes.kbBtn}
              onPointerDown={(e) => {
                e.preventDefault();
                moveCaret(-1);
              }}
              disabled={step === "to"}
              aria-label="커서 한 줄 위로"
            >
              <img src={iconUp} alt="" className={classes.kbIcon} />
            </button>
            <button
              type="button"
              className={classes.kbBtn}
              onPointerDown={(e) => {
                e.preventDefault();
                moveCaret(1);
              }}
              disabled={step === "from"}
              aria-label="커서 한 줄 아래로"
            >
              <img src={iconDown} alt="" className={classes.kbIcon} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostWritePage;
