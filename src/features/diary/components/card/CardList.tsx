import { useMemo } from "react";
import type { DiaryPreview } from "../../types/types";
import Card from "./Card";
import { getCurrentIdentity } from "../../../auth/api/tokenStore";

const cardSizeFromId = (id: string): "sm" | "lg" =>
  id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 2 === 0
    ? "sm"
    : "lg";

type CardListProps = {
  diaries: DiaryPreview[];
  onClickCard: (postId: string) => void;
};

const CardList = ({ diaries, onClickCard }: CardListProps) => {
  const identity = useMemo(() => getCurrentIdentity(), []);

  return (
    <>
      {diaries.map((diary) => {
        const isAuthor =
          !!identity &&
          identity.role !== "ANONYMOUS" &&
          diary.userId === identity.userId;

        return (
          <li key={diary.postId}>
            <Card
              onClick={() => onClickCard(diary.postId)}
              contentPreview={diary.contentPreview ?? ""}
              isAuthor={isAuthor}
              tags={diary.tags}
              views={diary.views}
              commentCount={diary.commentCount}
              thumbnailUrl={diary.thumbnailUrl}
              size={cardSizeFromId(diary.postId)}
            />
          </li>
        );
      })}
    </>
  );
};

export default CardList;
