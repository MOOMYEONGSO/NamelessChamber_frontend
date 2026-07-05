import FadeInOnView from "../components/FadeInOnView";
import Paragraph from "../../../components/paragraph/Paragraph";
import classes from "./DiaryDetailPage.module.css";
import { useMemo, useState } from "react";
import { useDiary } from "../hooks/useDiary";
import { useParams, Navigate } from "react-router-dom";
import { formatDiaryTime } from "../../../lib/diary/formatDiaryTime";
import StoryPrompt from "../components/storyPrompt/StoryPrompt";
import { PATHS } from "../../../constants/path";
import { InlineError } from "../../../components/status/InlineStates";
import type { DiaryType, DiaryImage } from "../types/types";
import CommentSection from "../components/comment/CommentSection";
import type { Comment } from "../types/types";

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
  type?: DiaryType;
  postId?: string;
  comments?: Comment[];
  images?: DiaryImage[];
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
    <section className={`${classes.diary} ${classes.detail}`}>
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

export default function DiaryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error, refetch } = useDiary(id);

  const [retrying, setRetrying] = useState(false);

  if (!id) return <Navigate to={PATHS.DIARY_LIST} replace />;

  if (isError) {
    const message =
      error instanceof Error
        ? error.message
        : "문제가 발생했어요. 잠시 후 다시 시도해주세요.";

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
    data?.createdAt && !isLoading ? formatDiaryTime(data.createdAt) : undefined;

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
