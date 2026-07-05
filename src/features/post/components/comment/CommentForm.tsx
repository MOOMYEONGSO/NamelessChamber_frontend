import { useState, type ChangeEvent } from "react";
import TextArea from "../../../../components/textarea/TextArea";
import Button from "../../../../components/button/Button";
import classes from "./CommentSection.module.css";
import { useCreateComment } from "../../hooks/useComment";
import { useToast } from "../../../../contexts/ToastContext";
import Text from "../../../../components/text/Text";

type Props = {
  postId: string;
};

export default function CommentForm({ postId }: Props) {
  const [content, setContent] = useState("");
  const { mutateAsync, isPending } = useCreateComment(postId);
  const { showToast } = useToast();

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      await mutateAsync(content);
      setContent("");
      showToast("소중한 한마디가 전달되었습니다.", "info");
    } catch {
      showToast("댓글 남기기가 실패했습니다. 다시 시도해주세요.", "cancel");
    }
  };

  return (
    <div className={classes.form}>
      <div className={classes.formHeader}>
        <p className={classes.formTitle}>
          <Text variant="p1" color="gray-2">
            일기가 인상깊으셨다면, 공감과 격려의 한마디 부탁드려요.
          </Text>
        </p>
        <p className={classes.formSubtitle}>
          <Text variant="c1" color="gray-3">
            1회만 남길 수 있으니 신중하게 남겨주세요.
          </Text>
        </p>
      </div>

      <TextArea
        value={content}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          setContent(e.target.value)
        }
        placeholder="작성하신 한마디는 소중하게 전달이 됩니다"
        disabled={isPending}
      />

      <Button
        onClick={handleSubmit}
        disabled={isPending || !content.trim()}
        className={classes.submitButton}
      >
        {isPending ? "남기는 중..." : "남기기"}
      </Button>
    </div>
  );
}
