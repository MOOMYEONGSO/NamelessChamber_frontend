import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CardListContainer from "../components/card/CardListContainer";
import { useRandomDiaries } from "../hooks/useRandomDiaries";
import classes from "./DiaryRerollPage.module.css";
import type { UiType } from "../types/typeMap";
import { InlineError } from "../../../components/status/InlineStates";
import Paragraph from "../../../components/paragraph/Paragraph";
import Button from "../../../components/button/Button";
import { PATHS } from "../../../constants/path";
import { toAppError } from "../../../api/errors";

function DiaryRerollPage() {
  const { type } = useParams<{ type?: UiType }>();
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: { tags?: string[] } };
  // const routeType = type ?? "public";
  const tags = Array.isArray(state?.tags)
    ? state.tags.filter((tag): tag is string => typeof tag === "string")
    : [];
  const [rerollCount, setRerollCount] = useState(0);
  const hasUsedReroll = rerollCount >= 1;

  // 랜덤 3개 가져오기
  const { data, isLoading, isError, error, refetch } = useRandomDiaries(
    3,
    tags,
    rerollCount,
  );

  const [retrying, setRetrying] = useState(false);

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

  const diaries = data?.posts ?? [];
  const coin = data?.coin ?? 0;
  const isEmpty = !isLoading && diaries.length === 0;

  return (
    <div className={classes.container}>
      <div className={classes.header} role="note" aria-live="polite">
        <Paragraph>나와 비슷한 타인의 일기를 읽어보세요.</Paragraph>
      </div>

      <CardListContainer
        diaries={diaries}
        coin={coin}
        isLoading={isLoading}
        isEmpty={isEmpty}
        type={type}
        emptyMessage="불러올 수 있는 이야기가 없어요."
      />

      <div className={classes.footer}>
        <div className={classes.rerollWrapper}>
          <div className={classes.rerollMessage}>다가오는 글이 없으신가요?</div>
          {!hasUsedReroll ? (
            <Button
              variant="main"
              state="active"
              className={classes.rerollButton}
              onClick={() => {
                setRerollCount(1);
              }}
            >
              흘려 보내고 다시 받기
            </Button>
          ) : (
            <Button
              variant="main"
              state="active"
              className={classes.allPostsButton}
              onClick={() => navigate(PATHS.DIARY_ALL, { replace: true })}
            >
              전체 포스트 받기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DiaryRerollPage;
