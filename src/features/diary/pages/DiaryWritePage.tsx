import { useRef, useState, useEffect, type ChangeEvent } from "react";
import Form, { type FormHandle } from "../../../components/form/Form";
import textAreaClasses from "../../../components/textarea/TextArea.module.css";
import classes from "./DiaryWritePage.module.css";
import Button from "../../../components/button/Button";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "../../../components/modal/Modal";
import { useToast } from "../../../contexts/ToastContext";
import FullscreenToggleButton from "../../../components/fullsrceen/FullscreenToggleButton";
import { useCreateDiary } from "../hooks/useCreateDiary";
import { PATHS } from "../../../constants/path";
import {
  API_TO_UI,
  UI_TO_API,
  type ApiType,
  type UiType,
} from "../types/typeMap";
import { useTopic } from "../hooks/useTopic";
import { SUBMIT_LOADING_MESSAGE } from "../../../constants/messages";
import TagButton from "../components/tag/TagButton";
import { DIARY_TAGS } from "../constants/diaryTags";
import RichEditor from "../components/editor/RichEditor";

const FORM_ID = "diary-form";
const SHORT_MIN_LENGTH = 30;
const LONG_MIN_LENGTH = 100;

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
  const [tags, setTags] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [count, setCount] = useState(0);
  const [title, setTitle] = useState("");
  const [loaded, setLoaded] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showTagSelect, setShowTagSelect] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();
  const now = useCurrentTime();

  const { type } = useParams<{ type: UiType }>();
  const diaryType: ApiType =
    type && UI_TO_API[type] ? UI_TO_API[type] : "MOOMYEONGSO";

  const DRAFT_KEY = `draft:diary-write:${diaryType}`;

  const isToday = type === "today";

  const { data: topic, isLoading: topicLoading } = useTopic(isToday);

  const MIN_LENGTH = diaryType === "DIARY" ? LONG_MIN_LENGTH : SHORT_MIN_LENGTH;

  const parsedTags = tags;

  const TITLE = isToday
    ? topicLoading
      ? "오늘의 주제를 불러오는 중…"
      : (topic?.title ?? "오늘의 주제를 불러오지 못했어요")
    : diaryType === "MOOMYEONGSO"
      ? "짧은 기록 순간의 생각을 가볍게 남겨요."
      : "마음 깊은 곳의 이야기를 꺼내보아요.";

  const PLACEHOLDER_MESSAGE = isToday
    ? "주제에 대해서 자유롭게 작성해보세요."
    : diaryType === "MOOMYEONGSO"
      ? "지금 떠오른 생각이나, 단 하나의 문장으로도 괜찮습니다."
      : "이곳은 나만의 일기장입니다. 솔직한 이야기를 기록해보세요.";

  const { mutateAsync } = useCreateDiary({
    onSuccess: (data) => {
      formRef.current?.clear();
      setTitle("");
      setContent("");
      setCount(0);
      setTags([]);
      localStorage.removeItem(DRAFT_KEY);

      const typeLower = API_TO_UI[diaryType];
      navigate(PATHS.DIARY_SUBMIT_TYPE(typeLower), {
        replace: true,
        state: {
          type: typeLower,
          tags: parsedTags,
          showCalendar: data.showCalendar,
          streakState: data.showCalendar
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
          if ("title" in parsed && typeof parsed.title === "string") {
            setTitle(parsed.title);
          }
          if ("content" in parsed && typeof parsed.content === "string") {
            setContent(parsed.content);
          }
          if ("tags" in parsed && Array.isArray(parsed.tags)) {
            setTags(parsed.tags);
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
          JSON.stringify({ title, content, tags }),
        );
      } catch {
        // ignore
      }
    }, 350);
    return () => clearTimeout(id);
  }, [title, content, tags, DRAFT_KEY, loaded]);

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
        title: title.trim(),
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
            disabled={submitting || showTagSelect || showConfirm}
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
              onClick={handleOpenConfirm}
              disabled={submitting || !canSubmit}
            >
              {submitting ? "보관 중..." : "작성 완료"}
            </Button>
          </div>
        </div>
      </Form>

      {/* 태그 선택 모달 */}
      <Modal isOpen={showTagSelect} onClose={() => setShowTagSelect(false)}>
        <Modal.Title>작성한 이야기는 어떠한 내용인가요?</Modal.Title>
        <div className={classes.tagContainer}>
          {DIARY_TAGS.map((option) => (
            <TagButton
              key={option.id}
              id={option.id}
              title={option.title}
              subtitle={option.subtitle}
              image={option.image}
              isSelected={tags.includes(option.id)}
              onClick={() => {
                if (tags.includes(option.id)) {
                  setTags(tags.filter((t) => t !== option.id));
                } else if (tags.length < 2) {
                  setTags([...tags, option.id]);
                } else {
                  setTags([tags[0], option.id]);
                }
              }}
            />
          ))}
        </div>
        <Modal.Actions>
          <Button
            type="button"
            alwaysHoverStyle
            variant="main"
            state="default"
            onClick={() => setShowTagSelect(false)}
          >
            닫기
          </Button>
          <Button
            type="button"
            alwaysHoverStyle
            variant="main"
            state={tags.length > 0 ? "active" : "default"}
            disabled={tags.length === 0}
            className={tags.length > 0 ? classes.activeNextButton : undefined}
            onClick={() => {
              setShowTagSelect(false);
              setShowConfirm(true);
            }}
          >
            다음
          </Button>
        </Modal.Actions>
      </Modal>

      {/* 제목 작성 모달 */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)}>
        <Modal.Title id="submit-title">작성하신 글을 정리해볼까요?</Modal.Title>
        <Modal.Textarea
          name="title"
          form={FORM_ID}
          placeholder="제목 작성하기"
          value={title}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setTitle(e.target.value)
          }
          disabled={submitting}
          className={textAreaClasses.textarea}
        />
        <Modal.Actions>
          <Button
            type="button"
            alwaysHoverStyle
            variant="main"
            state="default"
            onClick={() => setShowConfirm(false)}
          >
            닫기
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            alwaysHoverStyle
            variant="main"
            state="default"
            disabled={submitting || !title.trim()}
          >
            완료하기
          </Button>
        </Modal.Actions>
      </Modal>
    </section>
  );
}

export default DiaryWritePage;
