import { useRef, useState, type ChangeEvent } from "react";
import Button from "../../../components/button/Button";
import BackArrow from "../../../assets/icons/BackArrow";
import Form, { type FormHandle } from "../../../components/form/Form";
import TextArea from "../../../components/textarea/TextArea";
import classes from "./FeedbackPage.module.css";
import { useToast } from "../../../contexts/ToastContext";
import { useCreateFeedback } from "../hooks/useCreateFeedback";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../../constants/path";

const FORM_ID = "feedback-form";

function FeedbackPage() {
  const navigate = useNavigate();
  const formRef = useRef<FormHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { showToast } = useToast();
  const createFeedback = useCreateFeedback();

  const [content, setContent] = useState("");

  function handleTextChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
  }

  async function handleSave() {
    try {
      await createFeedback.mutateAsync({ content: content.trim() });

      formRef.current?.clear();
      setContent("");
      showToast("소중한 피드백 감사합니다. 빠르게 살펴볼게요!", "check");
      navigate(PATHS.PROFILE);
    } catch {
      showToast(
        "제출 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.",
        "cancel"
      );
    }
  }

  return (
    <section className={classes.feedback} ref={containerRef}>
      <header className={classes.topbar}>
        <button
          type="button"
          className={classes.back}
          onClick={() => navigate(-1)}
          aria-label="뒤로"
        >
          <BackArrow />
        </button>
      </header>

      <h2>솔직한 피드백이 좋아요!</h2>

      <Form id={FORM_ID} onSave={handleSave} ref={formRef}>
        <TextArea
          name="content"
          value={content}
          onChange={handleTextChange}
          disabled={createFeedback.isPending}
          placeholder="작성 시작..."
          required
        />

        <div className={classes.actions}>
          <Button
            type="submit"
            variant="main"
            state={content.trim().length > 0 ? "active" : "default"}
            disabled={createFeedback.isPending || content.trim().length === 0}
          >
            {createFeedback.isPending ? "전송 중..." : "무명소에 제보하기"}
          </Button>
        </div>
      </Form>
    </section>
  );
}

export default FeedbackPage;
