import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CardListContainer from "../../../post/components/card/CardListContainer";
import classes from "../../../post/pages/PostListPage.module.css";
import { InlineError } from "../../../../components/status/InlineStates";
import Paragraph from "../../../../components/paragraph/Paragraph";
import { useAdminPosts } from "../../hooks/useAdminPosts";
import { toAppError } from "../../../../api/errors";
import type { PostPreview, PostType } from "../../../post/types/types";
import { useTodayMetrics } from "../../hooks/useTodayMetrics";
import { PATHS } from "../../../../constants/path";

function AdminPostListPage() {
  const navigate = useNavigate();
  const { type } = useParams<{ type?: string }>();

  const apiType: PostType | undefined =
    type === "text" ? "TEXT" : type === "image" ? "IMAGE" : undefined;

  const { data, isLoading, isError, error, refetch } = useAdminPosts({
    type: apiType,
  });

  const {
    data: metrics,
    isLoading: metricsLoading,
    isError: metricsIsError,
    error: metricsError,
    refetch: refetchMetrics,
  } = useTodayMetrics();

  const [retrying, setRetrying] = useState(false);
  const [metricsRetrying, setMetricsRetrying] = useState(false);

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

  const posts: PostPreview[] = (data ?? []).map((p) => ({
    postId: p.postId,
    userId: p.userId,
    type: p.type,
    from: p.from,
    to: p.to,
    contentPreview: p.content ? p.content.slice(0, 100) : "",
    contentLength: p.content ? p.content.length : 0,
    likes: p.likes,
    views: p.views,
    commentCount: p.commentCount,
    createdAt: p.createdAt,
    tags: [],
    thumbnailUrl: p.images?.[0]?.thumbnailUrl ?? null,
  }));

  const isEmpty = !isLoading && posts.length === 0;
  const totalUsers = (metrics?.members ?? 0) + (metrics?.anonymous ?? 0);
  const ratio =
    totalUsers === 0 ? 0 : ((metrics?.members ?? 0) / totalUsers) * 100;

  return (
    <div className={classes.list}>
      <div className={classes.guide} role="note" aria-live="polite">
        <Paragraph>오늘의 무명소</Paragraph>

        <div className={classes.metricsWrap}>
          {metricsIsError ? (
            <InlineError
              isLoading={metricsRetrying}
              onRetry={async () => {
                try {
                  setMetricsRetrying(true);
                  await refetchMetrics();
                } finally {
                  setMetricsRetrying(false);
                }
              }}
              message={
                toAppError(metricsError).message ??
                "오늘의 metrics를 불러오지 못했어요."
              }
            />
          ) : (
            <div className={classes.metricsBox}>
              {metricsLoading && <Paragraph>(불러오는 중…)</Paragraph>}
              {!metricsLoading && metrics && (
                <div className={classes.metricsGrid}>
                  <div>
                    <b>작성된 글</b>
                  </div>

                  <div>
                    · 텍스트 글 <b>{metrics.textPosts}</b>개 (누적{" "}
                    <b>{metrics.textTotalPosts}</b>개)
                  </div>

                  <div>
                    · 이미지 글 <b>{metrics.imagePosts}</b>개 (누적{" "}
                    <b>{metrics.imageTotalPosts}</b>개)
                  </div>

                  <div style={{ marginTop: 4 }}>
                    <b>회원 현황</b>
                  </div>

                  <div>
                    · 신규 회원가입 <b>{metrics.members}</b>명 (누적{" "}
                    <b>{metrics.totalMembers}</b>명)
                  </div>

                  <div>
                    · 익명 이용자 <b>{metrics.anonymous}</b>명
                  </div>

                  <div>
                    · 익명 대비 신규 회원 비율 <b>{ratio.toFixed(1)}%</b>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CardListContainer
        posts={posts}
        coin={0}
        isLoading={isLoading}
        isEmpty={isEmpty}
        type={undefined}
        emptyMessage="아직 등록된 글이 없어요"
        onClickCardOverride={(id) => navigate(PATHS.ADMIN_POST_DETAIL(id))}
      />
    </div>
  );
}

export default AdminPostListPage;
