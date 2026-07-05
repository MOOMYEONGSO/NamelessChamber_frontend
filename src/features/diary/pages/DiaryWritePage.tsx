import { useRef, useState, useEffect } from "react";
import Form, { type FormHandle } from "../../../components/form/Form";
import classes from "./DiaryWritePage.module.css";
import Button from "../../../components/button/Button";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../../contexts/ToastContext";
import FullscreenToggleButton from "../../../components/fullsrceen/FullscreenToggleButton";
import { useCreateDiary } from "../hooks/useCreateDiary";
import { PATHS } from "../../../constants/path";
import type { UiType } from "../types/typeMap";
import { useTopic } from "../hooks/useTopic";
import { SUBMIT_LOADING_MESSAGE } from "../../../constants/messages";
import { DIARY_TAGS } from "../constants/diaryTags";
import RichEditor from "../components/editor/RichEditor";
import type { tags as DiaryTag } from "../types/tags";
import TagSelectModal from "../components/tag/TagSelectModal";

const FORM_ID = "diary-form";
const SHORT_MIN_LENGTH = 30;
const DIARY_TAG_IDS = new Set<DiaryTag>(DIARY_TAGS.map((option) => option.id));

const isContentValid = (textLength: number, minLength: number) =>
  textLength >= minLength;

function useCurrentTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function DiaryWritePage() {
  const formRef = useRef<FormHandle>(null);
  const containerRef = useRef<HTMLElement>(null);
  const [tags, setTags] = useState<DiaryTag[]>([]);
  const [content, setContent] = useState("");
  const [count, setCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const [showTagSelect, setShowTagSelect] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();
  const now = useCurrentTime();

  const { type } = useParams<{ type: UiType }>();
  const routeType: UiType = type ?? "today";

  const DRAFT_KEY = `draft:diary-write:${routeType}`;

  const isToday = routeType === "today";

  const { data: topic, isLoading: topicLoading } = useTopic(isToday);

  const MIN_LENGTH = SHORT_MIN_LENGTH;

  const parsedTags = tags;

  const TITLE = isToday
    ? topicLoading
      ? "오늘의 주제를 불러오는 중…"
      : (topic?.title ?? "오늘의 주제를 불러오지 못했어요")
    : routeType === "public"
      ? "짧은 기록 순간의 생각을 가볍게 남겨요."
      : "마음 깊은 곳의 이야기를 꺼내보아요.";

  const PLACEHOLDER_MESSAGE = isToday
    ? "주제에 대해서 자유롭게 작성해보세요."
    : routeType === "public"
      ? "지금 떠오른 생각이나, 단 하나의 문장으로도 괜찮습니다."
      : "이곳은 나만의 일기장입니다. 솔직한 이야기를 기록해보세요.";

  const { mutateAsync } = useCreateDiary({
    onSuccess: (data) => {
      formRef.current?.clear();
      setContent("");
      setCount(0);
      setTags([]);
      setShowTagSelect(false);
      localStorage.removeItem(DRAFT_KEY);

      navigate(PATHS.DIARY_SUBMIT_TYPE(routeType), {
        replace: true,
        state: {
          type: routeType,
          tags: parsedTags,
          showCalendar: data.showCalendar && !!data.calendar,
          streakState: data.showCalendar && data.calendar
            ? {
                calendar: data.calendar,
                coin: data.coin,
                totalPosts: data.totalPosts,
                postId: data.postId,
                tags: parsedTags,
              }
            : undefined,
          stayMs: 1600,
          message: SUBMIT_LOADING_MESSAGE,
        },
      });
    },
  });

  // 초안 불러오기 — RichEditor가 올바른 initialValue로 마운트되도록 먼저 상태를 채운 후 렌더링
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          if ("content" in parsed && typeof parsed.content === "string") {
            setContent(parsed.content);
          }
          if ("tags" in parsed && Array.isArray(parsed.tags)) {
            setTags(
              parsed.tags.filter(
                (tag: unknown): tag is DiaryTag =>
                  typeof tag === "string" && DIARY_TAG_IDS.has(tag as DiaryTag),
              ),
            );
          }
        }
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, [DRAFT_KEY]);

  // 자동 임시저장
  useEffect(() => {
    if (!loaded) return;
    const id = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ content, tags }),
        );
      } catch {
        // ignore
      }
    }, 350);
    return () => clearTimeout(id);
  }, [content, tags, DRAFT_KEY, loaded]);

  const canSubmit = isContentValid(count, MIN_LENGTH);

  async function handleSave() {
    if (submitting) return;

    if (!canSubmit) {
      showToast(`${MIN_LENGTH}자 이상 입력해주세요.`, "info");
      return;
    }

    try {
      setSubmitting(true);
      await mutateAsync({
        content: content.trim(),
        tags: parsedTags,
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenConfirm() {
    if (!canSubmit) {
      showToast(`${MIN_LENGTH}자 이상 입력해주세요.`, "info");
      return;
    }
    setShowTagSelect(true);
  }

  const formattedTime = `지금은 ${now.getFullYear()}년 ${String(now.getMonth() + 1).padStart(2, "0")}월 ${String(now.getDate()).padStart(2, "0")}일 ${String(now.getHours()).padStart(2, "0")}시${String(now.getMinutes()).padStart(2, "0")}분 입니다.`;

  return (
    <section className={classes.write} ref={containerRef}>
      <div className={classes.topActions}>
        <FullscreenToggleButton
          targetRef={containerRef}
          disabled={submitting}
        />
      </div>

      <h2 className={classes.title}>{TITLE}</h2>

      <Form id={FORM_ID} onSave={handleSave} ref={formRef}>
        {loaded && (
          <RichEditor
            key={DRAFT_KEY}
            initialValue={content}
            onChange={(html, textLength) => {
              setContent(html);
              setCount(textLength);
            }}
            placeholder={PLACEHOLDER_MESSAGE}
            disabled={submitting || showTagSelect}
          />
        )}

        <div className={classes.footer}>
          <span className={classes.timeDisplay}>{formattedTime}</span>
          <span className={classes.charCount}>{count} 자</span>
          <div
            className={classes.revealWrap}
            data-ready={canSubmit}
          >
            <Button
              type="button"
              variant="sub"
              onClick={handleOpenConfirm}
              disabled={submitting || !canSubmit}
            >
              {submitting ? "보관 중..." : "작성 완료"}
            </Button>
          </div>
        </div>
      </Form>

      <TagSelectModal
        isOpen={showTagSelect}
        selectedTags={tags}
        onChange={setTags}
        onClose={() => setShowTagSelect(false)}
        onSubmit={() => void handleSave()}
        disabled={submitting}
      />
    </section>
  );
}

export default DiaryWritePage;
