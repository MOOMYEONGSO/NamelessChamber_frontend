import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import BackArrow from "../../../assets/icons/BackArrow";
import { PATHS } from "../../../constants/path";
import { useCreateFeedback } from "../hooks/useCreateFeedback";
import classes from "./FeedbackPage.module.css";

const MAX_CONTENT_LENGTH = 500;
const FEEDBACK_CATEGORIES = [
  "불편해요",
  "오류가 있어요",
  "아이디어가 있어요",
  "기타",
] as const;

type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

function FeedbackPage() {
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createFeedback = useCreateFeedback();

  const [content, setContent] = useState("");
  const [category, setCategory] = useState<FeedbackCategory | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const trimmedContent = content.trim();
  const canSubmit = trimmedContent.length > 0 && !createFeedback.isPending;

  function handleTextChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
    if (errorMessage) setErrorMessage("");
  }

  function handleCategoryClick(selectedCategory: FeedbackCategory) {
    setCategory((current) =>
      current === selectedCategory ? null : selectedCategory
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setErrorMessage("");

    const feedbackContent = category
      ? `[${category}]\n${trimmedContent}`
      : trimmedContent;

    try {
      await createFeedback.mutateAsync({ content: feedbackContent });
      setContent("");
      setCategory(null);
      setIsSubmitted(true);
    } catch {
      setErrorMessage(
        "피드백을 보내지 못했어요. 작성한 내용은 그대로 두었으니 잠시 후 다시 시도해주세요."
      );
    }
  }

  function handleWriteAgain() {
    setIsSubmitted(false);
    setErrorMessage("");
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  if (isSubmitted) {
    return (
      <section
        className={classes.success}
        aria-labelledby="feedback-success-title"
        role="status"
      >
        <div className={classes.successMark} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="m7 12.5 3.1 3L17.5 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 id="feedback-success-title">소중한 의견을 받았어요.</h1>
        <p>
          보내주신 이야기를 꼼꼼히 살펴보고
          <br />더 좋은 무명소로 보답할게요.
        </p>

        <div className={classes.successActions}>
          <button
            type="button"
            className={classes.primaryButton}
            onClick={() => navigate(PATHS.PROFILE)}
          >
            마이페이지로 돌아가기
          </button>
          <button
            type="button"
            className={classes.secondaryButton}
            onClick={handleWriteAgain}
          >
            피드백 하나 더 남기기
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={classes.feedback} aria-labelledby="feedback-page-title">
      <header className={classes.topbar}>
        <button
          type="button"
          className={classes.back}
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
        >
          <BackArrow size={22} />
        </button>
        <h1 id="feedback-page-title">피드백 보내기</h1>
        <span aria-hidden="true" />
      </header>

      <form className={classes.form} onSubmit={handleSubmit}>
        <div className={classes.content}>
          <div className={classes.intro}>
            <p className={classes.eyebrow}>무명소에게 보내는 쪽지</p>
            <h2>
              무명소를 더 좋게
              <br />만들어주세요.
            </h2>
            <p className={classes.description}>
              불편했던 점이나 떠오른 아이디어를
              <br />편하게 들려주세요.
            </p>
          </div>

          <fieldset className={classes.fieldGroup}>
            <legend>
              어떤 이야기인가요? <span>선택</span>
            </legend>
            <div className={classes.chips}>
              {FEEDBACK_CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={classes.chip}
                  aria-pressed={category === item}
                  disabled={createFeedback.isPending}
                  onClick={() => handleCategoryClick(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </fieldset>

          <div className={classes.fieldGroup}>
            <label htmlFor="feedback-content">내용을 들려주세요</label>
            <div className={classes.letter}>
              <textarea
                ref={textareaRef}
                id="feedback-content"
                name="content"
                value={content}
                onChange={handleTextChange}
                disabled={createFeedback.isPending}
                maxLength={MAX_CONTENT_LENGTH}
                placeholder="어떤 상황에서 무엇이 불편했는지 알려주시면 더 빠르게 개선할 수 있어요."
                required
              />
              <div className={classes.letterMeta}>
                <span className={classes.privacy}>
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect
                      x="5"
                      y="10"
                      width="14"
                      height="10"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  서비스 개선에만 사용돼요
                </span>
                <span className={classes.count} aria-live="polite">
                  <strong>{content.length}</strong> / {MAX_CONTENT_LENGTH}
                </span>
              </div>
            </div>

            {errorMessage && (
              <p className={classes.error} role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        </div>

        <div className={classes.footer}>
          <button
            type="submit"
            className={classes.primaryButton}
            disabled={!canSubmit}
          >
            {createFeedback.isPending ? "보내는 중..." : "피드백 보내기"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default FeedbackPage;
