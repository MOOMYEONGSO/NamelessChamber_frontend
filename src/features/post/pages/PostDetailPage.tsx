import FadeInOnView from "../components/FadeInOnView";
import Paragraph from "../../../components/paragraph/Paragraph";
import classes from "./PostDetailPage.module.css";
import { useMemo, useState } from "react";
import { usePost } from "../hooks/usePost";
import { useParams, Navigate } from "react-router-dom";
import { formatPostTime } from "../../../lib/post/formatPostTime";
import StoryPrompt from "../components/storyPrompt/StoryPrompt";
import { PATHS } from "../../../constants/path";
import { InlineError } from "../../../components/status/InlineStates";
import type { PostType, PostImage } from "../types/types";
import CommentSection from "../components/comment/CommentSection";
import type { Comment } from "../types/types";
import { toAppError } from "../../../api/errors";

function DetailContent({
  content,
  isLoading,
  createdLabel,
  type,
  postId,
  comments = [],
  images,
}: {
  content?: string;
  isLoading: boolean;
  createdLabel?: string;
  type?: PostType;
  postId?: string;
  comments?: Comment[];
  images?: PostImage[];
}) {
  const paragraphs = useMemo(() => {
    const trimmed = content?.trim();
    return trimmed ? trimmed.split(/\n{2,}/g) : [];
  }, [content]);

  const sortedImages = useMemo(
    () => (images ? [...images].sort((a, b) => a.sortOrder - b.sortOrder) : []),
    [images],
  );
  const hasImages = sortedImages.length > 0;

  return (
    <section className={`${classes.post} ${classes.detail}`}>
      {createdLabel && (
        <Paragraph className={classes.intro} aria-live="polite">
          {createdLabel}
        </Paragraph>
      )}

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
        <div className={classes.lines} aria-busy={isLoading}>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={classes.paragraphSkeleton} />
            ))
          ) : paragraphs.length > 0 ? (
            <>
              {paragraphs.map((p, i) => (
                <FadeInOnView key={i} className={classes.paragraph} once>
                  {p}
                </FadeInOnView>
              ))}
            </>
          ) : (
            <div className={classes.empty} role="status" aria-live="polite">
              아직 내용이 없습니다.
            </div>
          )}
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

  const createdLabel =
    data?.createdAt && !isLoading ? formatPostTime(data.createdAt) : undefined;

  return (
    <DetailContent
      content={data?.content}
      isLoading={isLoading}
      createdLabel={createdLabel}
      type={data?.type}
      postId={data?.postId}
      comments={data?.comments}
      images={data?.images}
    />
  );
}
