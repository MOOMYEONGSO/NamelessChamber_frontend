import { getRandomUserOverlayUrl } from "../../utils/overlayImages";
import { useMemo } from "react";
import classes from "./CommentSection.module.css";
import type { Comment } from "../../types/types";
import deleteIcon from "../../../../assets/icons/icon_delete.svg";

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
        >
          <img src={deleteIcon} alt="삭제" />
        </button>
      )}
    </li>
  );
}
export default CommentItem;
