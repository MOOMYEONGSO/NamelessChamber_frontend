import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import classes from "./PostWritePage.module.css";
import letter from "../components/letter/Letter.module.css";
import { PATHS } from "../../../constants/path";
import { useCreatePost } from "../hooks/useCreatePost";
import { SUBMIT_LOADING_MESSAGE } from "../../../constants/messages";
import type { tags as PostTag } from "../types/tags";
import Menu from "../../../assets/icons/Menu";
import SideDrawer from "../../../components/drawer/SideDrawer";
import TagSelectScreen from "../components/tag/TagSelectScreen";
import iconMailman from "../../../assets/icons/icon_mailman.svg";
import { getCaretOffsetTop } from "../utils/textareaCaret";
import { useVisualViewport } from "../../../hooks/useVisualViewport";
import { useLetterDraft } from "../hooks/useLetterDraft";
import { useFieldIntro } from "../hooks/useFieldIntro";
import KeyboardAccessoryBar from "../components/write/KeyboardAccessoryBar";

type Step = "to" | "body" | "from";

const BODY_MIN = 30; // 본문 최소 글자수 (이상이어야 접수 가능)

function PostWritePage() {
  const navigate = useNavigate();
  const { type } = useParams<{ type?: string }>();
  const shouldRedirect = Boolean(type && type !== "text");
  const routeType = "text" as const;

  // 초안(to/body/from) 상태 + localStorage 자동 저장/복원
  const { to, setTo, body, setBody, from, setFrom, clearDraft } =
    useLetterDraft();
  // 필드 진입 안내 서브타이틀
  const { subtitle, subShown, playIntro, hideSubtitle } = useFieldIntro();

  const [step, setStep] = useState<Step>("to");
  const [showTagScreen, setShowTagScreen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  // 키보드 위 가시 영역(높이/상단 오프셋) 추적
  const { height: vh, offsetTop: vtop } = useVisualViewport();

  const toRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fromRef = useRef<HTMLInputElement>(null);
  const cardWrapRef = useRef<HTMLDivElement>(null);

  const { mutateAsync, isPending } = useCreatePost({
    onSuccess: (data, vars) => {
      clearDraft();
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

  // 진입 시 To 자동 포커스
  useEffect(() => {
    if (shouldRedirect) return;
    const t = window.setTimeout(() => toRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [shouldRedirect]);

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

  // 위/아래 버튼: 커서를 한 줄 위/아래로 이동
  // 본문 줄 사이 이동, 첫/끝 줄을 넘으면 To/From으로
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
        el === toRef.current ||
        el === bodyRef.current ||
        el === fromRef.current;
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

  const bodyCount = body.trim().length;
  const bodyOk = bodyCount >= BODY_MIN; // 30자 이상이어야 접수 가능
  const bodyRemaining = BODY_MIN - bodyCount;
  const bodyCountLabel =
    bodyRemaining > 0 ? `${bodyRemaining}자 남음` : `${-bodyRemaining}자 넘음`;
  const showReceipt = from.trim().length > 0;

  return (
    <div
      className={classes.page}
      style={vh ? { top: `${vtop}px`, height: `${vh}px` } : undefined}
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
            disabled={isPending || !bodyOk}
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

        {/* 본문 글자수: 30자 남음 → 0자 넘음 → 1자 넘음 ... */}
        <p className={classes.charCount} aria-live="polite">
          {bodyCountLabel}
        </p>
      </div>

      {focused && (
        <KeyboardAccessoryBar
          onCamera={() => navigate(PATHS.POST_NEW_IMAGE)}
          onUp={() => moveCaret(-1)}
          onDown={() => moveCaret(1)}
          upDisabled={step === "to"}
          downDisabled={step === "from"}
        />
      )}
    </div>
  );
}

export default PostWritePage;
