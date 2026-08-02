import { useState } from "react";
import type { Comment } from "../../types/types";
import classes from "./CommentSection.module.css";
import { useDeleteComment } from "../../hooks/useComment";
import { useToast } from "../../../../contexts/ToastContext";
import CommentItem from "./CommentItem";
import Modal from "../../../../components/modal/Modal";
import Button from "../../../../components/button/Button";

type Props = {
  postId: string;
  comments: Comment[];
};

export default function CommentList({ postId, comments }: Props) {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const { mutateAsync: deleteComment, isPending } = useDeleteComment(postId);
  const { showToast } = useToast();

  const handleDeleteClick = (commentId: string) => {
    setDeleteTargetId(commentId);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteComment(deleteTargetId);
      showToast("댓글이 삭제되었습니다.", "info");
      setDeleteTargetId(null);
    } catch {
      showToast("삭제에 실패했습니다.", "cancel");
    }
  };

  if (comments.length === 0) return null;

  return (
    <>
      <ul className={classes.list}>
        {comments.map((comment) => (
          <CommentItem
            key={comment.commentId}
            comment={comment}
            onDelete={handleDeleteClick}
          />
        ))}
      </ul>

      <Modal isOpen={!!deleteTargetId} onClose={() => setDeleteTargetId(null)}>
        <Modal.Title>삭제 하시겠습니까?</Modal.Title>
        <Modal.Textarea>삭제한 한마디는 되돌릴 수 없습니다.</Modal.Textarea>
        <Modal.Actions>
          <Button
            variant="sub"
            onClick={() => setDeleteTargetId(null)}
            disabled={isPending}
          >
            닫기
          </Button>
          <Button
            onClick={confirmDelete}
            disabled={isPending}
            variant="solid"
            style={{
              backgroundColor: "var(--color-red)",
              color: "var(--color-gray-4)",
            }}
          >
            {isPending ? "삭제 중..." : "삭제하기"}
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
}
