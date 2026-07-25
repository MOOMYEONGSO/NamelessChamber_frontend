import classes from "./PostDetailPage.module.css";
import letter from "../components/letter/Letter.module.css";
import { useMemo, useState } from "react";
import { usePost } from "../hooks/usePost";
import { useParams, Navigate } from "react-router-dom";
import StoryPrompt from "../components/storyPrompt/StoryPrompt";
import { PATHS } from "../../../constants/path";
import { InlineError } from "../../../components/status/InlineStates";
import type { PostType, PostImage } from "../types/types";
import CommentSection from "../components/comment/CommentSection";
import type { Comment } from "../types/types";
import { toAppError } from "../../../api/errors";

function DetailContent({
  to,
  from,
  content,
  isLoading,
  type,
  postId,
  comments = [],
  images,
}: {
  to?: string;
  from?: string;
  content?: string;
  isLoading: boolean;
  type?: PostType;
  postId?: string;
  comments?: Comment[];
  images?: PostImage[];
}) {
  const sortedImages = useMemo(
    () => (images ? [...images].sort((a, b) => a.sortOrder - b.sortOrder) : []),
    [images],
  );
  const hasImages = sortedImages.length > 0;
  const hasContent = !!content?.trim();

  return (
    <section className={`${classes.post} ${classes.detail}`}>
      {hasImages ? (
        <div className={classes.imageGrid}>
          {sortedImages.map((image, i) => (
            <img
              key={image.imageId}
              src={image.imageUrl}
              alt={`사진 ${i + 1}`}
              className={classes.detailImage}
            />
          ))}
        </div>
      ) : (
        // 편지지(줄노트) UI — 작성 편지지와 동일 양식 재활용
        <div className={letter.paper} aria-busy={isLoading}>
          {!isLoading && <p className={classes.to}>To {to}</p>}

          <div className={letter.sheet}>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={classes.paragraphSkeleton} />
              ))
            ) : hasContent ? (
              <div className={letter.body}>{content}</div>
            ) : (
              <div className={classes.empty} role="status" aria-live="polite">
                아직 내용이 없습니다.
              </div>
            )}

            {!isLoading && <p className={classes.from}>From {from}</p>}
          </div>
        </div>
      )}

      {!isLoading && postId && type === "TEXT" && (
        <CommentSection postId={postId} comments={comments} />
      )}

      <div className={classes.storyPromptWrapper}>
        <StoryPrompt
          lines={[
            "또 하나의 고백을 만나기 위해,",
            "당신의 이야기를 한 번 더 흘려보내주세요",
          ]}
          to={PATHS.HOME}
          paddingSize="large"
        />
      </div>
    </section>
  );
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error, refetch } = usePost(id);

  const [retrying, setRetrying] = useState(false);

  if (!id) return <Navigate to={PATHS.POST_ALL} replace />;

  if (isError) {
    const message =
      toAppError(error).message ??
      "문제가 발생했어요. 잠시 후 다시 시도해주세요.";

    return (
      <InlineError
        isLoading={retrying}
        onRetry={async () => {
          try {
            setRetrying(true);
            await refetch();
          } finally {
            setRetrying(false);
          }
        }}
        message={message}
      />
    );
  }

  return (
    <DetailContent
      to={data?.to}
      from={data?.from}
      content={data?.content}
      isLoading={isLoading}
      type={data?.type}
      postId={data?.postId}
      comments={data?.comments}
      images={data?.images}
    />
  );
}
