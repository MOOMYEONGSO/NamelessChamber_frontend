import { getRandomUserOverlayUrl } from "../../utils/overlayImages";
import { useMemo } from "react";
import classes from "./CommentSection.module.css";
import type { Comment } from "../../types/types";
import DeleteIcon from "../../../../assets/icons/DeleteIcon";

function CommentItem({
  comment,
  onDelete,
}: {
  comment: Comment;
  onDelete: (commentId: string) => void;
}) {
  const overlayUrl = useMemo(() => getRandomUserOverlayUrl(), []);

  return (
    <li className={classes.item}>
      <div className={classes.itemMain}>
        <div className={classes.overlay}>
          {overlayUrl && (
            <img src={overlayUrl} alt="익명" className={classes.overlayImage} />
          )}
        </div>
        <div className={classes.contentWrapper}>
          <p className={classes.content}>{comment.content}</p>
        </div>
      </div>
      {comment.mine && (
        <button
          className={classes.deleteButton}
          onClick={() => onDelete(comment.commentId)}
          aria-label="삭제"
        >
          <DeleteIcon />
        </button>
      )}
    </li>
  );
}
export default CommentItem;
