import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
import classes from "./CommentSection.module.css";
import type { Comment } from "../../types/types";

type Props = {
  postId: string;
  comments: Comment[];
};

export default function CommentSection({ postId, comments }: Props) {
  return (
    <section className={classes.container}>
      <CommentForm postId={postId} />
      <CommentList postId={postId} comments={comments} />
    </section>
  );
}
