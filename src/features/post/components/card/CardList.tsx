import { useMemo } from "react";
import type { PostPreview } from "../../types/types";
import Card from "./Card";
import { getCurrentIdentity } from "../../../auth/api/tokenStore";

const cardSizeFromId = (id: string): "sm" | "lg" =>
  id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 2 === 0
    ? "sm"
    : "lg";

type CardListProps = {
  posts: PostPreview[];
  onClickCard: (postId: string) => void;
};

const CardList = ({ posts, onClickCard }: CardListProps) => {
  const identity = useMemo(() => getCurrentIdentity(), []);

  return (
    <>
      {posts.map((post) => {
        const isAuthor =
          !!identity &&
          identity.role !== "ANONYMOUS" &&
          post.userId === identity.userId;

        return (
          <li key={post.postId}>
            <Card
              onClick={() => onClickCard(post.postId)}
              contentPreview={post.contentPreview ?? ""}
              isAuthor={isAuthor}
              tags={post.tags}
              views={post.views}
              commentCount={post.commentCount}
              thumbnailUrl={post.thumbnailUrl}
              size={cardSizeFromId(post.postId)}
            />
          </li>
        );
      })}
    </>
  );
};

export default CardList;
